#!/usr/bin/env pwsh
# Script to check GitHub Actions CI/CD status and fetch logs

param(
    [string]$Owner = "TuLinh-NyNus",
    [string]$Repo = "NyNus-BOO",
    [int]$Limit = 5
)

Write-Host "🔍 Checking GitHub Actions CI/CD Status..." -ForegroundColor Cyan
Write-Host ""

# GitHub API endpoint
$apiUrl = "https://api.github.com/repos/$Owner/$Repo/actions/runs?per_page=$Limit"

try {
    # Fetch workflow runs
    Write-Host "📡 Fetching latest workflow runs from GitHub API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -Headers @{
        "Accept" = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }

    if ($response.workflow_runs.Count -eq 0) {
        Write-Host "❌ No workflow runs found" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Found $($response.workflow_runs.Count) recent workflow runs" -ForegroundColor Green
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Gray
    Write-Host ""

    # Display each workflow run
    foreach ($run in $response.workflow_runs) {
        # Status emoji
        $statusEmoji = switch ($run.status) {
            "completed" { 
                switch ($run.conclusion) {
                    "success" { "✅" }
                    "failure" { "❌" }
                    "cancelled" { "🚫" }
                    "skipped" { "⏭️" }
                    default { "⚠️" }
                }
            }
            "in_progress" { "⏳" }
            "queued" { "⏸️" }
            default { "❓" }
        }

        # Display run info
        Write-Host "$statusEmoji Workflow: $($run.name)" -ForegroundColor Cyan
        Write-Host "   ID: $($run.id)" -ForegroundColor Gray
        Write-Host "   Branch: $($run.head_branch)" -ForegroundColor White
        Write-Host "   Commit: $($run.head_sha.Substring(0,7)) - $($run.display_title)" -ForegroundColor White
        Write-Host "   Status: $($run.status)" -ForegroundColor $(if ($run.status -eq "completed") { "White" } else { "Yellow" })
        
        if ($run.conclusion) {
            $conclusionColor = switch ($run.conclusion) {
                "success" { "Green" }
                "failure" { "Red" }
                "cancelled" { "Yellow" }
                default { "Gray" }
            }
            Write-Host "   Conclusion: $($run.conclusion)" -ForegroundColor $conclusionColor
        }
        
        Write-Host "   Created: $($run.created_at)" -ForegroundColor Gray
        Write-Host "   URL: $($run.html_url)" -ForegroundColor Blue
        Write-Host ""

        # If failed, fetch jobs detail
        if ($run.conclusion -eq "failure") {
            Write-Host "   🔍 Fetching failed job details..." -ForegroundColor Yellow
            
            $jobsUrl = "https://api.github.com/repos/$Owner/$Repo/actions/runs/$($run.id)/jobs"
            try {
                $jobs = Invoke-RestMethod -Uri $jobsUrl -Method Get -Headers @{
                    "Accept" = "application/vnd.github+json"
                    "X-GitHub-Api-Version" = "2022-11-28"
                }

                foreach ($job in $jobs.jobs) {
                    if ($job.conclusion -eq "failure") {
                        Write-Host "   ❌ Failed Job: $($job.name)" -ForegroundColor Red
                        Write-Host "      Started: $($job.started_at)" -ForegroundColor Gray
                        Write-Host "      Completed: $($job.completed_at)" -ForegroundColor Gray
                        
                        # Find failed step
                        foreach ($step in $job.steps) {
                            if ($step.conclusion -eq "failure") {
                                Write-Host "      ❌ Failed Step: $($step.name)" -ForegroundColor Red
                                Write-Host "         Started: $($step.started_at)" -ForegroundColor Gray
                                Write-Host "         Completed: $($step.completed_at)" -ForegroundColor Gray
                                Write-Host ""
                            }
                        }
                        
                        Write-Host "      📋 View full logs: $($job.html_url)" -ForegroundColor Blue
                        Write-Host ""
                    }
                }
            }
            catch {
                Write-Host "   ⚠️ Could not fetch job details: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }

        Write-Host "-" * 80 -ForegroundColor Gray
        Write-Host ""
    }

    # Summary
    $completed = $response.workflow_runs | Where-Object { $_.status -eq "completed" }
    $success = $completed | Where-Object { $_.conclusion -eq "success" }
    $failed = $completed | Where-Object { $_.conclusion -eq "failure" }
    $inProgress = $response.workflow_runs | Where-Object { $_.status -eq "in_progress" }

    Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
    Write-Host "   ✅ Success: $($success.Count)" -ForegroundColor Green
    Write-Host "   ❌ Failed: $($failed.Count)" -ForegroundColor Red
    Write-Host "   ⏳ In Progress: $($inProgress.Count)" -ForegroundColor Yellow
    Write-Host ""

    # Open browser to actions page
    Write-Host "🌐 To view full details, visit:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$Owner/$Repo/actions" -ForegroundColor Blue
    Write-Host ""

    # Return failed runs for further analysis
    if ($failed.Count -gt 0) {
        Write-Host "⚠️ There are $($failed.Count) failed workflow runs!" -ForegroundColor Red
        Write-Host "   Run this script to see details of failed jobs" -ForegroundColor Yellow
        exit 1
    }
    else {
        Write-Host "🎉 All recent workflows completed successfully!" -ForegroundColor Green
        exit 0
    }
}
catch {
    Write-Host "❌ Error fetching GitHub Actions data:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possible reasons:" -ForegroundColor Yellow
    Write-Host "   - Network connection issue" -ForegroundColor White
    Write-Host "   - GitHub API rate limit exceeded" -ForegroundColor White
    Write-Host "   - Repository name or owner incorrect" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Manual check at: https://github.com/$Owner/$Repo/actions" -ForegroundColor Blue
    exit 1
}

