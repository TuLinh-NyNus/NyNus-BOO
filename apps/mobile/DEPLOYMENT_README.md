# 🚀 Deployment Guide

Quick reference for building and deploying NyNus Exam Bank Mobile.

---

## 📦 Build Commands

### Development
```bash
# Run on emulator/device
flutter run --flavor development --dart-define=ENVIRONMENT=development

# Build APK
flutter build apk --flavor development --debug
```

### Staging
```bash
# Android
flutter build appbundle --flavor staging --release --dart-define=ENVIRONMENT=staging

# iOS
flutter build ipa --flavor staging --release --dart-define=ENVIRONMENT=staging
```

### Production
```bash
# Use build script (recommended)
./scripts/build_release.sh production both

# Or manually:
# Android
flutter build appbundle --flavor production --release \
  --dart-define=ENVIRONMENT=production \
  --obfuscate \
  --split-debug-info=build/app/outputs/symbols

# iOS
flutter build ipa --flavor production --release \
  --dart-define=ENVIRONMENT=production \
  --obfuscate \
  --split-debug-info=build/ios/outputs/symbols
```

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing: `flutter test`
- [ ] Code analyzed: `flutter analyze`
- [ ] Proto files generated: `./scripts/generate_proto.sh`
- [ ] Version bumped: `./scripts/bump_version.sh`
- [ ] Release notes updated
- [ ] Firebase configured (if using)
- [ ] Signing certificates ready

---

## 🔧 Quick Scripts

```bash
# Run all tests
./scripts/run_tests.sh

# Build for production
./scripts/build_release.sh production both

# Bump version
./scripts/bump_version.sh
```

---

## 📱 Outputs

**Android:**
- AAB: `build/app/outputs/bundle/productionRelease/app-production-release.aab`
- APK: `build/app/outputs/flutter-apk/app-production-release.apk`

**iOS:**
- IPA: `build/ios/ipa/exam_bank_mobile.ipa`

---

## 🎯 Deployment Status

**Current Version:** 1.0.0+1  
**Ready for:** Production deployment after proto generation

---

## 📚 More Info

See `docs/arch/mobile/flutter/13-deployment.md` for complete documentation.

