# 🌿 Git Workflow Guide

## Branch Strategy

We use **Git Flow** with the following branch structure:

```
main/           # Production-ready code (stable releases)
├── develop/    # Integration branch (active development)
├── feature/    # Feature development branches
├── hotfix/     # Emergency fixes for production
└── release/    # Release preparation branches
```

## Branch Descriptions

### **main**
- **Purpose**: Production-ready code
- **Protection**: Protected branch, requires PR reviews
- **Deployment**: Automatically deployed to production
- **Direct commits**: ❌ Not allowed

### **develop** 
- **Purpose**: Active development and integration
- **Protection**: Protected branch, requires PR reviews
- **Testing**: All features are tested here before release
- **Direct commits**: ❌ Not allowed (use feature branches)

### **feature/**
- **Purpose**: New feature development
- **Naming**: `feature/user-authentication`, `feature/exam-grading`
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via Pull Request

### **hotfix/**
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/security-patch`, `hotfix/critical-bug`
- **Base**: Created from `main`
- **Merge**: To both `main` and `develop`

### **release/**
- **Purpose**: Release preparation and testing
- **Naming**: `release/v1.0.0`, `release/v1.1.0`
- **Base**: Created from `develop`
- **Merge**: To both `main` and `develop`

## Development Workflow

### **1. Starting New Feature**
```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
git add .
git commit -m "feat: add amazing feature"

# Push feature branch
git push -u origin feature/your-feature-name
```

### **2. Creating Pull Request**
1. Go to GitHub repository
2. Click "New Pull Request"
3. **Base**: `develop` ← **Compare**: `feature/your-feature-name`
4. Fill in PR template
5. Request reviews
6. Wait for approval and CI/CD to pass

### **3. After PR Approval**
```bash
# Switch back to develop
git checkout develop

# Pull the merged changes
git pull origin develop

# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote feature branch (optional)
git push origin --delete feature/your-feature-name
```

### **4. Creating Release**
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Update version numbers, changelog, etc.
# Test thoroughly

# Push release branch
git push -u origin release/v1.0.0

# Create PR to main
# After approval, merge to main and tag
```

### **5. Hotfix Process**
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Fix the issue
git add .
git commit -m "fix: resolve critical security issue"

# Push hotfix
git push -u origin hotfix/critical-fix

# Create PRs to both main and develop
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples
```bash
feat(auth): add JWT token validation
fix(user): resolve registration email bug
docs(api): update gRPC service documentation
test(user): add unit tests for user service
ci(backend): add automated testing pipeline
```

## Branch Protection Rules

### **main branch**
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to main
- ✅ Require linear history

### **develop branch**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict direct pushes

## CI/CD Integration

### **Automated Testing**
- **feature/** branches: Run tests on PR creation
- **develop** branch: Full test suite + integration tests
- **main** branch: Full test suite + deployment

### **Deployment**
- **develop** → Staging environment
- **main** → Production environment

## Quick Commands

```bash
# Check current branch
git branch

# Switch to develop
git checkout develop

# Create new feature
git checkout -b feature/my-feature

# Push current branch
git push -u origin $(git branch --show-current)

# Update from remote
git pull origin $(git branch --show-current)

# View branch history
git log --oneline --graph --all

# Clean up merged branches
git branch --merged | grep -v main | grep -v develop | xargs -n 1 git branch -d
```

## Best Practices

1. **Always work in feature branches**
2. **Keep commits small and focused**
3. **Write descriptive commit messages**
4. **Test before creating PR**
5. **Review code thoroughly**
6. **Keep develop and main up to date**
7. **Delete merged feature branches**
8. **Use meaningful branch names**

## Current Setup

- ✅ **main**: Production-ready code
- ✅ **develop**: Active development (current branch)
- 🔄 **CI/CD**: Automated testing and deployment
- 🔒 **Protection**: Branch protection rules configured
