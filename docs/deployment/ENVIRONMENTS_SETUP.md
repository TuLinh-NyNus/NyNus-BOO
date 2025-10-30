# GitHub Environments Setup Guide - NyNus

**Mục đích**: Hướng dẫn tạo và cấu hình GitHub Environments để CI/CD workflows có thể sử dụng deployment protection rules.

**Thời gian**: 10 phút  
**Yêu cầu**: Admin/Owner access vào GitHub repository

---

## 📋 Tổng quan

GitHub Environments cho phép:
- ✅ Deployment protection rules (require approvals)
- ✅ Environment-specific secrets
- ✅ Deployment history tracking
- ✅ Branch restrictions

---

## 🚀 Bước 1: Truy cập Environments Settings

1. Mở repository: `https://github.com/TuLinh-NyNus/NyNus-BOO`
2. Click **Settings** (tab phải cùng)
3. Sidebar trái: Click **Environments**
4. Click **New environment**

---

## 🔧 Bước 2: Tạo Environment `staging`

### Thông tin cơ bản

**Environment name**: `staging`

### Protection rules

- ❌ **Required reviewers**: Không cần (để auto-deploy)
- ❌ **Wait timer**: Không cần
- ❌ **Branch restrictions**: Không cần (allow all branches)

### Environment secrets

**Không cần** - Sử dụng repository secrets đã được cấu hình (xem `SECRETS_SETUP.md`)

### Kết quả

✅ Environment `staging` đã được tạo  
✅ Workflows có thể deploy tự động mà không cần approval  
✅ Phù hợp cho auto-deploy từ branch `main`

---

## 🔧 Bước 3: Tạo Environment `production-approval`

### Thông tin cơ bản

**Environment name**: `production-approval`

### Protection rules

#### ✅ Required reviewers: **1 người**

**Cách thêm**:
1. Click **Add required reviewers**
2. Chọn user hoặc team (ví dụ: `@TuLinh-NyNus` hoặc team `@devops`)
3. Click **Save protection rules**

**Mục đích**: Gatekeeping step trước khi deploy production - verify thông tin deployment

#### ❌ Wait timer: Không cần

#### ❌ Branch restrictions: Không cần

### Environment secrets

**Không cần**

### Kết quả

✅ Environment `production-approval` đã được tạo  
✅ Workflows sẽ yêu cầu 1 approval trước khi tiếp tục  
✅ Sử dụng cho pre-deployment checks

---

## 🔧 Bước 4: Tạo Environment `production`

### Thông tin cơ bản

**Environment name**: `production`

### Protection rules

#### ✅ Required reviewers: **2+ người**

**Cách thêm**:
1. Click **Add required reviewers**
2. Chọn ít nhất 2 users hoặc 1 team (ví dụ: `@team-lead`, `@devops-lead`)
3. Click **Save protection rules**

**Lưu ý**: GitHub yêu cầu TẤT CẢ reviewers phải approve, không chỉ 1 người.

#### ✅ Wait timer: **5 minutes** (Optional - Khuyến nghị)

**Mục đích**: Cho team thời gian cuối cùng để cancel deployment nếu phát hiện vấn đề

**Cách thêm**:
1. Check **Enable wait timer**
2. Nhập: `5` minutes
3. Click **Save protection rules**

#### ✅ Branch restrictions: **main only** (Recommended)

**Cách thêm**:
1. Click **Add restriction**
2. Select: `main` branch
3. Click **Save protection rules**

**Mục đích**: Chỉ cho phép deploy từ branch `main` đã được test kỹ

### Environment secrets

**Có thể thêm** production-specific secrets nếu cần (khác với staging)

**Ví dụ**:
- `PROD_DATABASE_URL`
- `PROD_API_KEY`
- `PROD_SECRET_KEY`

### Kết quả

✅ Environment `production` đã được tạo  
✅ Yêu cầu 2+ approvals  
✅ Wait timer 5 phút  
✅ Chỉ deploy từ `main` branch  
✅ **Highly secured** cho production

---

## 🔧 Bước 5: Tạo Environment `production-canary` (Optional)

### Thông tin cơ bản

**Environment name**: `production-canary`

**Mục đích**: Deploy canary release (5-10% traffic) trước khi full production rollout

### Protection rules

#### ✅ Required reviewers: **1 người**

**Cách thêm**: Tương tự như `production-approval`

#### ❌ Wait timer: Không cần

#### ✅ Branch restrictions: **main only**

### Environment secrets

**Không cần** - Dùng chung với production

### Kết quả

✅ Environment `production-canary` đã được tạo  
✅ Cho phép canary deployment với 1 approval  
✅ Sử dụng cho gradual rollout strategy

---

## ✅ Verification

