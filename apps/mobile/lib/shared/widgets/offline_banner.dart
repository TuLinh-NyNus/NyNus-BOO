import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineBanner extends StatefulWidget {
  final Widget child;

  const OfflineBanner({
    super.key,
    required this.child,
  });

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  bool _isOffline = false;
  bool _wasOffline = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _slideAnimation = Tween<double>(
      begin: -1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _checkConnectivity();
    _listenToConnectivityChanges();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _checkConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    _updateConnectionStatus(connectivityResult);
  }

  void _listenToConnectivityChanges() {
    Connectivity().onConnectivityChanged.listen(_updateConnectionStatus);
  }

  void _updateConnectionStatus(ConnectivityResult result) {
    final isOffline = result == ConnectivityResult.none;
    
    if (isOffline != _isOffline) {
      setState(() {
        _wasOffline = _isOffline;
        _isOffline = isOffline;
      });

      if (_isOffline) {
        _animationController.forward();
      } else {
        // Show "Back online" message briefly before hiding
        if (_wasOffline) {
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted && !_isOffline) {
              _animationController.reverse();
            }
          });
        } else {
          _animationController.reverse();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: SlideTransition(
            position: _slideAnimation,
            child: SafeArea(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                height: _isOffline || (_wasOffline && !_isOffline) ? 40 : 0,
                decoration: BoxDecoration(
                  color: _isOffline 
                      ? Colors.red[600] 
                      : Colors.green[600],
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isOffline 
                          ? Icons.wifi_off 
                          : Icons.wifi,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _isOffline 
                          ? 'Không có kết nối mạng'
                          : 'Đã kết nối lại',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// Connectivity service for global access
class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  bool _isOnline = true;
  final List<Function(bool)> _listeners = [];

  bool get isOnline => _isOnline;

  void initialize() {
    _checkConnectivity();
    Connectivity().onConnectivityChanged.listen(_updateConnectionStatus);
  }

  void addListener(Function(bool) listener) {
    _listeners.add(listener);
  }

  void removeListener(Function(bool) listener) {
    _listeners.remove(listener);
  }

  void _checkConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    _updateConnectionStatus(connectivityResult);
  }

  void _updateConnectionStatus(ConnectivityResult result) {
    final isOnline = result != ConnectivityResult.none;
    
    if (isOnline != _isOnline) {
      _isOnline = isOnline;
      for (final listener in _listeners) {
        listener(_isOnline);
      }
    }
  }
}

// Widget to show offline message in specific areas
class OfflineMessage extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const OfflineMessage({
    super.key,
    this.message = 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        border: Border.all(color: Colors.orange[200]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.wifi_off,
            color: Colors.orange[600],
            size: 32,
          ),
          const SizedBox(height: 12),
          Text(
            message,
            style: TextStyle(
              color: Colors.orange[800],
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.orange[600],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
