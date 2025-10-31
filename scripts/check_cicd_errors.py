#!/usr/bin/env python3
"""
CI/CD Error Detection Script
Automatically detects and reports errors from GitHub Actions workflows
"""

import os
import sys
import json
from datetime import datetime

def check_github_token():
    """Check if GitHub token is set"""
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print("[ERROR] GitHub token not set")
        print("\nTo use this script, set your GitHub token:")
        print('  set GITHUB_TOKEN=your_personal_access_token  (Windows)')
        print('  export GITHUB_TOKEN=your_personal_access_token  (Linux/Mac)')
        print("\nTo create a token:")
        print("  1. Go to: https://github.com/settings/tokens")
        print("  2. Click 'Generate new token (classic)'")
        print("  3. Select scopes: repo, workflow, read:org")
        print("  4. Copy the token and set it as environment variable")
        return None
    return token

def main():
    """Main function"""
    print("=" * 50)
    print("  CI/CD Error Detection System")
    print("=" * 50)
    print()
    
    # Check token
    token = check_github_token()
    if not token:
        print("\n[INFO] MANUAL CHECK OPTION:")
        print("=" * 50)
        print("Visit GitHub Actions dashboard:")
        print("  https://github.com/TuLinh-NyNus/NyNus-BOO/actions")
        print()
        print("Or check individual workflows:")
        print("  - Backend CI: https://github.com/TuLinh-NyNus/NyNus-BOO/actions/workflows/ci-backend.yml")
        print("  - Frontend CI: https://github.com/TuLinh-NyNus/NyNus-BOO/actions/workflows/ci-frontend.yml")
        print("  - Mobile CI: https://github.com/TuLinh-NyNus/NyNus-BOO/actions/workflows/ci-mobile.yml")
        sys.exit(1)
    
    # Try to import requests library
    try:
        import requests
    except ImportError:
        print("[ERROR] 'requests' library not installed")
        print("\nTo install it:")
        print("  pip install requests")
        print("\nOr use manual check from above")
        sys.exit(1)
    
    try:
        print("[INFO] Fetching workflow runs from GitHub API...")
        print()
        
        # API configuration
        repo = "TuLinh-NyNus/NyNus-BOO"
        api_base = f"https://api.github.com/repos/{repo}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        # Get workflow runs
        response = requests.get(f"{api_base}/actions/runs?per_page=10", headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"[ERROR] GitHub API returned status {response.status_code}")
            print(f"   Message: {response.text}")
            sys.exit(1)
        
        data = response.json()
        runs = data.get('workflow_runs', [])
        
        if not runs:
            print("[INFO] No workflow runs found")
            sys.exit(0)
        
        print(f"[OK] Found {len(runs)} recent workflow runs")
        print()
        
        # Process runs
        failed_count = 0
        success_count = 0
        in_progress_count = 0
        
        for run in runs:
            conclusion = run.get('conclusion')
            status = run.get('status')
            name = run.get('name', 'Unknown')
            run_id = run.get('id')
            created_at = run.get('created_at')
            branch = run.get('head_branch')
            
            # Determine status indicator
            if conclusion == 'failure':
                status_icon = '[FAIL]'
                failed_count += 1
            elif conclusion == 'success':
                status_icon = '[PASS]'
                success_count += 1
            elif conclusion == 'cancelled':
                status_icon = '[CANCELLED]'
            else:
                status_icon = '[RUNNING]'
                in_progress_count += 1
            
            print(f"{status_icon} {name}")
            print(f"   Status: {conclusion or status} | Branch: {branch} | ID: {run_id}")
            print(f"   Created: {created_at}")
            
            # If failed, fetch job details
            if conclusion == 'failure':
                print(f"   [INFO] Failed Jobs:")
                try:
                    jobs_response = requests.get(f"{api_base}/actions/runs/{run_id}/jobs", 
                                                headers=headers, timeout=10)
                    if jobs_response.status_code == 200:
                        jobs_data = jobs_response.json()
                        jobs = jobs_data.get('jobs', [])
                        for job in jobs:
                            if job.get('conclusion') == 'failure':
                                job_name = job.get('name')
                                job_html_url = job.get('html_url')
                                print(f"      [FAIL] {job_name}")
                                print(f"         Logs: {job_html_url}")
                except Exception as e:
                    print(f"      [WARN] Could not fetch job details: {str(e)}")
            
            print()
        
        # Summary
        print()
        print("SUMMARY")
        print("=" * 50)
        print(f"[PASS] Successful: {success_count}")
        print(f"[FAIL] Failed: {failed_count}")
        print(f"[RUNNING] In Progress: {in_progress_count}")
        print()
        
        if failed_count > 0:
            print(f"[WARN] ACTION REQUIRED: {failed_count} workflow(s) have failed!")
            print()
            print("Next steps:")
            print(f"  1. Visit: https://github.com/{repo}/actions")
            print("  2. Click the failed workflow run")
            print("  3. Review job logs for error details")
            print("  4. Fix issues locally and push")
        else:
            print("[OK] All workflows are passing!")
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Network request failed")
        print(f"   {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
