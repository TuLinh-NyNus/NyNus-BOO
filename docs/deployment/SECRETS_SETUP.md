# GitHub Secrets Setup Guide - NyNus CI/CD

**Mục đích**: Hướng dẫn cấu hình đầy đủ GitHub Secrets để các CI/CD workflows có thể chạy thành công.

**Thời gian**: 15-20 phút  
**Yêu cầu**: Admin/Owner access vào GitHub repository

---

## 📋 Tổng quan

Các CI/CD workflows của NyNus yêu cầu các secrets sau để hoạt động đầy đủ. **Lưu ý**: Nếu chưa có staging/production environment, bạn vẫn có thể để trống các secrets này - workflows sẽ tự động skip các bước deployment.

### 🔴 **Critical Secrets** (Required for full functionality)

| Secret Name | Mục đích | Workflow sử dụng |
|-------------|----------|------------------|
| `DEPLOY_METHOD` | Phương thức deployment (docker-compose/kubernetes) | Deploy to Staging |
| `AWS_ACCESS_KEY_ID` | AWS credentials | Deploy workflows |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Deploy workflows |
| `AWS_REGION` | AWS region | Deploy workflows |

### 🟡 **Important Secrets** (Recommended for staging)

| Secret Name | Mục đích | Workflow sử dụng |
|-------------|----------|------------------|
| `STAGING_HOST` | Staging server address | Deploy to Staging |
| `DEPLOY_SSH_KEY` | SSH key for deployment | Deploy to Staging |
| `KUBE_CONFIG_STAGING` | Kubernetes config (if using K8s) | Deploy to Staging |
| `STAGING_API_URL` | Staging API endpoint | Deploy to Staging |
| `STAGING_URL` | Staging frontend URL | Deploy to Staging, Smoke Tests |

### 🟢 **Optional Secrets** (Nice to have)

| Secret Name | Mục đích | Workflow sử dụng |
|-------------|----------|------------------|
| `SLACK_WEBHOOK_STAGING` | Slack notifications for staging | Deploy to Staging |
| `SLACK_WEBHOOK_PROD` | Slack notifications for production | Deploy to Production |
| `SNYK_TOKEN` | Security vulnerability scanning | Frontend/Backend CI |
| `CODECOV_TOKEN` | Code coverage reporting | CI workflows |
| `KUBE_CONFIG_PROD` | Kubernetes config for production | Deploy to Production |
| `PROD_API_URL` | Production API endpoint | Deploy to Production |
| `PROD_URL` | Production frontend URL | Deploy to Production |

---

## 🚀 Bước 1: Truy cập GitHub Secrets Settings

1. Mở repository: `https://github.com/TuLinh-NyNus/NyNus-BOO`
2. Click **Settings** (tab phải cùng)
3. Sidebar trái: Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

---

## 🔧 Bước 2: Thêm từng Secret

### A. Deployment Method (`DEPLOY_METHOD`)

**Name**: `DEPLOY_METHOD`  
**Value**: Chọn 1 trong 2:
- `docker-compose` - Nếu deploy bằng Docker Compose trên VPS/server
- `kubernetes` - Nếu deploy lên Kubernetes cluster

**Ví dụ**:
```
docker-compose
```

---

### B. AWS Credentials (Nếu sử dụng AWS)

#### `AWS_ACCESS_KEY_ID`

**Cách lấy**:
1. Đăng nhập AWS Console
2. Vào **IAM** → **Users** → Chọn user của bạn
3. Tab **Security credentials**
4. Click **Create access key**
5. Copy **Access key ID**

**Name**: `AWS_ACCESS_KEY_ID`  
**Value**: `AKIAIOSFODNN7EXAMPLE` (thay bằng key thật của bạn)

#### `AWS_SECRET_ACCESS_KEY`

**Name**: `AWS_SECRET_ACCESS_KEY`  
**Value**: Paste secret key từ bước trên (chỉ hiển thị 1 lần khi tạo)

