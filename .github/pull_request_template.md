## 📝 Description

<!-- Describe the changes you've made -->

## 🎯 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security improvement

## 📋 Related Issues

Closes #(issue number)

## ✅ Checklist

### Code Quality
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated documentation accordingly

### Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests passed locally with my changes
- [ ] I have added integration tests if applicable
- [ ] I have verified the changes work across different browsers (if frontend)
- [ ] I have verified the changes work across different devices (if mobile)

### Backend (Go)
- [ ] Code passes `go fmt`
- [ ] Code passes `go vet`
- [ ] Code passes `golangci-lint`
- [ ] All tests pass: `go test ./...`
- [ ] No hardcoded values or secrets in code
- [ ] Database migrations are included (if applicable)

### Frontend (TypeScript/Next.js)
- [ ] Code passes ESLint: `pnpm lint`
- [ ] TypeScript types are correct: `pnpm type-check`
- [ ] Unit tests pass: `pnpm test:unit`
- [ ] E2E tests pass (if applicable)
- [ ] No console warnings or errors
- [ ] Responsive design verified
- [ ] Accessibility checklist completed (WCAG AA)

### Mobile (Flutter/Dart)
- [ ] Code passes Flutter analysis: `flutter analyze`
- [ ] Code is formatted: `flutter format`
- [ ] Unit tests pass: `flutter test`
- [ ] Widget tests pass
- [ ] No warnings in output
- [ ] Tested on both iOS and Android (if possible)

### Security
- [ ] No sensitive data exposed (API keys, passwords, tokens)
- [ ] Input validation implemented
- [ ] Authentication/authorization checks implemented
- [ ] SQL injection protection verified (if applicable)
- [ ] CORS settings properly configured (if applicable)

### Performance
- [ ] No performance regressions
- [ ] Database queries optimized (if applicable)
- [ ] Bundle size impact assessed
- [ ] Load time verified

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Comments added for complex logic
- [ ] CHANGELOG updated (if needed)

## 🖼️ Screenshots

<!-- Add screenshots if this is a UI change -->

## 📊 Performance Impact

<!-- Describe any performance implications -->
- Load time impact: <!-- e.g., +10ms, negligible, -5% -->
- Bundle size impact: <!-- e.g., +50KB, negligible -->
- Database query impact: <!-- e.g., no change, 1 additional query per request -->

## 🔄 Deployment Notes

<!-- Any special deployment instructions or dependencies -->

## 👥 Reviewers

<!-- Tag reviewers -->
@mention-reviewers

