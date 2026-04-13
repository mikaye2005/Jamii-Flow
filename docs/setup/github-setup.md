# GitHub Setup

## Current Git Status
- Repository initialized locally during scaffold.

## Create GitHub Repository
1. Open GitHub.
2. Click **New repository**.
3. Name it `jamii-flow`.
4. Keep it empty (no README, no license, no gitignore).
5. Create repository.

## Connect Local Repository
Run in `jamii-flow`:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Authentication Notes
- If prompted, authenticate using GitHub browser login or a Personal Access Token.
- Do not share secrets in terminal output or committed files.

## Verification
- `git remote -v` shows your GitHub URL.
- GitHub repository displays pushed commits.
