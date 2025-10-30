# Branch Protection Setup Guide

## 🛡️ Overview

This guide helps you configure branch protection rules for the exam-bank-system repository to ensure code quality and security.

**Protected Branches:** `main`, `develop`  
**Setup Time:** 10 minutes

## 📋 Prerequisites

- Repository owner or admin access
- All CI workflows should be running and passing first
- GitHub organization (for some features)

---

## 🎯 Main Branch Protection Rules

### Step 1: Navigate to Branch Settings

```
GitHub Repository > Settings > Branches > Branch protection rules
```

### Step 2: Add Rule for 'main'

Click **"Add rule"** and enter pattern: `main`

### Step 3: Configure Protection Rules

#### ✅ Require a pull request before merging

```
☑️ Require pull request reviews before merging
   └─ Required number of dismissal reviews: 2
   
☑️ Require approval from code owners
   
☑️ Require conversation resolution before merging

☑️ Require status checks to pass before merging
   └─ Require branches to be up to date before merging
   
☑️ Restrict who can push to matching branches
   └─ Only allow specified actors to push
   └─ Allowed actors:
       • @devops-team
       • @backend-team
       • @frontend-team
       • @mobile-team
```

#### Status Checks to Require

Add these checks to the **"Require status checks"** section:

```
Required status checks:

Backend CI:
☑️ Backend CI / lint
☑️ Backend CI / test
☑️ Backend CI / build
☑️ Backend CI / docker
☑️ Backend CI / security

Frontend CI:
☑️ Frontend CI / lint
☑️ Frontend CI / type-check
☑️ Frontend CI / unit-tests
☑️ Frontend CI / build
☑️ Frontend CI / e2e-tests
☑️ Frontend CI / docker
☑️ Frontend CI / security

Mobile CI:
☑️ Mobile CI / analyze
☑️ Mobile CI / unit-tests
☑️ Mobile CI / build-android
☑️ Mobile CI / build-ios
☑️ Mobile CI / security
```

#### Additional Rules

```
☑️ Dismiss stale pull request approvals when new commits are pushed

☑️ Require review from code owners

☑️ Allow force pushes
   └─ ☐ Do NOT enable (for main branch)

☑️ Allow deletions
   └─ ☐ Do NOT enable

☑️ Require signed commits

☑️ Lock branch
   └─ ☐ Do NOT enable (for main branch)

☑️ Require branches to be up to date before merging
```

### Step 4: Create Rule

Click **"Create"** to save the rule.

---

## 🎯 Develop Branch Protection Rules

Repeat the process for `develop` branch with slightly relaxed rules:

### Step 1: Add Rule for 'develop'

Click **"Add rule"** and enter pattern: `develop`

### Step 2: Configure Protection Rules

#### ✅ Require a pull request before merging

```
☑️ Require pull request reviews before merging
   └─ Required number of dismissal reviews: 1
   
☑️ Require approval from code owners
   └─ ☑️ Require code owner reviews (less strict than main)
   
☑️ Require conversation resolution before merging

☑️ Require status checks to pass before merging
   └─ Require branches to be up to date before merging
```

#### Status Checks to Require

```
Required status checks:

Backend CI:
☑️ Backend CI / lint
☑️ Backend CI / test
☑️ Backend CI / build

Frontend CI:
☑️ Frontend CI / lint
☑️ Frontend CI / type-check
☑️ Frontend CI / unit-tests
☑️ Frontend CI / build

Mobile CI:
☑️ Mobile CI / analyze
☑️ Mobile CI / unit-tests
```

#### Additional Rules

```
☑️ Dismiss stale pull request approvals

☑️ Require review from code owners

☑️ Allow force pushes
   └─ ☐ Restrict to admins (if needed for hotfixes)

☑️ Allow deletions
   └─ ☐ Do NOT enable

☑️ Require signed commits
   └─ ☐ Optional for develop

☑️ Require branches to be up to date before merging
```

### Step 3: Create Rule

Click **"Create"** to save the rule.

---

## 🔐 Additional Security Settings

### Require Signed Commits

If your organization requires signed commits:

```
Settings > Branch protection rules > [Select rule] > Edit

☑️ Require signed commits
   └─ All commits must be signed with a GPG key
```

**Setup GPG signing:**

```bash
# Generate GPG key
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format LONG

# Add to GitHub: Settings > SSH and GPG keys > New GPG key

# Configure git to sign
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true
```

### Restrict Force Pushes

For main branch (prevent accidental overwrites):

```
Settings > Branch protection rules > main > Edit

☑️ Allow force pushes
   └─ ☐ Do NOT enable for main
   └─ ☑️ Allow specified actors (if absolutely necessary)
       └─ Only: @devops-team
```

### Restrict Deletions

Prevent accidental branch deletion:

```
Settings > Branch protection rules > [main/develop] > Edit

☑️ Allow deletions
   └─ ☐ DISABLED for both main and develop
```

---

## 📊 Code Owner Setup

### Step 1: Create CODEOWNERS File

Already created at `.github/CODEOWNERS`

Current content:

```
# Global owners
* @owner-name

# Backend
apps/backend/ @backend-team
apps/backend/internal/service/ @backend-team

# Frontend
apps/frontend/ @frontend-team
apps/frontend/src/components/ @frontend-team

# Mobile
apps/mobile/ @mobile-team

# Infrastructure
docker/ @devops-team
.github/ @devops-team

# Documentation
docs/ @documentation-team
```

### Step 2: Update CODEOWNERS

Edit `.github/CODEOWNERS` to match your team structure:

```bash
# Replace team names with actual GitHub team slugs
# Format: @organization/team-slug or @username
```

