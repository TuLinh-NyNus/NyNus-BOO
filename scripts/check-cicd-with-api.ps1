# Automated CI/CD Error Detection via GitHub API
# Requires: GitHub Personal Access Token (set as $env:GITHUB_TOKEN)

param(
    [int]$limit = 10,
    [string]$status = "all"  # "all", "failure", "success"
)

# Configuration
$repo = "TuLinh-NyNus/NyNus-BOO"
$apiBase = "https://api.github.com/repos/$repo"
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "❌ ERROR: GitHub token not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "To use this script, set your GitHub token:" -ForegroundColor Yellow
    Write-Host '  $env:GITHUB_TOKEN = "your_personal_access_token"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "To create a token:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "  2. Click 'Generate new token'" -ForegroundColor Gray
    Write-Host "  3. Select scopes: repo, workflow, read:org" -ForegroundColor Gray
    Write-Host "  4. Copy the token and set it above" -ForegroundColor Gray
    exit 1
}

# Headers for API requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CI/CD Error Detection via GitHub API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Get workflow runs
    Write-Host "📊 Fetching workflow runs..." -ForegroundColor Yellow
    $runsUrl = "$apiBase/actions/runs?per_page=$limit"
    $response = Invoke-RestMethod -Uri $runsUrl -Headers $headers
    $runs = $response.workflow_runs

    if ($runs.Count -eq 0) {
        Write-Host "ℹ️  No workflow runs found" -ForegroundColor Cyan
        exit 0
    }

    Write-Host "✅ Found $($runs.Count) recent workflow runs" -ForegroundColor Green
    Write-Host ""

    # Process each run
    $failedCount = 0
    $successCount = 0
    $inProgressCount = 0

    foreach ($run in $runs) {
        $conclusion = $run.conclusion
        $status = $run.status
        $name = $run.name
        $id = $run.id
        $createdAt = $run.created_at
        $branch = $run.head_branch

        # Status colors
        $statusColor = switch ($conclusion) {
            "failure" { "Red"; $failedCount++ }
            "success" { "Green"; $successCount++ }
            "cancelled" { "Yellow" }
            default { "Cyan"; $inProgressCount++ }
        }

        $statusEmoji = switch ($conclusion) {
            "failure" { "❌" }
            "success" { "✅" }
            "cancelled" { "⏹️" }
            default { "⏳" }
        }

        Write-Host "$statusEmoji $name" -ForegroundColor $statusColor
        Write-Host "  Status: $conclusion | Branch: $branch | ID: $id" -ForegroundColor Gray
        Write-Host "  Created: $createdAt" -ForegroundColor Gray

        # If failed, fetch job details
        if ($conclusion -eq "failure") {
            Write-Host "  🔍 Failed Jobs:" -ForegroundColor Red
            
            try {
                $jobsUrl = "$apiBase/actions/runs/$id/jobs"
                $jobsResponse = Invoke-RestMethod -Uri $jobsUrl -Headers $headers
                $jobs = $jobsResponse.jobs

                foreach ($job in $jobs) {
                    if ($job.conclusion -eq "failure") {
                        Write-Host "    ❌ $($job.name)" -ForegroundColor Red
                        Write-Host "       Logs: $($job.html_url)" -ForegroundColor Gray
                    }
                }
            } catch {
                Write-Host "    ⚠️ Could not fetch job details" -ForegroundColor Yellow
            }
        }

        Write-Host ""
    }

    # Summary
    Write-Host ""
    Write-Host "📈 SUMMARY" -ForegroundColor Yellow
    Write-Host "==========" -ForegroundColor Yellow
    Write-Host "✅ Successful: $successCount" -ForegroundColor Green
    Write-Host "❌ Failed: $failedCount" -ForegroundColor Red
    Write-Host "⏳ In Progress: $inProgressCount" -ForegroundColor Cyan
    Write-Host ""

    if ($failedCount -gt 0) {
        Write-Host "⚠️  ACTION REQUIRED: $failedCount workflow(s) have failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Visit GitHub Actions: https://github.com/$repo/actions" -ForegroundColor White
        Write-Host "2. Click the failed workflow run" -ForegroundColor White
        Write-Host "3. Review job logs for error details" -ForegroundColor White
        Write-Host "4. Fix issues locally and push" -ForegroundColor White
    }

} catch {
    Write-Host "❌ ERROR: Failed to fetch data from GitHub API" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify GitHub token is valid" -ForegroundColor White
    Write-Host "  2. Verify repository name: $repo" -ForegroundColor White
    Write-Host "  3. Check network connectivity" -ForegroundColor White
    exit 1
}

