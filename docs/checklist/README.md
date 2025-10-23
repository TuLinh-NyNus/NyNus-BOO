# Checklist Documentation - NyNus Error Fixing

Thư mục này chứa các checklist và action plans để sửa lỗi NextJS trong dự án NyNus Exam Bank System.

---

## 📁 Files Overview

### 1. [page-error-fix.md](./page-error-fix.md) - Checklist Chi Tiết
**Mục đích:** Action plan đầy đủ với hướng dẫn chi tiết từng bước

**Nội dung:**
- 17 tasks được phân chia theo priority (CRITICAL → HIGH → MEDIUM → LOW)
- Mỗi task có:
  - Checkbox để track progress
  - Mô tả chi tiết lỗi
  - Files cần sửa
  - Hướng dẫn fix từng bước
  - Cách kiểm tra sau khi fix
  - Ước tính thời gian
  - Người phụ trách đề xuất
- Timeline 3 tuần
- Dependencies graph
- Definition of Done

**Dành cho:** Team leads, developers thực hiện fix

---

### 2. [page-error-fix-summary.md](./page-error-fix-summary.md) - Quick Reference
**Mục đích:** Tóm tắt nhanh để theo dõi hàng ngày

**Nội dung:**
- Tổng quan nhanh
- Mục tiêu theo tuần
- Top priority tasks
- Daily checklist template
- Common issues & solutions
- Testing commands
- Escalation path

**Dành cho:** Developers, daily standup meetings

---

## 🚀 Cách Sử Dụng

### Cho Team Lead / Project Manager

1. **Đọc checklist đầy đủ:** [page-error-fix.md](./page-error-fix.md)
2. **Assign tasks** cho team members theo phần "Phân Công Đề Xuất"
3. **Track progress** hàng ngày trong phần "Progress Tracking"
4. **Review** Definition of Done cuối mỗi tuần

### Cho Developers

1. **Đọc summary:** [page-error-fix-summary.md](./page-error-fix-summary.md) để hiểu overview
2. **Check assigned tasks** trong [page-error-fix.md](./page-error-fix.md)
3. **Follow** hướng dẫn fix từng bước
4. **Update progress** sau khi hoàn thành mỗi task
5. **Run tests** theo hướng dẫn trong "Kiểm tra" section

### Cho QA

1. **Review** acceptance criteria trong mỗi task
2. **Run automated tests** theo hướng dẫn
3. **Verify** Definition of Done
4. **Report** issues nếu có

---

## 📊 Progress Tracking

### Cách cập nhật progress:

1. Mở file [page-error-fix.md](./page-error-fix.md)
2. Tìm task đang làm
3. Update checkbox:
   - `[ ]` → Not started
   - `[/]` → In progress (optional, có thể dùng emoji 🟡)
   - `[x]` → Completed
4. Update "Progress Tracking" section ở cuối file
5. Commit changes với message: `chore: update error fix progress - Task X.Y completed`

### Example:
```markdown
### Week 1 Progress (23-27/10)
- [x] Task 1.1: ✅ Done (Completed 24/10)
- [/] Task 1.2: 🟡 In progress (Started 24/10, ETA 25/10)
- [ ] Task 1.3: ⬜ Not started
```

---

## 🧪 Testing Workflow

### 1. Before Starting a Task
```bash
# Pull latest code
git pull origin main

# Create feature branch
git checkout -b fix/task-1-1-admin-questions

# Start dev server
npm run dev
```

### 2. During Development
```bash
# Manual testing
# Open browser: http://localhost:3000/[page-url]
# Check console for errors

# Run linter
pnpm lint

# Run type check
pnpm type-check
```

### 3. After Completing a Task
```bash
# Run automated test
cd apps/frontend
pnpx tsx scripts/test-all-pages-errors.ts

# Check report
cat ../../docs/report/page-error.md | grep "[page-name]"

# Commit changes
git add .
git commit -m "fix: resolve timeout errors on admin questions pages (Task 1.1)"

# Push for review
git push origin fix/task-1-1-admin-questions
```

---

## 📞 Communication

