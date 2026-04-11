#!/usr/bin/env python3
"""Report lifecycle status for a planning-with-files active task."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import planning_paths
from task_lifecycle import format_summary, inspect_plan_dir


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_path", nargs="?", default=".")
    parser.add_argument("task_id", nargs="?", default=None)
    parser.add_argument("--json", action="store_true", help="emit JSON")
    parser.add_argument(
        "--require-safe-to-archive",
        action="store_true",
        help="exit non-zero unless the task is explicitly safe to archive",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    project_path = Path(args.project_path).resolve()
    plan_dir = planning_paths.active_dir(project_path, args.task_id)
    status = inspect_plan_dir(plan_dir)

    if args.json:
        print(json.dumps(status, ensure_ascii=False, indent=2))
    else:
        print(format_summary(status))

    if args.require_safe_to_archive and not status["safe_to_archive"]:
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