### Step 3: Verify Code Owners Are Recognized

Push the CODEOWNERS file and create a test PR to verify:

```bash
git checkout -b test/codeowners
echo "test" >> README.md
git add README.md
git commit -m "test: verify codeowners"
git push origin test/codeowners

# Create PR and verify code owners are requested
```

---

## ✅ Verification Checklist

After setting up branch protection:

### Main Branch Rules

```
Main Branch (main):

☐ 2 code reviews required before merge
☐ Code owners approval required
☐ Conversation resolution required
☐ All status checks passing
   - Backend CI (all jobs)
   - Frontend CI (all jobs)
   - Mobile CI (critical jobs)
☐ Branch is up to date before merge
☐ Stale reviews dismissed on new commits
☐ Force push restricted to no one
☐ Branch deletion prevented
☐ Signed commits required (optional)
```

### Develop Branch Rules

```
Develop Branch (develop):

☐ 1 code review required before merge
☐ Code owners approval required
☐ Conversation resolution required
☐ Status checks passing (core tests)
☐ Branch is up to date before merge
☐ Stale reviews dismissed on new commits
☐ Force push restricted (if needed)
☐ Branch deletion prevented
```

---

## 🧪 Testing Branch Protection

### Test 1: Verify Direct Push Blocked

```bash
# Try to push directly to main (should fail)
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test: direct push"
git push origin main

# Expected: Error - "protected branch hook declined"
```

### Test 2: Verify PR Requirements

```bash
# Create PR and verify
git checkout -b feature/test
echo "feature test" >> README.md
git add README.md
git commit -m "feat: test pr requirements"
git push origin feature/test

# On GitHub, create PR
# Verify:
# ✓ Status checks required to pass
# ✓ Code owners request displayed
# ✓ At least 1/2 reviews needed
```

### Test 3: Verify Status Checks

```bash
# Create a PR with failing test
git checkout -b feature/failing-test
# Make a change that fails linting
git push origin feature/failing-test

# Create PR and verify:
# ✓ Cannot merge if status checks fail
# ✓ Merge button disabled
```

---

## 🔄 Deployment Protection Rules

For additional production safety, configure environment protection:

### Settings > Environments > production

```
☑️ Required reviewers
   └─ Minimum: 2 reviewers
   └─ List: @devops-lead, @backend-lead

☑️ Restrict to specific branches
   └─ Deployment branches: main

☐ Prevent self-review (optional)

☑️ Allow administrators to bypass configured protection rules
   └─ Only for emergency deployments
```

---

## 📋 Common Branch Protection Scenarios

### Scenario 1: Critical Hotfix

Need to deploy quickly to production?

```
1. Create hotfix branch from main
   git checkout main
   git checkout -b hotfix/critical-issue
   
2. Make fix and create PR
   git push origin hotfix/critical-issue
   
3. Request expedited review
   - Mention @devops-lead in PR
   - Explain criticality
   
4. Merge after quick approval
   - Admin can still bypass if absolutely necessary
```

### Scenario 2: Feature Branch Protection

Protect release branches:

```
Settings > Branch protection rules > Add rule

Pattern: release/*

Rules:
☑️ Require pull request reviews: 2
☑️ Require status checks
☑️ Require branches to be up to date
☑️ Require signed commits
```

---

## 🚨 Troubleshooting

### Issue: "Merge button disabled"

**Check:**
- [ ] Status checks all passed
- [ ] At least required number of reviews approved
- [ ] Conversations resolved
- [ ] Branch is up to date

### Issue: "Code owners not showing as reviewers"

**Solution:**
1. Verify CODEOWNERS file is correct
2. Check GitHub teams exist
3. Commit CODEOWNERS and push to main
4. Teams need to be members of organization

### Issue: "Cannot bypass protected branch"

**Solution:**
- Only admins can force push if allowed
- Settings > Branch protection rules > [rule] > Edit
- Check "Allow force pushes" > "Allow specified actors"

### Issue: Status check failing but should pass

**Solution:**
1. Check workflow completed successfully
2. Verify status check name matches exactly
3. Workflow might be pending
4. Refresh PR page

---

## 📊 Status Check Mapping

GitHub requires exact status check name matches. Verify your workflow names:

```
Workflow File → Status Check Name

ci-backend.yml:
  - lint → Backend CI / lint
  - test → Backend CI / test
  - build → Backend CI / build
  - docker → Backend CI / docker
  - security → Backend CI / security

ci-frontend.yml:
  - lint → Frontend CI / lint
  - type-check → Frontend CI / type-check
  - unit-tests → Frontend CI / unit-tests
  - build → Frontend CI / build
  - e2e-tests → Frontend CI / e2e-tests
  - docker → Frontend CI / docker
  - security → Frontend CI / security

ci-mobile.yml:
  - analyze → Mobile CI / analyze
  - unit-tests → Mobile CI / unit-tests
  - build-android → Mobile CI / build-android
  - build-ios → Mobile CI / build-ios
  - security → Mobile CI / security
```

---

## 📚 Best Practices

✅ **DO:**
- Require reviews from code owners
- Dismiss stale reviews on new commits
- Require status checks for all critical jobs
- Protect multiple branches (main, develop, release/*)
- Rotate who has force-push permissions

❌ **DON'T:**
- Allow direct pushes to main/develop
- Skip status checks for "emergency" fixes
- Allow anyone to bypass protections
- Have too many required reviewers (slows down development)
- Leave branch protection rules uncommunicated to team

---

## 🔗 Related Documentation

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

---

**Last Updated:** 2025-01-20  
**Maintained By:** DevOps Team




