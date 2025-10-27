import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/navigation/routes.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Header
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: theme.colorScheme.onPrimary,
              child: Text(
                'U',
                style: TextStyle(
                  color: theme.colorScheme.primary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            accountName: Text(
              'User Name',
              style: TextStyle(color: theme.colorScheme.onPrimary),
            ),
            accountEmail: Text(
              'user@example.com',
              style: TextStyle(color: theme.colorScheme.onPrimary),
            ),
          ),

          // Profile
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Hồ sơ'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.profile);
            },
          ),

          // Bookmarks
          ListTile(
            leading: const Icon(Icons.bookmark),
            title: const Text('Đã lưu'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.bookmarkedQuestions);
            },
          ),

          // Exam History
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Lịch sử thi'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.examHistory);
            },
          ),

          // Downloads
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Tải xuống'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.downloads);
            },
          ),

          // Statistics
          ListTile(
            leading: const Icon(Icons.bar_chart),
            title: const Text('Thống kê'),
            onTap: () {
              Navigator.pop(context);
              context.push('${Routes.profile}/statistics');
            },
          ),

          // Active Sessions
          ListTile(
            leading: const Icon(Icons.devices),
            title: const Text('Thiết bị đăng nhập'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.sessions);
            },
          ),

          const Divider(),

          // Settings
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Cài đặt'),
            onTap: () {
              Navigator.pop(context);
              context.push(Routes.settings);
            },
          ),

          const Divider(),

          // Logout
          ListTile(
            leading: Icon(
              Icons.logout,
              color: theme.colorScheme.error,
            ),
            title: Text(
              'Đăng xuất',
              style: TextStyle(color: theme.colorScheme.error),
            ),
            onTap: () async {
              Navigator.pop(context);
              
              final shouldLogout = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Đăng xuất'),
                  content: const Text('Bạn có chắc muốn đăng xuất?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Hủy'),
                    ),
                    FilledButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: FilledButton.styleFrom(
                        backgroundColor: theme.colorScheme.error,
                      ),
                      child: const Text('Đăng xuất'),
                    ),
                  ],
                ),
              );

              if (shouldLogout == true && context.mounted) {
                // Will trigger auth bloc logout
                // context.read<AuthBloc>().add(AuthLogoutRequested());
                context.go(Routes.login);
              }
            },
          ),
        ],
      ),
    );
  }
}

