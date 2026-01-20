# PowerShell script to push code to GitHub
# Replace YOUR_USERNAME and REPO_NAME with your actual GitHub details

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "electricity-management-system"
)

$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
Write-Host "Repository URL: $repoUrl`n" -ForegroundColor Gray

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $change = Read-Host "Do you want to change it to $repoUrl? (y/n)"
    if ($change -eq 'y' -or $change -eq 'Y') {
        git remote set-url origin $repoUrl
        Write-Host "Remote URL updated!" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    Write-Host "Remote added!" -ForegroundColor Green
}

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "`nRenaming branch from '$currentBranch' to 'main'..." -ForegroundColor Yellow
    git branch -M main
    Write-Host "Branch renamed!" -ForegroundColor Green
}

# Push to GitHub
Write-Host "`nPushing code to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for your GitHub credentials." -ForegroundColor Gray
Write-Host "If using Personal Access Token, use it as the password.`n" -ForegroundColor Gray

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "View your repository at: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed. Please check the error above." -ForegroundColor Red
    Write-Host "`nCommon solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure the repository exists on GitHub" -ForegroundColor Gray
    Write-Host "2. Use Personal Access Token for authentication" -ForegroundColor Gray
    Write-Host "3. Check your internet connection" -ForegroundColor Gray
}
