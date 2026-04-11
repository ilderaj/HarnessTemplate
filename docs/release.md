# Release

Branches:

- `dev`: ongoing implementation and upstream updates.
- `main`: verified template baseline.

Release flow:

```bash
git switch dev
./scripts/harness doctor
npm test
git switch main
git merge --ff-only dev
git push origin main
```

Only promote to `main` after verification passes.