### Kiểm tra đã tạo đủ environments

Vào **Settings** → **Environments**, bạn sẽ thấy:

| Environment Name | Reviewers Required | Wait Timer | Branch Restrictions |
|------------------|-------------------|------------|---------------------|
| `staging` | None | None | None |
| `production-approval` | 1 | None | None |
| `production` | 2+ | 5 min | `main` |
| `production-canary` | 1 (optional) | None | `main` |

### Test approval flow

1. Vào **Actions** → **Deploy to Production**
2. Click **Run workflow**
3. Chọn deployment strategy: **blue-green**
4. Click **Run workflow**
5. Workflow sẽ dừng ở step "Pre-Deployment Checks" và chờ approval

**Verify**:
- ✅ Thấy "Waiting for review" message
- ✅ Reviewers được notify (email/GitHub notification)
- ✅ Không thể skip approval

---

## 📊 Environment Usage trong Workflows

### Staging Deployment

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  environment: staging  # ← Sử dụng environment này
  steps:
    # ... deployment steps
```

**Behavior**: Deploy ngay lập tức, không cần approval

### Production Deployment - Pre-checks

```yaml
pre-deployment:
  name: Pre-Deployment Checks
  runs-on: ubuntu-latest
  environment: production-approval  # ← 1 approval required
  steps:
    # ... pre-deployment verification
```

**Behavior**: Yêu cầu 1 approval trước khi tiếp tục

### Production Deployment - Actual deploy

```yaml
blue-green-deploy:
  name: Blue-Green Deployment
  runs-on: ubuntu-latest
  environment: production  # ← 2+ approvals + 5 min wait
  steps:
    # ... actual deployment
```

**Behavior**: Yêu cầu 2+ approvals và wait 5 phút

---

## 🎯 Best Practices

### 1. Reviewer Assignment

**❌ Don't**: Chỉ assign 1 reviewer cho production  
**✅ Do**: Assign ít nhất 2 reviewers (ideally from different teams)

**Lý do**: Prevent single point of failure, ensure cross-team review

### 2. Branch Protection

**❌ Don't**: Allow deployment from any branch to production  
**✅ Do**: Restrict to `main` branch only

**Lý do**: Đảm bảo chỉ code đã pass CI mới được deploy

### 3. Wait Timer

**❌ Don't**: Set wait timer quá dài (>15 phút)  
**✅ Do**: 5-10 phút là đủ

**Lý do**: Balance giữa safety và deployment speed

### 4. Environment Secrets

**❌ Don't**: Dùng chung production secrets cho staging  
**✅ Do**: Tạo riêng secrets cho từng environment

**Lý do**: Prevent staging accidentally using production data

---

## 🔒 Security Considerations

### 1. Least Privilege

Chỉ cho những người cần thiết (team leads, DevOps) permission để approve production deployments.

### 2. Audit Trail

GitHub tự động log tất cả deployment approvals:
- Who approved
- When approved
- What was deployed

Xem tại: **Environments** → Click environment → **Deployment history**

### 3. Emergency Rollback

Trong trường hợp khẩn cấp:
1. Có thể bypass approval bằng cách trigger rollback workflow (nếu có)
2. Hoặc manually scale down deployment via kubectl/AWS console

---

## ❓ FAQ

### Q: Có thể thay đổi số lượng reviewers sau khi tạo không?

**A**: Có. Vào **Settings** → **Environments** → Click environment → **Edit** → Thay đổi reviewers → **Save**

### Q: Ai có thể approve deployment?

**A**: Chỉ những người được add vào "Required reviewers" list. Người trigger workflow KHÔNG thể tự approve chính workflow của mình.

### Q: Nếu reviewer không online thì sao?

**A**: Deployment sẽ pending cho đến khi reviewer approve. Cân nhắc:
- Add backup reviewers
- Setup on-call rotation
- Reduce số lượng required reviewers nếu cần thiết

### Q: Có thể bypass approval trong emergency không?

**A**: Không thể bypass trực tiếp. Phải:
1. Temporarily modify environment settings (remove approval requirement)
2. Deploy
3. Restore approval requirement sau đó

**Lưu ý**: Tất cả actions sẽ được audit log.

### Q: Environment secrets khác gì repository secrets?

**A**: 
- **Repository secrets**: Available for ALL workflows
- **Environment secrets**: Chỉ available khi workflow sử dụng environment đó
- **Priority**: Environment secrets override repository secrets (cùng tên)

---

## 📚 Tài liệu liên quan

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Deployment Protection Rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#deployment-protection-rules)
- [Environment Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment)

---

**Cập nhật lần cuối**: 2025-01-30  
**Người tạo**: AI Assistant (Claude)  
**Status**: ✅ Ready to use

