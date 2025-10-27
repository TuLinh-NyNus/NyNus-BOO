import 'package:dartz/dartz.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/storage/cache_manager.dart';
import 'package:mobile/core/storage/sync_manager.dart';
import 'package:mobile/core/storage/models/sync_action.dart';
import 'package:mobile/core/utils/logger.dart';

abstract class OfflineRepositoryWrapper<T> {
  final Connectivity connectivity = Connectivity();
  final SyncManager syncManager = SyncManager();

  Future<bool> get isOnline async {
    final results = await connectivity.checkConnectivity();
    return !results.contains(ConnectivityResult.none);
  }

  Future<Either<Failure, R>> executeWithOfflineSupport<R>({
    required Future<Either<Failure, R>> Function() onlineOperation,
    required Future<Either<Failure, R>> Function() offlineOperation,
    String? cacheKey,
    Duration? cacheTTL,
    bool forceOffline = false,
  }) async {
    // Check if forced offline or actually offline
    if (forceOffline || !await isOnline) {
      AppLogger.debug('Using offline operation');
      return offlineOperation();
    }

    try {
      // Try online operation
      final result = await onlineOperation();
      
      // Cache successful result if key provided
      if (result.isRight() && cacheKey != null) {
        await result.fold(
          (failure) => null,
          (data) async {
            await CacheManager.cacheData(
              key: cacheKey,
              data: data,
              ttl: cacheTTL,
            );
          },
        );
      }
      
      return result;
    } catch (e) {
      // Fallback to offline
      AppLogger.warning('Online operation failed, falling back to offline: $e');
      return offlineOperation();
    }
  }

  Future<Either<Failure, void>> executeOfflineFirst({
    required Future<Either<Failure, void>> Function() operation,
    required SyncActionType syncType,
    required Map<String, dynamic> syncData,
  }) async {
    // Execute locally first
    final result = await operation();
    
    if (result.isRight()) {
      // Queue for sync
      await syncManager.queueAction(
        type: syncType,
        data: syncData,
      );
      AppLogger.info('Queued action for sync: $syncType');
    }
    
    return result;
  }

  Future<Either<Failure, R>> executeWithCache<R>({
    required String cacheKey,
    required Future<Either<Failure, R>> Function() operation,
    R Function(Map<String, dynamic>)? fromJson,
    Duration? cacheTTL,
  }) async {
    // Try cache first
    final cached = await CacheManager.getCachedData<R>(
      key: cacheKey,
      fromJson: fromJson,
    );
    
    if (cached != null) {
      AppLogger.debug('Returning cached data for: $cacheKey');
      return Right(cached);
    }
    
    // Not in cache, fetch from source
    final result = await operation();
    
    // Cache successful result
    if (result.isRight()) {
      await result.fold(
        (failure) => null,
        (data) => CacheManager.cacheData(
          key: cacheKey,
          data: data,
          ttl: cacheTTL,
        ),
      );
    }
    
    return result;
  }
}

