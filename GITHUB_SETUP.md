# GitHub Setup Instructions

## Step 1: Install Git

1. Download Git from: https://git-scm.com/download/win
2. Install it with default settings
3. Restart your terminal/PowerShell

## Step 2: Configure Git (First time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Git Repository

Open PowerShell in this directory and run:

```bash
cd "C:\Users\harsh\OneDrive\Documents\Electricity Management System"
git init
git add .
git commit -m "Initial commit: Electricity Management System"
```

## Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `electricity-management-system` (or any name you prefer)
3. Description: "Electricity Management System - HTML/CSS/JavaScript web application"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 5: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/electricity-management-system.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Alternative: Using GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select this folder: `C:\Users\harsh\OneDrive\Documents\Electricity Management System`
5. Click "Publish repository" to create it on GitHub