#### `AWS_REGION`

**Name**: `AWS_REGION`  
**Value**: `us-east-1` (hoặc region bạn sử dụng, ví dụ: `ap-southeast-1` cho Singapore)

---

### C. SSH Deployment (Nếu dùng Docker Compose)

#### `DEPLOY_SSH_KEY`

**Cách tạo**:
```bash
# Trên máy local
ssh-keygen -t ed25519 -C "deployment@nynus" -f ~/.ssh/nynus-deploy

# Copy private key
cat ~/.ssh/nynus-deploy
```

**Name**: `DEPLOY_SSH_KEY`  
**Value**: Paste toàn bộ nội dung private key (bao gồm `-----BEGIN OPENSSH PRIVATE KEY-----` và `-----END OPENSSH PRIVATE KEY-----`)

**Lưu ý**: Thêm public key (`~/.ssh/nynus-deploy.pub`) vào server staging:
```bash
# Trên staging server
echo "ssh-ed25519 AAAAC3Nza... deployment@nynus" >> ~/.ssh/authorized_keys
```

#### `STAGING_HOST`

**Name**: `STAGING_HOST`  
**Value**: `user@staging-server-ip`

**Ví dụ**:
```
ubuntu@staging.nynus.edu.vn
```
hoặc
```
deploy@192.168.1.100
```

---

### D. Kubernetes (Nếu dùng K8s)

#### `KUBE_CONFIG_STAGING`

**Cách lấy**:
```bash
# Trên máy có kubectl configured
kubectl config view --raw --minify

# Base64 encode
kubectl config view --raw --minify | base64 -w 0
```

**Name**: `KUBE_CONFIG_STAGING`  
**Value**: Paste output của lệnh base64 ở trên (1 dòng dài)

#### `KUBE_CONFIG_PROD`

Tương tự như `KUBE_CONFIG_STAGING` nhưng cho production cluster.

---

### E. URLs và Endpoints

#### `STAGING_API_URL`

**Name**: `STAGING_API_URL`  
**Value**: `staging-api.nynus.edu.vn` (hoặc IP:port, ví dụ: `192.168.1.100:8080`)

**Lưu ý**: KHÔNG bao gồm `http://` hoặc `https://`

#### `STAGING_URL`

**Name**: `STAGING_URL`  
**Value**: `staging.nynus.edu.vn`

#### `PROD_API_URL` và `PROD_URL`

Tương tự như staging, nhưng cho production.

---

### F. Notifications (Optional)

#### Slack Webhooks

**Cách lấy**:
1. Vào Slack workspace
2. **Apps** → Search "Incoming Webhooks"
3. Click **Add to Slack**
4. Chọn channel (ví dụ: `#deployments`)
5. Copy **Webhook URL**

**Name**: `SLACK_WEBHOOK_STAGING`  
**Value**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

Tương tự cho `SLACK_WEBHOOK_PROD`.

#### Snyk Token (Security Scanning)

**Cách lấy**:
1. Đăng ký tài khoản tại https://snyk.io
2. Vào **Settings** → **General**
3. Copy **Auth Token**

**Name**: `SNYK_TOKEN`  
**Value**: Paste Snyk auth token

#### Codecov Token (Code Coverage)

**Cách lấy**:
1. Đăng ký tại https://codecov.io
2. Add repository
3. Copy **Upload Token**

**Name**: `CODECOV_TOKEN`  
**Value**: Paste Codecov token

---

## ✅ Bước 3: Tạo GitHub Environments

1. Vào **Settings** → **Environments**
2. Click **New environment**
3. Tạo các environments sau:

### Environment 1: `staging`

- **Name**: `staging`
- **Protection rules**: Không cần (auto-deploy)
- **Environment secrets**: Không cần (dùng repository secrets)

### Environment 2: `production-approval`

- **Name**: `production-approval`
- **Protection rules**: 
  - ☑️ Required reviewers: Thêm 1 người (ví dụ: team lead)
