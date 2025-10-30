#!/usr/bin/env python3
"""
Get detailed error logs from latest failed CI jobs
"""

import os
import requests
import json

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
print("LATEST CI/CD FAILURES - DETAILED ERROR LOGS")
print("=" * 70)
print()

try:
    # Get latest 3 failed runs
    response = requests.get(
        f'https://api.github.com/repos/{repo}/actions/runs?per_page=3&status=failure',
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
        
        print(f"\n[RUN {idx}] {run_name}")
        print(f"URL: https://github.com/{repo}/actions/runs/{run_id}")
        print("-" * 70)
        
        # Get jobs for this run
        try:
            jobs_response = requests.get(
                f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs',
                headers=headers,
                timeout=10
            )
            
            if jobs_response.status_code != 200:
                print(f"[WARN] Could not fetch jobs: {jobs_response.status_code}")
                continue
            
            jobs = jobs_response.json()['jobs']
            failed_jobs = [j for j in jobs if j.get('conclusion') == 'failure']
            
            if not failed_jobs:
                print("[INFO] No failed jobs in this run")
                continue
            
            for job in failed_jobs:
                job_id = job['id']
                job_name = job['name']
                
                print(f"\n  [FAILED JOB] {job_name}")
                
                # Get logs
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
                        
                        # Find error sections
                        print("  [ERROR LOG SECTIONS]:")
                        in_error = False
                        error_lines = []
                        
                        for line in lines:
                            if '##[error]' in line or 'error' in line.lower():
                                error_lines.append(line)
                        
                        # Print unique error lines
                        for line in error_lines[-10:]:  # Last 10 error lines
                            if line.strip():
                                # Truncate long lines
                                if len(line) > 100:
                                    print(f"    {line[:100]}...")
                                else:
                                    print(f"    {line[:100]}")
                        
                        if not error_lines:
                            print("    [No error markers found]")
                            print("    [Last 5 log lines]:")
                            for line in lines[-5:]:
                                if line.strip():
                                    print(f"      {line[:100]}")
                    else:
                        print(f"  [WARN] Could not fetch logs: HTTP {logs_response.status_code}")
                
                except Exception as e:
                    print(f"  [WARN] Error fetching logs: {str(e)}")
        
        except Exception as e:
            print(f"[WARN] Error processing jobs: {str(e)}")
    
    print("\n" + "=" * 70)
    print("[SUMMARY]")
    print("=" * 70)
    print("Check https://github.com/TuLinh-NyNus/NyNus-BOO/actions for details")
    print()

except requests.exceptions.RequestException as e:
    print(f"[ERROR] Network error: {str(e)}")
    exit(1)
except Exception as e:
    print(f"[ERROR] {str(e)}")
    exit(1)
