import 'package:local_auth/local_auth.dart';
import 'package:mobile/core/utils/logger.dart';

class BiometricAuth {
  static final LocalAuthentication _auth = LocalAuthentication();

  /// Check if biometric authentication is available on device
  static Future<bool> isAvailable() async {
    try {
      final canCheckBiometrics = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      
      return canCheckBiometrics && isDeviceSupported;
    } catch (e) {
      AppLogger.error('Error checking biometric availability', e);
      return false;
    }
  }

  /// Get list of available biometric types
  static Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (e) {
      AppLogger.error('Error getting available biometrics', e);
      return [];
    }
  }

  /// Authenticate using biometrics
  static Future<bool> authenticate({
    String localizedReason = 'Vui lòng xác thực để đăng nhập',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      final isAvail = await isAvailable();
      
      if (!isAvail) {
        AppLogger.warning('Biometric authentication not available');
        return false;
      }

      final authenticated = await _auth.authenticate(
        localizedReason: localizedReason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );

      if (authenticated) {
        AppLogger.info('Biometric authentication successful');
      } else {
        AppLogger.warning('Biometric authentication failed');
      }

      return authenticated;
    } catch (e) {
      AppLogger.error('Biometric authentication error', e);
      return false;
    }
  }

  /// Stop authentication
  static Future<void> stopAuthentication() async {
    try {
      await _auth.stopAuthentication();
    } catch (e) {
      AppLogger.error('Error stopping authentication', e);
    }
  }

  /// Get biometric type name
  static String getBiometricTypeName(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Vân tay';
      case BiometricType.iris:
        return 'Iris';
      case BiometricType.strong:
        return 'Xác thực mạnh';
      case BiometricType.weak:
        return 'Xác thực yếu';
    }
  }
}

