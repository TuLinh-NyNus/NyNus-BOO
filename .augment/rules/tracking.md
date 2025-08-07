---
type: "always_apply"
---

# NyNus Work Tracking Process - Enhanced Version

## Overview

Simple and practical process for creating, tracking, and completing tasks in NyNus project. Optimized for Next.js 14, NestJS, TypeScript and Turborepo monorepo.

## BOO Trigger Commands

```bash
BOO, tạo task mới     # Create new task with basic information
BOO, update           # Update current task status
BOO, complete         # Mark task as completed
BOO, dashboard        # Show overview dashboard
```

## 3-Step Process

### 1. CREATE - Create Task

#### 1.1 Define basic information
- Task name and main objective
- Type: Feature/Bugfix/Refactor/Optimization
- Priority: High/Medium/Low
- Estimated timeline

#### 1.2 Create folder structure
```
docs/work-tracking/active/[task-name]/
├── overview.md              # Tổng quan nhiệm vụ chính
├── checklist.md             # Checklist công việc chính
├── [subtask-name-1]/        # Folder nhiệm vụ con 1
│   ├── overview.md          # Tổng quan nhiệm vụ con
│   ├── checklist.md         # Checklist nhiệm vụ con
│   └── report.md            # Report kết quả nhiệm vụ con
├── [subtask-name-2]/        # Folder nhiệm vụ con 2
│   ├── overview.md
│   ├── checklist.md
│   └── report.md
└── [subtask-name-n]/        # Các nhiệm vụ con khác
    ├── overview.md
    ├── checklist.md
    └── report.md
```

#### 1.3 Use standard templates
- Main task overview: overview.md template
- Main task checklist: checklist.md template
- Subtask overview: overview.md template
- Subtask checklist: checklist.md template
- Subtask report: report.md template
- Focus on actionable items

### 2. TRACK - Track Progress

#### 2.1 Update status regularly
- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed
- `[-]` Cancelled

#### 2.2 Record actual time
- Compare with initial estimates
- Update timeline if needed

#### 2.3 Document blockers and issues
- Record problems encountered
- Link to solutions or workarounds

### 3. COMPLETE - Complete Task

#### 3.1 Completion checklist
- [ ] Code implementation done
- [ ] Tests written and pass
- [ ] Documentation updated
- [ ] PR reviewed and merged

#### 3.2 Archive task
- Move from `active/` to `completed/`
- Update dashboard
- Record lessons learned

## Templates

### Main Task Overview Template (overview.md)

```markdown
# Task [ID]: [Tên Task]

## Thông tin cơ bản
- **Trạng thái**: [/] Đang thực hiện
- **Loại**: [Feature/Bugfix/Refactor/Optimization]
- **Ưu tiên**: [High/Medium/Low]
- **Timeline**: [DD/MM] → [DD/MM]
- **Ước tính**: [X]h | **Thực tế**: [X]h

## Mục tiêu
[Mô tả ngắn gọn mục tiêu chính và kết quả mong đợi]

## Subtasks Progress
- [x] subtask-01: [Tên] - Completed [DD/MM]
- [/] subtask-02: [Tên] - In Progress
- [ ] subtask-03: [Tên] - Planned

## NyNus Tech Stack Impact
### Frontend (Next.js 14)
- **Components**: [Các component bị ảnh hưởng]
- **Pages**: [Các page bị ảnh hưởng]
- **Hooks**: [Custom hooks cần tạo/sửa]

### Backend (NestJS)
- **Services**: [Các service bị ảnh hưởng]
- **Controllers**: [Các controller bị ảnh hưởng]
- **DTOs**: [Các DTO cần tạo/sửa]

### Database (PostgreSQL + Prisma)
- **Models**: [Các model bị ảnh hưởng]
- **Migrations**: [Các migration cần chạy]

### Infrastructure
- **Docker**: [Thay đổi container/config]
- **Environment**: [Env variables mới]

## Blockers & Issues
[Ghi nhận vấn đề gặp phải và cách giải quyết]

## Kết quả
[Sẽ cập nhật khi hoàn thành - links, screenshots, metrics]
```

### Main Task Checklist Template (checklist.md)

