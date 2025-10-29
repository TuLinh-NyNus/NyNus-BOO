import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/di/injection.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/logger.dart';
import 'package:mobile/core/network/service_registry.dart';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/core/storage/sync_manager.dart';
import 'package:mobile/core/storage/migration_manager.dart';
import 'package:mobile/core/navigation/app_router.dart';
import 'package:mobile/core/storage/secure_storage.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Initialize Hive Storage
  try {
    await HiveStorage.initialize();
    AppLogger.info('✓ Hive storage initialized');
  } catch (e) {
    AppLogger.error('Failed to initialize Hive storage', e);
  }
  
  // Run data migrations
  try {
    await MigrationManager.runMigrations();
    AppLogger.info('✓ Data migrations complete');
  } catch (e) {
    AppLogger.error('Migration failed', e);
  }
  
  // Initialize Dependency Injection
  try {
    configureDependencies();
    AppLogger.info('✓ Dependency Injection configured');
  } catch (e) {
    AppLogger.error('Failed to configure DI', e);
  }
  
  // Initialize gRPC Services
  try {
    await ServiceRegistry.initializeAll();
    AppLogger.info('✓ gRPC Services initialized');
  } catch (e) {
    AppLogger.error('Failed to initialize gRPC services', e);
    // Continue anyway for offline mode
  }
  
  // Initialize Sync Manager
  try {
    await SyncManager().initialize();
    AppLogger.info('✓ Sync Manager initialized');
  } catch (e) {
    AppLogger.error('Failed to initialize Sync Manager', e);
  }
  
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late GoRouter _router;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _initializeRouter();
    _checkAuthStatus();
  }

  void _initializeRouter() {
    _router = AppRouter.createRouter(
      isAuthenticated: _isAuthenticated,
      onAuthStateChange: _onAuthStateChange,
    );
  }

  Future<void> _checkAuthStatus() async {
    final hasValidSession = await SecureStorage.hasValidSession();
    if (mounted && hasValidSession != _isAuthenticated) {
      setState(() {
        _isAuthenticated = hasValidSession;
      });
    }
  }

  void _onAuthStateChange() {
    _checkAuthStatus();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NyNus Exam Bank',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: _router,
    );
  }
}

