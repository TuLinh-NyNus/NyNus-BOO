import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/core/storage/models/sync_action.dart';
import 'package:mobile/core/utils/logger.dart';
import 'package:uuid/uuid.dart';

class SyncManager {
  static final SyncManager _instance = SyncManager._internal();
  factory SyncManager() => _instance;
  SyncManager._internal();

  final _uuid = const Uuid();
  final _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  Timer? _syncTimer;
  bool _isSyncing = false;

  // Sync configuration
  static const int maxRetryAttempts = 3;
  static const Duration syncInterval = Duration(minutes: 5);
  static const Duration retryDelay = Duration(seconds: 30);

  Future<void> initialize() async {
    try {
      // Listen to connectivity changes
      _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
        _onConnectivityChanged,
      );
      
      // Start periodic sync
      _syncTimer = Timer.periodic(syncInterval, (_) => syncPending());
      
      // Initial sync if online
      final connectivityResults = await _connectivity.checkConnectivity();
      if (!connectivityResults.contains(ConnectivityResult.none)) {
        syncPending();
      }
      
      AppLogger.info('✓ Sync Manager initialized');
    } catch (e) {
      AppLogger.error('Failed to initialize Sync Manager', e);
    }
  }

  void dispose() {
    _connectivitySubscription?.cancel();
    _syncTimer?.cancel();
    AppLogger.info('Sync Manager disposed');
  }

  void _onConnectivityChanged(List<ConnectivityResult> results) {
    if (!results.contains(ConnectivityResult.none) && !_isSyncing) {
      // Back online, sync pending actions
      AppLogger.info('Network available, syncing pending actions');
      syncPending();
    }
  }

  // Queue an action for sync
  Future<void> queueAction({
    required SyncActionType type,
    required Map<String, dynamic> data,
  }) async {
    try {
      final action = SyncAction(
        id: _uuid.v4(),
        type: type,
        data: data,
        createdAt: DateTime.now(),
      );
      
      await HiveStorage.syncQueueBox.put(action.id, jsonEncode(action.toJson()));
      AppLogger.info('Queued action: ${action.type.name}');
      
      // Try immediate sync if online
      final connectivityResults = await _connectivity.checkConnectivity();
      if (!connectivityResults.contains(ConnectivityResult.none)) {
        syncPending();
      }
    } catch (e) {
      AppLogger.error('Failed to queue action', e);
    }
  }

  // Sync all pending actions
  Future<void> syncPending() async {
    if (_isSyncing) {
      AppLogger.debug('Sync already in progress, skipping');
      return;
    }
    
    final connectivityResults = await _connectivity.checkConnectivity();
    if (connectivityResults.contains(ConnectivityResult.none)) {
      AppLogger.debug('Offline - skipping sync');
      return;
    }
    
    _isSyncing = true;
    
    try {
      final pendingActions = await _getPendingActions();
      
      if (pendingActions.isEmpty) {
        AppLogger.debug('No pending actions to sync');
        return;
      }
      
      AppLogger.info('Syncing ${pendingActions.length} pending actions...');
      
      for (final action in pendingActions) {
        await _syncAction(action);
      }
      
      AppLogger.info('✓ Sync completed');
    } catch (e) {
      AppLogger.error('Sync error', e);
    } finally {
      _isSyncing = false;
    }
  }

  Future<List<SyncAction>> _getPendingActions() async {
    final actions = <SyncAction>[];
    
    for (final key in HiveStorage.syncQueueBox.keys) {
      final jsonString = HiveStorage.syncQueueBox.get(key);
      if (jsonString != null) {
        try {
          final action = SyncAction.fromJson(jsonDecode(jsonString));
          if (action.status == SyncStatus.pending || 
              (action.status == SyncStatus.failed && action.retryCount < maxRetryAttempts)) {
            actions.add(action);
          }
        } catch (e) {
          AppLogger.error('Error parsing sync action', e);
          // Remove corrupted entry
          await HiveStorage.syncQueueBox.delete(key);
        }
      }
    }
    
    // Sort by creation date (oldest first)
    actions.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    
    return actions;
  }

  Future<void> _syncAction(SyncAction action) async {
    try {
      // Update status to syncing
      await _updateAction(action.copyWith(
        status: SyncStatus.syncing,
        lastAttempt: DateTime.now(),
      ));
      
      // Execute sync based on type
      await _executeSyncAction(action);
      
      // Mark as completed and remove from queue
      await HiveStorage.syncQueueBox.delete(action.id);
      AppLogger.info('✓ Synced action: ${action.type.name}');
      
    } catch (e) {
      AppLogger.error('Error syncing action ${action.id}', e);
      
      // Update retry count
      final updatedAction = action.copyWith(
        status: SyncStatus.failed,
        retryCount: action.retryCount + 1,
        error: e.toString(),
        lastAttempt: DateTime.now(),
      );
      
      if (updatedAction.retryCount >= maxRetryAttempts) {
        // Max retries reached, remove from queue
        AppLogger.warning('Max retries reached for action ${action.id}, removing from queue');
        await HiveStorage.syncQueueBox.delete(action.id);
        
        // TODO: Notify user about failed sync
      } else {
        // Save for retry
        await _updateAction(updatedAction);
        AppLogger.info('Will retry action ${action.id} (attempt ${updatedAction.retryCount}/$maxRetryAttempts)');
      }
    }
  }

  Future<void> _executeSyncAction(SyncAction action) async {
    // Placeholder implementations - will be completed after service clients are ready
    switch (action.type) {
      case SyncActionType.submitAnswer:
        await _syncSubmitAnswer(action.data);
        break;
      case SyncActionType.completeExam:
        await _syncCompleteExam(action.data);
        break;
      case SyncActionType.bookmarkQuestion:
        await _syncBookmarkQuestion(action.data);
        break;
      case SyncActionType.unbookmarkQuestion:
        await _syncUnbookmarkQuestion(action.data);
        break;
      case SyncActionType.rateQuestion:
        await _syncRateQuestion(action.data);
        break;
      case SyncActionType.updateProfile:
        await _syncUpdateProfile(action.data);
        break;
      default:
        AppLogger.warning('Unknown sync action type: ${action.type}');
    }
  }

  Future<void> _updateAction(SyncAction action) async {
    await HiveStorage.syncQueueBox.put(
      action.id,
      jsonEncode(action.toJson()),
    );
  }

  // Sync implementations (placeholders for now)
  Future<void> _syncSubmitAnswer(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing submit answer: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _syncCompleteExam(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing complete exam: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _syncBookmarkQuestion(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing bookmark question: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _syncUnbookmarkQuestion(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing unbookmark question: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _syncRateQuestion(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing rate question: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _syncUpdateProfile(Map<String, dynamic> data) async {
    // TODO: Implement after service clients are ready
    AppLogger.debug('Syncing update profile: $data');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  // Get sync status
  Future<SyncStatusInfo> getSyncStatus() async {
    final actions = await _getPendingActions();
    
    return SyncStatusInfo(
      pendingCount: actions.length,
      isSyncing: _isSyncing,
      lastSyncTime: await _getLastSyncTime(),
      failedCount: actions.where((a) => a.status == SyncStatus.failed).length,
    );
  }

  Future<DateTime?> _getLastSyncTime() async {
    // TODO: Store last successful sync time in settings
    return null;
  }
}

class SyncStatusInfo {
  final int pendingCount;
  final bool isSyncing;
  final DateTime? lastSyncTime;
  final int failedCount;

  SyncStatusInfo({
    required this.pendingCount,
    required this.isSyncing,
    this.lastSyncTime,
    required this.failedCount,
  });

  bool get hasUnsyncedData => pendingCount > 0;
  bool get hasSyncErrors => failedCount > 0;
  
  @override
  String toString() {
    return 'SyncStatus(pending: $pendingCount, syncing: $isSyncing, failed: $failedCount)';
  }
}

