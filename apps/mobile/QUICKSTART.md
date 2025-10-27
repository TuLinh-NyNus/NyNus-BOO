# ⚡ Quick Start Guide

Get up and running in 5 minutes!

---

## 📋 Prerequisites

Before you start:
- [ ] Flutter SDK 3.19+ installed
- [ ] Dart 3.3+ installed
- [ ] Android Studio or VS Code
- [ ] Git installed

**Check your setup:**
```bash
flutter doctor -v
```

---

## 🚀 Setup (First Time)

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd exam-bank-system/apps/mobile
```

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Run the App
```bash
flutter run
```

That's it! 🎉

---

## 🔧 Common Commands

### Development
```bash
# Run app
flutter run

# Run on specific device
flutter run -d android
flutter run -d ios

# Hot reload: Press 'r' in terminal
# Hot restart: Press 'R' in terminal
```

### Code Quality
```bash
# Analyze code
flutter analyze

# Format code
dart format lib/

# Run tests
flutter test
```

### Code Generation
```bash
# Generate code (freezed, json_serializable, etc.)
flutter pub run build_runner build --delete-conflicting-outputs

# Watch mode (auto-generate on changes)
flutter pub run build_runner watch
```

---

## 📝 Generate Proto Files

### Windows
```powershell
cd apps\mobile
.\scripts\generate_proto.ps1
```

### Mac/Linux
```bash
cd apps/mobile
chmod +x scripts/generate_proto.sh
./scripts/generate_proto.sh
```

**First time?** See [README_PROTO_GENERATION.md](./README_PROTO_GENERATION.md)

---

## 🗂️ Project Structure

```
apps/mobile/
├── lib/
│   ├── core/           # Core infrastructure
│   ├── features/       # App features
│   ├── shared/         # Shared components
│   └── main.dart       # Entry point
├── test/               # Tests
└── scripts/            # Build scripts
```

---

## 🎯 What's Implemented?

### ✅ Phase 1: Foundation
- Clean architecture
- Theme system
- Dependency injection
- Error handling

### ✅ Phase 2: gRPC
- gRPC client
- Service wrappers
- Interceptors
- Testing

### ⏳ Phase 3: Storage
- Coming next...

**Full status**: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)

---

## 💡 Quick Tips

### VS Code Extensions
Install recommended extensions:
- Dart
- Flutter
- Flutter Snippets
- Error Lens

### Hot Reload
Save file or press `r` in terminal for instant updates!

### Debug Mode
Press `p` in terminal to show performance overlay

### Clear Cache
```bash
flutter clean
flutter pub get
```

---

## 🐛 Common Issues

### Issue: Can't run app
**Solution:**
```bash
flutter clean
flutter pub get
flutter run
```

### Issue: Build errors after pull
**Solution:**
```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### Issue: Proto files not found
**Solution:**
```bash
# Generate them first
./scripts/generate_proto.sh
```

---

## 📚 Learn More

- **Complete Setup**: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)
- **Next Steps**: [NEXT_STEPS.md](./NEXT_STEPS.md)
- **gRPC Guide**: [GRPC_SETUP_COMPLETE.md](./GRPC_SETUP_COMPLETE.md)
- **All Docs**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

## 🎓 Development Workflow

1. **Start Development**
   ```bash
   flutter run
   ```

2. **Make Changes**
   - Edit files
   - Save (hot reload happens automatically)

3. **Test Changes**
   ```bash
   flutter test
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: your feature"
   ```

---

## 🔗 Useful Links

- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [BLoC Library](https://bloclibrary.dev/)
- [gRPC Dart](https://grpc.io/docs/languages/dart/)

---

## ✅ Next Steps

After setup:
1. Read [NEXT_STEPS.md](./NEXT_STEPS.md)
2. Generate proto files
3. Start building features!

---

**Need Help?** Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

**Ready to Code?** Let's go! 🚀

