#!/usr/bin/env pwsh
# Simple script to check GitHub Actions CI/CD status

param(
    [string]$Owner = "TuLinh-NyNus",
    [string]$Repo = "NyNus-BOO",
    [int]$Limit = 5
)

Write-Host "Checking GitHub Actions CI/CD Status..." -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://api.github.com/repos/$Owner/$Repo/actions/runs?per_page=$Limit"

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -Headers @{
        "Accept" = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }

    if ($response.workflow_runs.Count -eq 0) {
        Write-Host "No workflow runs found" -ForegroundColor Red
        exit 1
    }

    Write-Host "Found $($response.workflow_runs.Count) recent workflow runs" -ForegroundColor Green
    Write-Host ""
    Write-Host ("=" * 80)
    Write-Host ""

    $failedRuns = @()

    foreach ($run in $response.workflow_runs) {
        $status = $run.status
        $conclusion = $run.conclusion

        # Status indicator
        if ($status -eq "completed") {
            if ($conclusion -eq "success") {
                Write-Host "[PASS]" -ForegroundColor Green -NoNewline
            }
            elseif ($conclusion -eq "failure") {
                Write-Host "[FAIL]" -ForegroundColor Red -NoNewline
                $failedRuns += $run
            }
            else {
                Write-Host "[$conclusion]" -ForegroundColor Yellow -NoNewline
            }
        }
        else {
            Write-Host "[$status]" -ForegroundColor Yellow -NoNewline
        }

        Write-Host " Workflow: $($run.name)" -ForegroundColor Cyan
        Write-Host "   ID: $($run.id)"
        Write-Host "   Branch: $($run.head_branch)"
        Write-Host "   Commit: $($run.head_sha.Substring(0,7)) - $($run.display_title)"
        Write-Host "   Created: $($run.created_at)"
        Write-Host "   URL: $($run.html_url)" -ForegroundColor Blue
        Write-Host ""

        # If failed, fetch job details
        if ($conclusion -eq "failure") {
            Write-Host "   Fetching failed job details..." -ForegroundColor Yellow
            
            $jobsUrl = "https://api.github.com/repos/$Owner/$Repo/actions/runs/$($run.id)/jobs"
            try {
                $jobs = Invoke-RestMethod -Uri $jobsUrl -Method Get -Headers @{
                    "Accept" = "application/vnd.github+json"
                    "X-GitHub-Api-Version" = "2022-11-28"
                }

                foreach ($job in $jobs.jobs) {
                    if ($job.conclusion -eq "failure") {
                        Write-Host "   [FAIL] Job: $($job.name)" -ForegroundColor Red
                        Write-Host "      Started: $($job.started_at)"
                        Write-Host "      Completed: $($job.completed_at)"
                        
                        # Find failed steps
                        foreach ($step in $job.steps) {
                            if ($step.conclusion -eq "failure") {
                                Write-Host "      [X] Step: $($step.name)" -ForegroundColor Red
                                Write-Host "         Number: $($step.number)"
                            }
                        }
                        
                        Write-Host "      Logs: $($job.html_url)" -ForegroundColor Blue
                        Write-Host ""
                    }
                }
            }
            catch {
                Write-Host "   Could not fetch job details: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }

        Write-Host ("-" * 80)
        Write-Host ""
    }

    # Summary
    $completed = $response.workflow_runs | Where-Object { $_.status -eq "completed" }
    $success = $completed | Where-Object { $_.conclusion -eq "success" }
    $failed = $completed | Where-Object { $_.conclusion -eq "failure" }
    $inProgress = $response.workflow_runs | Where-Object { $_.status -eq "in_progress" }

    Write-Host "SUMMARY:" -ForegroundColor Cyan
    Write-Host "   Success: $($success.Count)" -ForegroundColor Green
    Write-Host "   Failed: $($failed.Count)" -ForegroundColor Red
    Write-Host "   In Progress: $($inProgress.Count)" -ForegroundColor Yellow
    Write-Host ""

    Write-Host "View all actions at:" -ForegroundColor Cyan
    Write-Host "https://github.com/$Owner/$Repo/actions" -ForegroundColor Blue
    Write-Host ""

    if ($failed.Count -gt 0) {
        Write-Host "WARNING: There are $($failed.Count) failed workflow runs!" -ForegroundColor Red
        Write-Host ""
        Write-Host "FAILED WORKFLOWS:" -ForegroundColor Red
        foreach ($failedRun in $failedRuns) {
            Write-Host "  - $($failedRun.name) ($($failedRun.head_sha.Substring(0,7)))" -ForegroundColor Yellow
            Write-Host "    $($failedRun.html_url)" -ForegroundColor Blue
        }
        exit 1
    }
    else {
        Write-Host "All recent workflows completed successfully!" -ForegroundColor Green
        exit 0
    }
}
catch {
    Write-Host "Error fetching GitHub Actions data:" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  - Network connection issue"
    Write-Host "  - GitHub API rate limit exceeded"
    Write-Host "  - Repository name or owner incorrect"
    Write-Host ""
    Write-Host "Manual check at: https://github.com/$Owner/$Repo/actions" -ForegroundColor Blue
    exit 1
}