### Daily Standup Template
```
Yesterday:
- Completed: Task 1.1 - Admin Questions pages
- Blockers: None

Today:
- Working on: Task 1.2 - Admin Books/Exams pages
- ETA: End of day

Blockers:
- None / [Describe blocker if any]
```

### Blocker Reporting
```
**Task:** Task 1.1 - Admin Questions pages
**Issue:** Cannot reproduce timeout error locally
**Attempted Solutions:**
1. Cleared cache
2. Tested in incognito mode
3. Checked network tab

**Need Help From:** Senior Frontend Developer
**Urgency:** High (blocking progress)
```

---

## 📈 Metrics to Track

### Daily Metrics
- [ ] Number of tasks completed
- [ ] Number of errors fixed
- [ ] Number of pages verified
- [ ] Blockers encountered

### Weekly Metrics
- [ ] Total tasks completed vs planned
- [ ] Error reduction percentage
- [ ] Performance improvement (load time)
- [ ] Code review feedback

### Final Metrics (End of 3 weeks)
- [ ] Total errors fixed: Target 2,676 → 0
- [ ] Pages with 0 errors: Target 92/92 (100%)
- [ ] Average load time: Target < 3s
- [ ] Re-render count: Target < 5 per component

---

## 🎯 Success Criteria

### Week 1 (CRITICAL)
- [x] All admin pages load successfully
- [x] No timeout errors
- [x] 0 CRITICAL errors in report

### Week 2 (HIGH)
- [x] No "Maximum update depth exceeded" errors
- [x] All contexts optimized
- [x] Performance improved by 20%

### Week 3 (MEDIUM)
- [x] Accessibility page fully functional
- [x] Offline page fully functional
- [x] All pages have 0 errors

---

## 🔗 Related Documents

### Reports
- [page-error.md](../report/page-error.md) - Báo cáo chi tiết 32,938 dòng
- [page-error-summary.md](../report/page-error-summary.md) - Tóm tắt báo cáo

### Scripts
- [test-all-pages-errors.ts](../../apps/frontend/scripts/test-all-pages-errors.ts) - Script kiểm tra lỗi

### Documentation
- [RIPER-5 Protocol](../../.augment/rules/nynus-development-protocol.md) - Development methodology
- [Clean Code Standards](../../.augment/rules/coding.md) - Coding guidelines

---

## 💡 Tips & Best Practices

### 1. Fix Root Cause, Not Symptoms
- Don't just suppress errors
- Understand why the error happens
- Fix the underlying issue

### 2. Test Thoroughly
- Manual testing first
- Then automated testing
- Check related pages for side effects

### 3. Document Your Changes
- Clear commit messages
- Update comments in code
- Add notes in checklist if needed

### 4. Ask for Help Early
- Don't spend > 2 hours stuck
- Pair programming is encouraged
- Share knowledge with team

### 5. Keep Code Quality High
- Follow clean code standards
- Run linter before committing
- Request code review

---

## 🆘 Troubleshooting

### Issue: Test script fails to run
```bash
# Solution 1: Reinstall dependencies
cd apps/frontend
pnpm install

# Solution 2: Clear cache
rm -rf node_modules .next
pnpm install

# Solution 3: Check Node version
node --version  # Should be v22.14.0
```

### Issue: Cannot reproduce error locally
```bash
# Solution 1: Clear browser cache
# Chrome: Ctrl+Shift+Delete

# Solution 2: Test in incognito mode
# Chrome: Ctrl+Shift+N

# Solution 3: Check dev server is running
# Should be on http://localhost:3000
```

### Issue: Changes not reflected
```bash
# Solution 1: Hard refresh browser
# Chrome: Ctrl+Shift+R

# Solution 2: Restart dev server
# Ctrl+C to stop, then npm run dev

# Solution 3: Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📅 Review Schedule

### Daily Review (End of Day)
- Update progress in checklist
- Report blockers
- Plan next day's work

### Weekly Review (Friday)
- Review completed tasks
- Update metrics
- Adjust timeline if needed
- Team retrospective

### Final Review (End of Week 3)
- Verify all tasks completed
- Run final test suite
- Document lessons learned
- Celebrate success! 🎉

---

**Maintained by:** Frontend Team  
**Last Updated:** 23/10/2025  
**Next Review:** 27/10/2025 (End of Week 1)

