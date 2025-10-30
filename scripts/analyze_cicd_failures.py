#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyze CI/CD Failures - Get detailed error logs
"""

import os
import sys
import requests
import json

# Fix encoding issues on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

token = os.environ.get('GITHUB_TOKEN')
if not token:
    print("[ERROR] GITHUB_TOKEN not set")
    exit(1)

repo = 'TuLinh-NyNus/NyNus-BOO'
headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}

print("=" * 70)
print("CI/CD FAILURE ANALYSIS - DETAILED ERROR LOGS")
print("=" * 70)
print()

try:
    # Get the latest 5 failed runs
    response = requests.get(
        f'https://api.github.com/repos/{repo}/actions/runs?per_page=5&status=failure', 
        headers=headers,
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"[ERROR] API returned {response.status_code}")
        exit(1)
    
    runs = response.json()['workflow_runs']
    
    for idx, run in enumerate(runs, 1):
        run_id = run['id']
        run_name = run['name']
        branch = run['head_branch']
        created_at = run['created_at']
        
        print(f"\n[RUN {idx}] {run_name}")
        print(f"  ID: {run_id}")
        print(f"  Branch: {branch}")
        print(f"  Created: {created_at}")
        print(f"  URL: https://github.com/{repo}/actions/runs/{run_id}")
        print("-" * 70)
        
        # Get job details
        try:
            jobs_response = requests.get(
                f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs',
                headers=headers,
                timeout=10
            )
            
            if jobs_response.status_code != 200:
                print(f"  [WARN] Could not fetch jobs: {jobs_response.status_code}")
                continue
            
            jobs = jobs_response.json()['jobs']
            failed_jobs = [j for j in jobs if j.get('conclusion') == 'failure']
            
            if not failed_jobs:
                print("  [INFO] No failed jobs found (might be still running)")
                continue
            
            for job in failed_jobs:
                job_id = job['id']
                job_name = job['name']
                job_url = job['html_url']
                
                print(f"\n  [FAILED JOB] {job_name}")
                print(f"    Job URL: {job_url}")
                print(f"    Log URL: https://api.github.com/repos/{repo}/actions/jobs/{job_id}/logs")
                
                # Try to get logs
                try:
                    logs_response = requests.get(
                        f'https://api.github.com/repos/{repo}/actions/jobs/{job_id}/logs',
                        headers=headers,
                        timeout=10,
                        allow_redirects=True
                    )
                    
                    if logs_response.status_code == 200:
                        logs_text = logs_response.text
                        lines = logs_text.split('\n')
                        
                        # Find error lines
                        error_lines = []
                        for line in lines:
                            if any(kw in line for kw in ['error', 'Error', 'ERROR', 'failed', 'Failed', 'FAILED', 'fatal', '##[error]']):
                                error_lines.append(line)
                        
                        if error_lines:
                            print("    [ERROR MESSAGES]:")
                            for line in error_lines[-10:]:  # Last 10 error lines
                                if line.strip():
                                    print(f"      > {line[:100]}")
                        else:
                            print("    [Last 10 log lines]:")
                            for line in lines[-10:]:
                                if line.strip():
                                    print(f"      > {line[:100]}")
                    else:
                        print(f"    [WARN] Could not fetch logs: HTTP {logs_response.status_code}")
                
                except Exception as e:
                    print(f"    [WARN] Error fetching logs: {str(e)}")
        
        except Exception as e:
            print(f"  [WARN] Error processing jobs: {str(e)}")
    
    print("\n" + "=" * 70)
    print("[NEXT STEPS]")
    print("=" * 70)
    print("1. Review the error messages above")
    print("2. Visit GitHub Actions: https://github.com/TuLinh-NyNus/NyNus-BOO/actions")
    print("3. Click on the failed workflow to see full logs")
    print("4. Fix the issues in your code")
    print("5. Push changes and workflows will re-run automatically")
    print()

except requests.exceptions.RequestException as e:
    print(f"[ERROR] Network error: {str(e)}")
    exit(1)
except Exception as e:
    print(f"[ERROR] {str(e)}")
    exit(1)