```markdown
# Checklist: [Tên Task]

## Thông tin cơ bản
- **Task**: [Tên task chính]
- **Trạng thái tổng thể**: [/] Đang thực hiện
- **Cập nhật lần cuối**: [DD/MM/YYYY]

## Completion Checklist
### Planning & Setup
- [ ] Task được định nghĩa rõ ràng
- [ ] Subtasks được chia nhỏ hợp lý
- [ ] Timeline được ước tính
- [ ] Resources cần thiết đã xác định

### Development
- [ ] Code implementation hoàn thành
- [ ] Unit tests được viết và pass
- [ ] Integration tests được viết và pass
- [ ] Code review được thực hiện

### Documentation & Deployment
- [ ] Documentation được cập nhật
- [ ] PR được tạo và reviewed
- [ ] PR được merged
- [ ] Deployment thành công (nếu có)

### Quality Assurance
- [ ] Manual testing hoàn thành
- [ ] Performance testing (nếu cần)
- [ ] Security review (nếu cần)
- [ ] Accessibility check (nếu có UI)

## Subtasks Progress
- [x] [subtask-name-1]: Completed [DD/MM]
- [/] [subtask-name-2]: In Progress
- [ ] [subtask-name-3]: Planned

## Notes
[Ghi chú bổ sung, blockers, issues]
```

### Subtask Overview Template (overview.md)

```markdown
# Subtask [ID]: [Tên Subtask]

## Thông tin
- **Trạng thái**: [ ] Todo / [/] Doing / [x] Done
- **Thuộc task**: [task-XXX-tên-main-task]
- **Ước tính**: [X]h | **Thực tế**: [X]h
- **Timeline**: [DD/MM] → [DD/MM]

## Mô tả
[Mô tả cụ thể công việc cần thực hiện]

## Acceptance Criteria
- [ ] [Tiêu chí 1 - có thể test được]
- [ ] [Tiêu chí 2 - có thể test được]
- [ ] [Tiêu chí 3 - có thể test được]

## Files dự kiến thay đổi
### Tạo mới
- `apps/web/src/components/[Component].tsx` - [Mô tả]
- `apps/api/src/modules/[module]/[service].service.ts` - [Mô tả]

### Sửa đổi
- `apps/web/src/pages/[page].tsx` - [Mô tả thay đổi]
- `packages/database/prisma/schema.prisma` - [Mô tả thay đổi]

## Testing Plan
- [ ] Unit tests cho [component/service]
- [ ] Integration tests cho [API endpoints]
- [ ] Manual testing scenarios

## Implementation Notes
[Ghi chú kỹ thuật, decisions, trade-offs]

## Kết quả
- **PR**: [Link to PR]
- **Screenshots**: [Nếu có UI changes]
- **Performance**: [Metrics nếu có]
```

### Subtask Checklist Template (checklist.md)

```markdown
# Checklist: [Tên Subtask]

## Thông tin
- **Subtask**: [Tên subtask]
- **Thuộc task**: [Tên main task]
- **Trạng thái**: [ ] Todo / [/] Doing / [x] Done
- **Cập nhật lần cuối**: [DD/MM/YYYY]

## Development Checklist
### Planning
- [ ] Requirements được hiểu rõ
- [ ] Technical approach được xác định
- [ ] Dependencies được xác định

### Implementation
- [ ] Code implementation hoàn thành
- [ ] Unit tests được viết
- [ ] Unit tests pass
- [ ] Code được review

### Testing
- [ ] Manual testing hoàn thành
- [ ] Integration testing (nếu cần)
- [ ] Edge cases được test

### Documentation
- [ ] Code comments đầy đủ
- [ ] Documentation được cập nhật
- [ ] PR description đầy đủ

## Acceptance Criteria Progress
- [ ] [Tiêu chí 1 - có thể test được]
- [ ] [Tiêu chí 2 - có thể test được]
- [ ] [Tiêu chí 3 - có thể test được]

## Blockers & Issues
[Ghi nhận vấn đề gặp phải]

## Notes
[Ghi chú bổ sung]
```

### Subtask Report Template (report.md)

```markdown
# Report: [Tên Subtask]

## Thông tin hoàn thành
- **Subtask**: [Tên subtask]
- **Thuộc task**: [Tên main task]
- **Ngày hoàn thành**: [DD/MM/YYYY]
- **Thời gian thực tế**: [X]h (Ước tính: [X]h)

## Kết quả đạt được
### Code Changes
- **Files created**: [Số lượng files tạo mới]
- **Files modified**: [Số lượng files sửa đổi]
- **Lines of code**: +[X] -[Y]

### Features Implemented
- [Feature 1 - mô tả ngắn]
- [Feature 2 - mô tả ngắn]
- [Feature 3 - mô tả ngắn]

## Technical Details
### Architecture Changes
[Mô tả thay đổi về kiến trúc nếu có]

### Database Changes
[Mô tả thay đổi database nếu có]

### API Changes
[Mô tả thay đổi API nếu có]

## Testing Results
### Unit Tests
- **Tests added**: [X]
- **Coverage**: [X]%
- **All tests pass**: [Yes/No]

### Manual Testing
- **Scenarios tested**: [X]
- **Bugs found**: [X]
- **Bugs fixed**: [X]

## Performance Impact
- **Load time**: [Before] → [After]
- **Memory usage**: [Before] → [After]
- **Bundle size**: [Before] → [After]

## Links & References
- **PR**: [Link to PR]
- **Screenshots**: [Links nếu có UI changes]
- **Demo**: [Link demo nếu có]

## Lessons Learned
[Những bài học rút ra từ subtask này]

## Next Steps
[Các bước tiếp theo hoặc follow-up tasks]
```

