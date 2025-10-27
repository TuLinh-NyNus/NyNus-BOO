# 🚀 DEPLOYMENT GUIDE - Question System Improvements

> **Version:** 1.0.0  
> **Last Updated:** 26/01/2025  
> **Status:** Ready for Deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Completed
- [x] All frontend code implemented
- [x] Zero linter errors
- [x] Dark mode support across all components
- [x] Responsive design verified
- [x] Design system compliance (100%)
- [x] Documentation complete

### ⏳ Pending
- [ ] GA4 Measurement ID provided
- [ ] Backend APIs for bulk operations
- [ ] Backend implementation for version control
- [ ] QA testing in staging

---

## 🔧 CONFIGURATION SETUP

### Step 1: Environment Variables

Add to `.env.local` in `apps/frontend/`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Get from Google Analytics

# Optional: Feature flags (if needed)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_BULK_EDIT=true
```

### Step 2: Google Analytics Setup

1. **Create GA4 Property:**
   - Go to https://analytics.google.com
   - Create new property
   - Get Measurement ID (format: G-XXXXXXXXXX)

2. **Configure Data Streams:**
   - Add web data stream
   - Enter your domain
   - Copy Measurement ID

3. **Set Up Events:**
   - Events are automatically tracked
   - See `apps/frontend/src/lib/analytics.ts` for all events
   - Custom events:
     - `question_view`
     - `question_bookmark`
     - `question_share`
     - `search_query`
     - `filter_apply`
     - `bulk_edit`
     - `bulk_delete`
     - `export_pdf`
     - `export_word`

4. **Enable Consent Mode:**
   - Already configured in code
   - Users will see cookie consent banner
   - Consent choices stored in localStorage

---

## 📦 DEPLOYMENT STEPS

### Frontend Deployment (Immediate)

#### Step 1: Build and Test Locally

```bash
# Navigate to frontend
cd apps/frontend

# Install dependencies (if not already done)
pnpm install

# Build production bundle
pnpm build

# Test production build locally
pnpm start

# Verify at http://localhost:3000
```

#### Step 2: Run Linter and Type Checks

```bash
# Check for linting errors
pnpm lint

# Check TypeScript types
pnpm type-check

# Fix auto-fixable issues
pnpm lint --fix
```

#### Step 3: Deploy to Staging

```bash
# Using Vercel (recommended)
vercel --prod

# Or using your CI/CD pipeline
git push origin main  # Triggers auto-deployment
```

#### Step 4: Verify Deployment

Check these features in staging:
- [ ] Question preview modal opens correctly
- [ ] Question detail page shows real data
- [ ] Export dialog works (PDF and Word)
- [ ] Bulk edit modal opens (frontend only)
- [ ] Version history panel opens (frontend only)
- [ ] Cookie consent banner appears
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile/tablet

---

### Backend Deployment (After Implementation)

#### Prerequisites
- [ ] Database migration ready
- [ ] gRPC endpoints implemented
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests passing

#### Step 1: Database Migration

```bash
# Connect to database
psql -h <host> -U <user> -d <database>

# Run migration for question_versions table
\i migrations/001_create_question_versions.sql

# Verify table created
\dt question_versions

# Verify trigger created
\df create_question_version
```

#### Step 2: Deploy Backend Service

```bash
# Build Go backend
cd apps/backend
go build -o bin/server ./cmd/server

# Run tests
go test ./... -v

# Deploy to staging
# (Your deployment process here)
```

#### Step 3: Verify Backend APIs

Test endpoints:
```bash
# Version Control
grpcurl -d '{"question_id": "test-id"}' \
  localhost:50051 question.QuestionService/GetVersionHistory

# Bulk Edit
grpcurl -d '{"question_ids": ["id1"], "status": "APPROVED"}' \
  localhost:50051 question.QuestionService/BulkUpdateQuestions

# Bulk Delete
grpcurl -d '{"question_ids": ["id1"]}' \
  localhost:50051 question.QuestionService/BulkDeleteQuestions
```

---

## 🧪 TESTING CHECKLIST

### Manual Testing

#### Preview Modal
- [ ] Opens when clicking "Preview" button
- [ ] Device tabs work (Desktop/Tablet/Mobile)
- [ ] Solution toggle works
- [ ] Dark mode renders correctly
- [ ] Close button works
- [ ] Content renders properly

#### Question Detail Page
- [ ] Real data loads from API
- [ ] Related questions display
- [ ] 404 page for invalid IDs
- [ ] SEO metadata present
- [ ] View count increments
- [ ] Analytics tracking fires

#### Export Functionality
- [ ] Export button visible
- [ ] Export dialog opens
- [ ] Format selection works (PDF/Word)
- [ ] Custom title updates preview
- [ ] Custom filename works
- [ ] Solutions toggle works
- [ ] Metadata toggle works
- [ ] PDF downloads correctly
- [ ] Word downloads correctly
- [ ] Export 1 question works
- [ ] Export 10 questions works
- [ ] Export 50 questions works
- [ ] No performance issues

#### Bulk Operations
- [ ] Bulk action bar appears when selecting questions
- [ ] Bulk edit modal opens
- [ ] Status dropdown works
- [ ] Difficulty dropdown works
- [ ] Bulk delete dialog opens
- [ ] Confirmation required
- [ ] Success toast appears
- [ ] List refreshes after operation

#### Version Control (After Backend)
- [ ] Version history button visible
- [ ] Panel opens from right
- [ ] Timeline displays versions
- [ ] Compare modal works
- [ ] Revert dialog opens
- [ ] Revert reason required (min 10 chars)
- [ ] Version restore works

#### Analytics
- [ ] Cookie consent banner appears
- [ ] Accept/decline buttons work
- [ ] Settings modal opens
- [ ] Preferences save to localStorage
- [ ] Page views tracked in GA4
- [ ] Custom events tracked in GA4
- [ ] Consent mode working

### Automated Testing (Recommended)

```bash
# Unit tests (TODO)
pnpm test

