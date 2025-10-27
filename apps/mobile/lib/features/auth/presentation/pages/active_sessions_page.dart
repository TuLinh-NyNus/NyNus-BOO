import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/session/session_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/auth/domain/entities/user_session.dart';
import 'package:intl/intl.dart';

class ActiveSessionsPage extends StatelessWidget {
  static const String routeName = '/profile/sessions';
  
  const ActiveSessionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thiết bị đăng nhập'),
        actions: [
          BlocBuilder<SessionBloc, SessionState>(
            builder: (context, state) {
              if (state is SessionsLoaded && state.sessions.length > 1) {
                return TextButton(
                  onPressed: () => _showTerminateAllDialog(context),
                  style: TextButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.error,
                  ),
                  child: const Text('Đăng xuất tất cả'),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: BlocConsumer<SessionBloc, SessionState>(
        listener: (context, state) {
          if (state is SessionTerminated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đã đăng xuất thiết bị'),
                backgroundColor: Colors.green,
              ),
            );
            
            // Reload sessions
            context.read<SessionBloc>().add(SessionsLoadRequested());
          } else if (state is AllSessionsTerminated) {
            // Logout user
            Navigator.of(context).popUntil((route) => route.isFirst);
            context.read<AuthBloc>().add(AuthLogoutRequested());
          } else if (state is SessionError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is SessionLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
          
          if (state is SessionsLoaded) {
            if (state.sessions.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.devices,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Không có phiên đăng nhập nào',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              );
            }
            
            return RefreshIndicator(
              onRefresh: () async {
                context.read<SessionBloc>().add(SessionsLoadRequested());
                await Future.delayed(const Duration(seconds: 1));
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Info Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Quản lý thiết bị',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Bạn có thể đăng nhập tối đa 3 thiết bị cùng lúc. '
                            'Khi đăng nhập thiết bị thứ 4, thiết bị cũ nhất sẽ tự động đăng xuất.',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Hiện tại: ${state.sessions.length}/3 thiết bị',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: state.sessions.length >= 3
                                  ? Colors.orange
                                  : Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Sessions List
                  ...state.sessions.map((session) => _buildSessionCard(
                    context,
                    session,
                    state.currentSessionToken,
                  )),
                ],
              ),
            );
          }
          
          return const Center(
            child: Text('Không thể tải danh sách thiết bị'),
          );
        },
      ),
    );
  }

  Widget _buildSessionCard(
    BuildContext context,
    UserSession session,
    String? currentSessionToken,
  ) {
    final isCurrent = session.sessionToken == currentSessionToken;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Device Name & Current Badge
            Row(
              children: [
                Icon(
                  _getDeviceIcon(session.deviceName),
                  size: 32,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            session.deviceName,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          if (isCurrent) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Thiết bị này',
                                style: TextStyle(
                                  color: Colors.green.shade700,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        session.location ?? 'Unknown Location',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isCurrent)
                  IconButton(
                    icon: const Icon(Icons.logout),
                    color: Theme.of(context).colorScheme.error,
                    onPressed: () => _showTerminateDialog(context, session),
                  ),
              ],
            ),
            
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            
            // Session Details
            Row(
              children: [
                Expanded(
                  child: _buildDetailRow(
                    context,
                    Icons.access_time,
                    'Hoạt động',
                    _formatTime(session.lastActivity),
                  ),
                ),
                Expanded(
                  child: _buildDetailRow(
                    context,
                    Icons.location_on_outlined,
                    'IP',
                    session.ipAddress,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.bodySmall,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  IconData _getDeviceIcon(String deviceName) {
    if (deviceName.contains('iPhone') || deviceName.contains('Android')) {
      return Icons.phone_android;
    }
    if (deviceName.contains('iPad')) {
      return Icons.tablet_mac;
    }
    if (deviceName.contains('PC') || deviceName.contains('Mac')) {
      return Icons.computer;
    }
    return Icons.devices;
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);
    
    if (difference.inMinutes < 1) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} giờ trước';
    } else {
      return DateFormat('dd/MM/yyyy HH:mm').format(time);
    }
  }

  Future<void> _showTerminateDialog(
    BuildContext context,
    UserSession session,
  ) async {
    final shouldTerminate = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất thiết bị?'),
        content: Text(
          'Bạn có chắc muốn đăng xuất khỏi ${session.deviceName}?\n\n'
          'Thiết bị này sẽ cần đăng nhập lại.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );

    if (shouldTerminate == true && context.mounted) {
      context.read<SessionBloc>().add(
        SessionTerminateRequested(sessionId: session.id),
      );
    }
  }

  Future<void> _showTerminateAllDialog(BuildContext context) async {
    final shouldTerminate = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất tất cả thiết bị?'),
        content: const Text(
          'Bạn có chắc muốn đăng xuất khỏi tất cả thiết bị?\n\n'
          'Bạn sẽ cần đăng nhập lại trên tất cả thiết bị.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Đăng xuất tất cả'),
          ),
        ],
      ),
    );

    if (shouldTerminate == true && context.mounted) {
      context.read<SessionBloc>().add(AllSessionsTerminateRequested());
    }
  }
}

