#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check Mobile CI job failures in detail
"""

import os
import sys
import requests

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
    'Accept': 'application/vnd.github+json'
}

print("=" * 70)
print("MOBILE CI - DETAILED JOB ANALYSIS")
print("=" * 70)
print()

try:
    # Get latest Mobile CI run
    response = requests.get(
        f'https://api.github.com/repos/{repo}/actions/runs?per_page=1&workflow=ci-mobile.yml&status=failure',
        headers=headers,
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"[ERROR] API returned {response.status_code}")
        exit(1)
    
    runs = response.json()['workflow_runs']
    if not runs:
        print("[INFO] No failed Mobile CI runs found")
        exit(0)
    
    run = runs[0]
    run_id = run['id']
    
    print(f"Latest Mobile CI Run: {run_id}")
    print(f"URL: https://github.com/{repo}/actions/runs/{run_id}")
    print()
    
    # Get jobs
    jobs_response = requests.get(
        f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs',
        headers=headers,
        timeout=10
    )
    
    jobs = jobs_response.json()['jobs']
    
    for job in jobs:
        job_name = job['name']
        job_id = job['id']
        conclusion = job['conclusion']
        status = job['status']
        
        # Show all jobs
        status_icon = "[PASS]" if conclusion == "success" else "[FAIL]" if conclusion == "failure" else "[RUN]"
        print(f"{status_icon} {job_name}")
        
        # For failed jobs, try to get logs
        if conclusion == "failure":
            try:
                logs_resp = requests.get(
                    f'https://api.github.com/repos/{repo}/actions/jobs/{job_id}/logs',
                    headers=headers,
                    timeout=10,
                    allow_redirects=True
                )
                
                if logs_resp.status_code == 200:
                    logs_lines = logs_resp.text.split('\n')
                    
                    # Find actual error content (skip timestamps)
                    print("  [LOGS - Last 30 lines]:")
                    for line in logs_lines[-30:]:
                        if line.strip():
                            # Remove timestamp prefix
                            if '##[error]' in line:
                                # Extract just the error part
                                msg = line.split('##[error]')[-1].strip()
                                print(f"    ERROR: {msg[:120]}")
                            elif line.startswith('2025-'):
                                # Remove timestamp
                                msg = line.split(']', 1)[-1].strip()
                                if msg:
                                    print(f"    {msg[:120]}")
                            else:
                                print(f"    {line[:120]}")
                    print()
            except Exception as e:
                print(f"  Could not fetch logs: {e}")
                print()
    
except Exception as e:
    print(f"[ERROR] {str(e)}")
    exit(1)