- **Environment secrets**: Không cần

### Environment 3: `production`

- **Name**: `production`
- **Protection rules**:
  - ☑️ Required reviewers: Thêm 2+ người
  - ☑️ Wait timer: 5 minutes (optional)
- **Environment secrets**: Không cần

### Environment 4: `production-canary` (Optional)

- **Name**: `production-canary`
- **Protection rules**: 1 reviewer
- **Environment secrets**: Không cần

---

## 🧪 Bước 4: Kiểm tra

### Test 1: Check secrets đã được thêm

```bash
# Không thể xem giá trị, nhưng có thể verify tên
# Vào Settings → Secrets and variables → Actions
# Kiểm tra danh sách secrets
```

### Test 2: Trigger workflow thủ công

1. Vào **Actions** tab
2. Chọn workflow "Deploy to Staging"
3. Click **Run workflow** → **Run workflow**
4. Xem logs để verify:
   - ✅ Nếu secrets đủ: Workflow sẽ chạy deployment steps
   - ⚠️ Nếu thiếu secrets: Workflow sẽ skip với warning message

---

## 🎯 Checklist Hoàn thành

### Minimum (Để workflows không fail)

- [ ] `DEPLOY_METHOD` đã được thêm (giá trị: `docker-compose` hoặc `kubernetes`)
- [ ] Các secrets còn lại có thể để trống - workflows sẽ tự động skip

### Recommended (Để có staging environment hoạt động)

- [ ] `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` (nếu dùng AWS)
- [ ] `STAGING_HOST` và `DEPLOY_SSH_KEY` (nếu dùng Docker Compose)
- [ ] `KUBE_CONFIG_STAGING` (nếu dùng Kubernetes)
- [ ] `STAGING_API_URL` và `STAGING_URL`

### Complete (Để có full functionality)

- [ ] Tất cả secrets ở trên
- [ ] `SLACK_WEBHOOK_STAGING` và `SLACK_WEBHOOK_PROD`
- [ ] `SNYK_TOKEN` (security scanning)
- [ ] `CODECOV_TOKEN` (code coverage)
- [ ] Production secrets (`KUBE_CONFIG_PROD`, `PROD_API_URL`, `PROD_URL`)

---

## ❓ FAQ

### Q: Tôi chưa có staging server, có cần thêm secrets không?

**A**: Không cần thiết ngay. Chỉ cần thêm `DEPLOY_METHOD` với giá trị bất kỳ (ví dụ: `skip`) để workflow không fail. Các deployment steps sẽ tự động bị skip.

### Q: Làm sao biết secrets đã hoạt động?

**A**: Xem workflow logs:
- ✅ Success: "Deployment configured" 
- ⚠️ Warning: "Deployment skipped - secrets not configured"

### Q: Có thể dùng staging local trên máy dev không?

**A**: Có thể, nhưng cần expose qua ngrok hoặc cloudflare tunnel để GitHub Actions có thể truy cập. Không khuyến khích cho production.

### Q: Secret bị lộ có sao không?

**A**: RẤT NGHIÊM TRỌNG! Ngay lập tức:
1. Rotate/regenerate secret mới (AWS, SSH key, Slack webhook)
2. Xóa secret cũ khỏi GitHub
3. Thêm secret mới vào

### Q: Có cần secrets cho CI workflows (Frontend CI, Backend CI) không?

**A**: Không cần thiết. Các CI workflows chỉ cần:
- `SNYK_TOKEN` (optional - security scanning)
- `CODECOV_TOKEN` (optional - code coverage)

Nếu thiếu, chúng sẽ tự động skip các bước tương ứng với `continue-on-error: true`.

---

## 📚 Tài liệu liên quan

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

---

**Cập nhật lần cuối**: 2025-01-30  
**Người tạo**: AI Assistant (Claude)  
**Status**: ✅ Ready to use

