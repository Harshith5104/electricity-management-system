# Push to GitHub - Quick Commands

## After creating your GitHub repository, run these commands:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/electricity-management-system.git

# Rename branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## If you get authentication errors:

### Option 1: Use Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name (e.g., "Electricity Management System")
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. When pushing, use: `https://YOUR_TOKEN@github.com/YOUR_USERNAME/electricity-management-system.git`

### Option 2: Use GitHub CLI
```bash
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login

# Then push normally
git push -u origin main
```

### Option 3: Use GitHub Desktop
1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository → Select this folder
4. Click "Publish repository"

## Update Git User Info (Optional)

If you want to use your real name/email:

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```