# E2E tests (TODO)
pnpm test:e2e

# Visual regression tests (TODO)
pnpm test:visual
```

---

## 🔍 MONITORING & VERIFICATION

### Post-Deployment Checks

#### 1. Google Analytics Verification

Check GA4 dashboard for:
- [ ] Real-time users
- [ ] Page views
- [ ] Custom events firing
- [ ] Consent mode status
- [ ] User demographics
- [ ] Device breakdown

#### 2. Error Monitoring

Check console for:
- [ ] No JavaScript errors
- [ ] No network errors
- [ ] No console warnings
- [ ] All API calls successful

#### 3. Performance Metrics

Monitor:
- [ ] Page load time < 2s
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 3s
- [ ] Export generation time acceptable
- [ ] No memory leaks

#### 4. User Experience

Verify:
- [ ] All features accessible
- [ ] No broken layouts
- [ ] Smooth animations
- [ ] Fast interactions
- [ ] Clear error messages

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### 1. Analytics Not Tracking

**Symptoms:** Events not appearing in GA4

**Solutions:**
- Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`
- Verify GA4 script loads in Network tab
- Check browser console for errors
- Verify cookie consent accepted
- Wait 24-48 hours for data to appear in GA4

#### 2. Export Not Working

**Symptoms:** PDF/Word not downloading

**Solutions:**
- Check browser's download settings
- Disable pop-up blocker
- Check browser console for errors
- Try different browser
- Clear browser cache
- Check disk space

#### 3. Bulk Operations Not Working

**Symptoms:** Bulk edit/delete fails

**Solutions:**
- Verify backend APIs are deployed
- Check network tab for 404/500 errors
- Verify authentication token
- Check server logs
- Try with smaller batch size

#### 4. Version Control Not Loading

**Symptoms:** Version history empty

**Solutions:**
- Verify backend is deployed
- Check database migration completed
- Verify gRPC endpoints working
- Check trigger is active
- Seed some test data

#### 5. Dark Mode Issues

**Symptoms:** Colors not switching

**Solutions:**
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check theme system imports
- Verify CSS variables loaded
- Check browser DevTools

---

## 📊 ROLLBACK PROCEDURE

If critical issues arise:

### Step 1: Identify Issue
- Check error logs
- Review user reports
- Check monitoring dashboards

### Step 2: Quick Fix or Rollback?
- If fixable in < 30 min: Deploy hotfix
- If complex: Rollback to previous version

### Step 3: Rollback Commands

```bash
# Using Vercel
vercel rollback <deployment-url>

# Using Git
git revert <commit-hash>
git push origin main

# Using Docker
docker pull <previous-image>
docker-compose up -d
```

### Step 4: Notify Team
- Post in Slack: #incidents
- Update status page
- Notify affected users

### Step 5: Post-Mortem
- Document root cause
- Create fix plan
- Schedule re-deployment

---

## 🎯 SUCCESS METRICS

Track these KPIs post-deployment:

### Usage Metrics
- **Preview Usage:** Target 80% of admins
- **Export Usage:** Target 20% of active admins
- **Bulk Edit Usage:** Target 30% of edit operations
- **Analytics Opt-in:** Target 70% consent rate

### Performance Metrics
- **Page Load Time:** < 2s (95th percentile)
- **Export Generation:** < 5s for 100 questions
- **API Response Time:** < 500ms (95th percentile)
- **Error Rate:** < 0.1%

### Quality Metrics
- **Bug Reports:** < 5 per week
- **User Satisfaction:** > 4/5 stars
- **Feature Adoption:** > 50% in first month

---

## 📞 SUPPORT

### During Deployment
- **DevOps Lead:** [Name] - [Contact]
- **Backend Dev:** [Name] - [Contact]
- **Frontend Dev:** [Name] - [Contact]

### Post-Deployment
- **Slack:** #question-system-dev
- **Email:** dev-team@nynus.com
- **Docs:** https://docs.nynus.com/question-system

### Emergency Contacts
- **On-Call Engineer:** [Phone]
- **CTO:** [Phone]
- **VP Engineering:** [Phone]

---

## ✅ DEPLOYMENT SIGN-OFF

Before deploying to production, get approval from:

- [ ] **Frontend Lead** - Code review complete
- [ ] **Backend Lead** - APIs ready and tested
- [ ] **QA Lead** - All tests passing
- [ ] **Product Manager** - Features approved
- [ ] **DevOps Lead** - Infrastructure ready
- [ ] **CTO** - Final approval

---

## 📝 DEPLOYMENT LOG

| Date | Version | Deployed By | Environment | Status | Notes |
|------|---------|-------------|-------------|--------|-------|
| 2025-01-26 | 1.0.0 | [Name] | Staging | ✅ Success | Initial deployment |
| TBD | 1.0.0 | [Name] | Production | ⏳ Pending | Awaiting backend |

---

## 🎉 POST-DEPLOYMENT CELEBRATION

Once successfully deployed:
1. ✅ Update team in Slack
2. ✅ Send announcement email
3. ✅ Update documentation
4. ✅ Close tickets
5. ✅ Celebrate! 🎊

---

**Last Updated:** 26/01/2025  
**Next Review:** After Production Deployment  
**Maintainer:** NyNus Dev Team

