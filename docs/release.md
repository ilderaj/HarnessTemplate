# Release

Branches:

- `dev`: ongoing implementation and upstream updates.
- `main`: verified template baseline.

Release flow:

```bash
git switch dev
npm run verify
./scripts/harness verify
git switch main
git merge --ff-only dev
git push origin main
```

Only promote to `main` after verification passes.

## GitHub Repository Setup

Create the GitHub repository with:

```bash
gh repo create HarnessTemplate --public --source=. --remote=origin --push
```

Create and push `dev`:

```bash
git switch -c dev
git push -u origin dev
git switch main
git push -u origin main
```

After repository creation, enable template repository behavior in GitHub repository settings.
