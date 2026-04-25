#!/usr/bin/env bash
set -euo pipefail

target="${1:-generic}"
event="${2:-}"
root="${HARNESS_PROJECT_ROOT:-$(pwd)}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
active_root="$root/planning/active"

json_escape() {
  node -e 'let input = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", chunk => { input += chunk; }); process.stdin.on("end", () => { process.stdout.write(JSON.stringify(input)); });'
}

active_task_dirs() {
  if [ ! -d "$active_root" ]; then
    return 0
  fi

  for task_dir in "$active_root"/*; do
    [ -d "$task_dir" ] || continue
    plan="$task_dir/task_plan.md"
    [ -f "$plan" ] || continue
    if grep -Eq '^Status:[[:space:]]*active$' "$plan"; then
      printf '%s\n' "$task_dir"
    fi
  done
}

session_sidecar_path() {
  printf '%s/.session-start' "$1"
}

write_session_sidecar() {
  local task_dir="$1"
  printf '%s000' "$(date +%s)" > "$(session_sidecar_path "$task_dir")"
}

read_session_sidecar() {
  local task_dir="$1"
  local sidecar
  sidecar="$(session_sidecar_path "$task_dir")"
  if [ ! -f "$sidecar" ]; then
    return 0
  fi

  tr -d '[:space:]' < "$sidecar"
}

clear_session_sidecar() {
  local task_dir="$1"
  rm -f "$(session_sidecar_path "$task_dir")"
}

emit_context() {
  context="$1"
  hook_event="$2"
  if [ -z "$context" ]; then
    printf '{}\n'
    return 0
  fi

  escaped="$(printf '%s' "$context" | json_escape)"
  case "$target" in
    codex)
      printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":%s}}\n' "$hook_event" "$escaped"
      ;;
    cursor)
      if [ "$event" = "pre-tool-use" ]; then
        printf '%s\n' "$context" >&2
        printf '{"decision":"allow"}\n'
      else
        printf '{"additional_context":%s}\n' "$escaped"
      fi
      ;;
    copilot)
      if [ "$event" = "pre-tool-use" ]; then
        printf '{"hookSpecificOutput":{"hookEventName":"%s","permissionDecision":"allow","additionalContext":%s}}\n' "$hook_event" "$escaped"
      else
        printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":%s}}\n' "$hook_event" "$escaped"
      fi
      ;;
    claude-code)
      printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":%s}}\n' "$hook_event" "$escaped"
      ;;
    *)
      printf '{"additionalContext":%s}\n' "$escaped"
      ;;
  esac
}

task_count=0
task_dir=""
while IFS= read -r active_task_dir; do
  [ -n "$active_task_dir" ] || continue
  task_count=$((task_count + 1))
  if [ "$task_count" -eq 1 ]; then
    task_dir="$active_task_dir"
  fi
done <<EOF
$(active_task_dirs)
EOF

if [ "$task_count" -eq 0 ]; then
  printf '{}\n'
  exit 0
fi

if [ "$task_count" -gt 1 ]; then
  emit_context "[planning-with-files] Multiple active tasks found under planning/active. Inspect the task directories before proceeding." "$event"
  exit 0
fi

plan="$task_dir/task_plan.md"
findings="$task_dir/findings.md"
progress="$task_dir/progress.md"
hot_context_helper="$script_dir/render-hot-context.mjs"
summary_helper="$script_dir/render-session-summary.mjs"

render_hot_context() {
  node "$hot_context_helper" "$plan" "$findings" "$progress"
}

render_session_summary() {
  local sidecar_epoch
  sidecar_epoch="$(read_session_sidecar "$task_dir")"
  node "$summary_helper" "$plan" "$findings" "$progress" "${sidecar_epoch:-}"
}

case "$event" in
  session-start)
    write_session_sidecar "$task_dir"
    context="$(render_hot_context)"
    emit_context "$context" "SessionStart"
    ;;
  user-prompt-submit)
    context="$(render_hot_context)"
    emit_context "$context" "UserPromptSubmit"
    ;;
  pre-tool-use)
    context="$(render_hot_context)"
    emit_context "$context" "PreToolUse"
    ;;
  post-tool-use)
    emit_context "[planning-with-files] Update $progress with what you just did. If the phase changed, update $plan." "PostToolUse"
    ;;
  stop)
    context="$(render_session_summary)"
    clear_session_sidecar "$task_dir"
    emit_context "$context" "Stop"
    ;;
  agent-stop|session-end)
    context="$(render_session_summary)"
    clear_session_sidecar "$task_dir"
    emit_context "$context" "$event"
    ;;
  error-occurred)
    emit_context "[planning-with-files] An error occurred. Log the error, attempt, and resolution in $plan." "ErrorOccurred"
    ;;
  *)
    printf '{}\n'
    ;;
esac
