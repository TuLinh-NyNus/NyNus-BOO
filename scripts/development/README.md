# Development Scripts

This directory contains scripts for local development and testing.

## 🔍 CI/CD Monitoring Scripts

### check-ci-simple.ps1
Fetches GitHub Actions CI/CD status via API (requires public repo or auth token).

```powershell
.\scripts\development\check-ci-simple.ps1
```

**Features:**
- Fetches latest 5 workflow runs
- Shows status (pass/fail/in-progress)
- Lists failed jobs and steps
- Provides direct links to logs

**Output:**
```
[PASS] Workflow: Frontend CI
   ID: 123456
   Commit: a1385d3 - fix(ci): Comprehensive fixes
   
[FAIL] Workflow: Frontend CI  
   [FAIL] Job: type-check
      [X] Step: Run TypeScript type check
      Logs: https://github.com/.../runs/123456/job/789
```

---

### open-ci-logs.ps1
Opens GitHub Actions page in browser for manual inspection.

```powershell
.\scripts\development\open-ci-logs.ps1
```

**Features:**
- Opens GitHub Actions in default browser
- Shows instructions for finding errors
- Lists common error patterns to look for

**When to use:**
- After pushing code to GitHub
- When CI/CD fails
- To view detailed error logs
- To check workflow run history

---

## 📚 Related Documentation

**Troubleshooting Guide:**  
See `docs/checklist/ci-troubleshooting-guide.md` for:
- Step-by-step error diagnosis
- Common errors & solutions
- Self-service fix workflow
- When to ask for help

**Workflow Files:**
- `.github/workflows/ci-frontend.yml` - Main frontend CI
- `.github/workflows/frontend.yml` - Alternative frontend workflow
- `.github/workflows/ci-backend.yml` - Backend CI
- `.github/workflows/ci-mobile.yml` - Mobile CI

---

## 💡 Usage Examples

### After Pushing Code

```powershell
# 1. Push your changes
git add -A
git commit -m "feat: add new feature"
git push origin main

# 2. Wait 30 seconds for CI to start

# 3. Check CI status
.\scripts\development\open-ci-logs.ps1

# 4. Or fetch status via API (if repo is public)
.\scripts\development\check-ci-simple.ps1
```

### When CI Fails

```powershell
# 1. Open CI logs
.\scripts\development\open-ci-logs.ps1

# 2. In browser:
#    - Click on failed workflow run (red X)
#    - Click on failed job
#    - Click on failed step
#    - Read error message

# 3. Refer to troubleshooting guide
cat docs/checklist/ci-troubleshooting-guide.md

# 4. Fix the issue locally

# 5. Test locally
cd apps/frontend
pnpm type-check
pnpm lint
pnpm build

# 6. Push fix
git add -A
git commit -m "fix(ci): resolve type check errors"
git push origin main

# 7. Monitor CI again
.\scripts\development\open-ci-logs.ps1
```

---

## 🚨 Common Scenarios

### Scenario 1: "Cannot find module @/generated"

**Diagnosis:** Protobuf files not generated

**Fix:**
1. Check `.github/workflows/ci-frontend.yml`
2. Ensure "Generate protobuf files" step exists
3. Verify `packages/proto/buf.gen.frontend.yaml` is v2

### Scenario 2: "pnpm: command not found"

**Diagnosis:** PNPM not installed or wrong version

**Fix:**
1. Check `PNPM_VERSION` in workflow env
2. Ensure `pnpm/action-setup@v3` is used
3. Match version with `pnpm-lock.yaml`

### Scenario 3: TypeScript type errors

**Diagnosis:** Missing Prisma types or explicit type annotations

**Fix:**
1. Add "Generate Prisma Client" step before type-check
2. Add `DATABASE_URL` env var
3. Add explicit type annotations in code

### Scenario 4: ESLint errors

**Diagnosis:** `no-explicit-any` rule too strict

**Fix:**
1. Change rule from "error" to "warn" in `eslint.config.mjs`
2. Remove `--max-warnings=0` from lint command

---

## 🔗 External Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [PNPM CI Guide](https://pnpm.io/continuous-integration)
- [Buf CLI Docs](https://buf.build/docs/installation)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

**Last Updated:** 2025-10-29  
**Maintained By:** NyNus Development Team

