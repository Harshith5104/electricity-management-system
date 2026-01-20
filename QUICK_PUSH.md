# Quick Push to GitHub

## If you already have a GitHub repository:

Replace `YOUR_USERNAME` with your GitHub username and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/electricity-management-system.git
git branch -M main
git push -u origin main
```

## If you DON'T have a GitHub repository yet:

### Step 1: Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `electricity-management-system`
3. Choose Public or Private
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### Step 2: Push Your Code
After creating the repository, run the commands above.

## Authentication Issues?

If you get authentication errors, you'll need a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "Electricity Management System"
4. Select scope: `repo` (full control)
5. Click "Generate token"
6. Copy the token
7. When prompted for password during `git push`, paste the token (not your GitHub password)

## Using the PowerShell Script

You can also use the provided script:

```powershell
.\push-to-github.ps1 -GitHubUsername "YOUR_USERNAME" -RepoName "electricity-management-system"
```
