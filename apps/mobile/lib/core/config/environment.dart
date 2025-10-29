enum Environment { development, staging, production }

class EnvironmentConfig {
  static Environment get current {
    const envName = String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');
    switch (envName) {
      case 'staging':
        return Environment.staging;
      case 'production':
        return Environment.production;
      default:
        return Environment.development;
    }
  }

  static bool get isDevelopment => current == Environment.development;
  static bool get isStaging => current == Environment.staging;
  static bool get isProduction => current == Environment.production;

  // API Configuration
  static String get apiHost {
    switch (current) {
      case Environment.development:
        return '10.0.2.2'; // Android emulator
      case Environment.staging:
        return 'staging.nynus-exambank.com';
      case Environment.production:
        return 'api.nynus-exambank.com';
    }
  }

  static int get grpcPort {
    switch (current) {
      case Environment.development:
        return 50051;
      case Environment.staging:
        return 50051;
      case Environment.production:
        return 443; // Production uses secure port
    }
  }

  static String get appName {
    switch (current) {
      case Environment.development:
        return 'NyNus Exam Bank (Dev)';
      case Environment.staging:
        return 'NyNus Exam Bank (Staging)';
      case Environment.production:
        return 'NyNus Exam Bank';
    }
  }

  // Feature flags
  static bool get enableDebugTools => !isProduction;
  static bool get enableAnalytics => isProduction || isStaging;
  static bool get enableCrashReporting => isProduction || isStaging;
  static bool get verboseLogging => isDevelopment;
}