## Dashboard Template

```markdown
# NyNus Development Dashboard
*Cập nhật: [DD/MM/YYYY]*

## 📊 Tổng quan
- **Active Tasks**: [X]
- **Completed This Month**: [X]
- **Overall Progress**: [X]%

## 🔄 Active Tasks
### task-001: [Tên task] - [X]% complete
- [x] subtask-01: [Tên] ✅
- [/] subtask-02: [Tên] 🔄
- [ ] subtask-03: [Tên] ⏳

### task-002: [Tên task] - [X]% complete
- [/] subtask-01: [Tên] 🔄
- [ ] subtask-02: [Tên] ⏳

## ✅ Recently Completed
- [DD/MM] task-XXX: [Tên task]
- [DD/MM] task-XXX: [Tên task]

## 📋 Next Planned
- task-XXX: [Tên task] - Planned start [DD/MM]

## 🚨 Blockers
[Các vấn đề đang block progress]

## 📈 Metrics
- **Average completion time**: [X] days
- **Velocity**: [X] subtasks/week
```

## Naming Conventions

### Folders và Files
```bash
# Task folders (trong docs/work-tracking/active/)
auth-optimization/
question-management/
ui-improvements/

# Files trong mỗi task folder
overview.md                    # Tổng quan nhiệm vụ chính
checklist.md                   # Checklist nhiệm vụ chính

# Subtask folders (trong task folder)
jwt-implementation/
rate-limiting/
session-management/

# Files trong mỗi subtask folder
overview.md                    # Tổng quan nhiệm vụ con
checklist.md                   # Checklist nhiệm vụ con
report.md                      # Report kết quả nhiệm vụ con
```

### Git Workflow
```bash
# Branch naming (sử dụng tên task và subtask)
feature/auth-optimization-jwt-implementation
bugfix/question-management-validation-fix
refactor/ui-improvements-component-structure

# Commit messages
[AUTH-OPT-JWT] Implement JWT token optimization
[QUEST-MGT-VAL] Fix question validation logic
[UI-IMP-COMP] Refactor component structure
```

## Best Practices

### 1. Keep It Simple
- Chỉ track thông tin cần thiết
- Tránh over-documentation
- Focus vào actionable items

### 2. Update Regularly
- Cập nhật status hàng ngày
- Ghi nhận blockers ngay khi gặp
- Review progress weekly

### 3. NyNus-Specific Guidelines
- Luôn consider monorepo impact
- Test cả web và api apps
- Update Docker configs nếu cần
- Maintain TypeScript strict mode

### 4. Quality Control
- Ensure acceptance criteria are testable
- Link PRs to subtasks
- Document breaking changes
- Update relevant documentation

## Quick Commands

```bash
# Tạo task folder mới với cấu trúc hoàn chỉnh
mkdir -p docs/work-tracking/active/[task-name]
cd docs/work-tracking/active/[task-name]
touch overview.md checklist.md

# Tạo subtask folder
mkdir -p [subtask-name]
cd [subtask-name]
touch overview.md checklist.md report.md

# Check active tasks
ls docs/work-tracking/active/

# Check subtasks trong một task
ls docs/work-tracking/active/[task-name]/

# Archive completed task
mv docs/work-tracking/active/[task-name] docs/work-tracking/completed/

# Tạo nhanh cấu trúc task hoàn chỉnh
mkdir -p docs/work-tracking/active/[task-name]/{[subtask-1],[subtask-2]}
touch docs/work-tracking/active/[task-name]/{overview.md,checklist.md}
touch docs/work-tracking/active/[task-name]/[subtask-1]/{overview.md,checklist.md,report.md}
touch docs/work-tracking/active/[task-name]/[subtask-2]/{overview.md,checklist.md,report.md}
```

---

*Quy trình này được thiết kế để đơn giản, thực tế và phù hợp với workflow phát triển NyNus. Focus vào việc hoàn thành công việc thay vì documentation overhead.*
