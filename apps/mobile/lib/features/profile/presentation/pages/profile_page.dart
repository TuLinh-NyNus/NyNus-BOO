import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/features/profile/presentation/widgets/profile_header.dart';
import 'package:mobile/features/profile/presentation/widgets/stats_card.dart';
import 'package:mobile/features/profile/presentation/widgets/achievement_badge.dart';
import 'package:mobile/shared/widgets/shimmer_loading.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return CustomScrollView(
              slivers: [
                // Hero Header with Avatar
                SliverAppBar(
                  expandedHeight: 200,
                  floating: false,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: ProfileHeader(user: state.user),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => _navigateToEditProfile(context),
                      tooltip: 'Chỉnh sửa hồ sơ',
                    ),
                  ],
                ),
                
                // Statistics Section
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Thống kê',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 16),
                        
                        // Stats Grid
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          childAspectRatio: 1.2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          children: [
                            StatsCard(
                              icon: Icons.quiz,
                              title: 'Câu hỏi đã làm',
                              value: '1,234',
                              color: Colors.blue,
                            ),
                            StatsCard(
                              icon: Icons.assignment_turned_in,
                              title: 'Đề thi hoàn thành',
                              value: '45',
                              color: Colors.green,
                            ),
                            StatsCard(
                              icon: Icons.trending_up,
                              title: 'Độ chính xác',
                              value: '87%',
                              color: Colors.orange,
                            ),
                            StatsCard(
                              icon: Icons.emoji_events,
                              title: 'Điểm trung bình',
                              value: '8.5',
                              color: Colors.purple,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Achievements Section
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Thành tích',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 16),
                        
                        // Achievement badges
                        SizedBox(
                          height: 120,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            children: [
                              AchievementBadge(
                                icon: Icons.star,
                                title: 'Người mới',
                                description: 'Hoàn thành đề thi đầu tiên',
                                isUnlocked: true,
                                color: Colors.amber,
                              ),
                              const SizedBox(width: 12),
                              AchievementBadge(
                                icon: Icons.local_fire_department,
                                title: 'Streak 7 ngày',
                                description: 'Học liên tục 7 ngày',
                                isUnlocked: true,
                                color: Colors.red,
                              ),
                              const SizedBox(width: 12),
                              AchievementBadge(
                                icon: Icons.school,
                                title: 'Học giỏi',
                                description: 'Đạt 90% trong 10 đề thi',
                                isUnlocked: false,
                                color: Colors.blue,
                              ),
                              const SizedBox(width: 12),
                              AchievementBadge(
                                icon: Icons.emoji_events,
                                title: 'Cao thủ',
                                description: 'Hoàn thành 100 đề thi',
                                isUnlocked: false,
                                color: Colors.purple,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Recent Activity
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hoạt động gần đây',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 16),
                        
                        // Activity list
                        ..._buildRecentActivities(context),
                      ],
                    ),
                  ),
                ),
                
                // Settings Section
                SliverList(
                  delegate: SliverChildListDelegate([
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.person),
                      title: const Text('Chỉnh sửa hồ sơ'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _navigateToEditProfile(context),
                    ),
                    ListTile(
                      leading: const Icon(Icons.lock),
                      title: const Text('Đổi mật khẩu'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _navigateToChangePassword(context),
                    ),
                    ListTile(
                      leading: const Icon(Icons.devices),
                      title: const Text('Thiết bị đã đăng nhập'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _navigateToSessions(context),
                    ),
                    ListTile(
                      leading: const Icon(Icons.settings),
                      title: const Text('Cài đặt'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _navigateToSettings(context),
                    ),
                    ListTile(
                      leading: const Icon(Icons.help_outline),
                      title: const Text('Trợ giúp'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _navigateToHelp(context),
                    ),
                    const Divider(),
                    ListTile(
                      leading: Icon(
                        Icons.logout,
                        color: Theme.of(context).colorScheme.error,
                      ),
                      title: Text(
                        'Đăng xuất',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                      onTap: () => _showLogoutDialog(context),
                    ),
                    const SizedBox(height: 32), // Bottom padding
                  ]),
                ),
              ],
            );
          }
          
          if (state is AuthLoading) {
            return CustomScrollView(
              slivers: [
                // Shimmer Header
                SliverAppBar(
                  expandedHeight: 200,
                  floating: false,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Theme.of(context).colorScheme.primary,
                            Theme.of(context).colorScheme.primary.withOpacity(0.8),
                          ],
                        ),
                      ),
                      child: SafeArea(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: ShimmerLoading(
                            isLoading: true,
                            baseColor: Colors.white.withOpacity(0.3),
                            highlightColor: Colors.white.withOpacity(0.1),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const ShimmerCircle(size: 100),
                                const SizedBox(height: 16),
                                ShimmerBox(width: 200, height: 24, borderRadius: BorderRadius.circular(12)),
                                const SizedBox(height: 8),
                                ShimmerBox(width: 150, height: 16, borderRadius: BorderRadius.circular(8)),
                                const SizedBox(height: 12),
                                ShimmerBox(width: 100, height: 28, borderRadius: BorderRadius.circular(14)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                
                // Shimmer Stats
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ShimmerLoading(
                          isLoading: true,
                          child: const ShimmerLine(width: 100, height: 24),
                        ),
                        const SizedBox(height: 16),
                        const ProfileStatsShimmer(),
                      ],
                    ),
                  ),
                ),
                
                // Shimmer List Items
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const ListItemShimmer(),
                    childCount: 8,
                  ),
                ),
              ],
            );
          }
          
          // Not authenticated - shouldn't happen on profile page
          return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
                  Icons.person_off,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
                  'Chưa đăng nhập',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
                  'Vui lòng đăng nhập để xem hồ sơ',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    // Navigate to login
                    Navigator.pushReplacementNamed(context, '/login');
                  },
                  child: const Text('Đăng nhập'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Widget> _buildRecentActivities(BuildContext context) {
    final activities = [
      {
        'icon': Icons.quiz,
        'title': 'Hoàn thành đề thi Toán học - Lớp 10',
        'subtitle': 'Điểm: 8.5/10 • 2 giờ trước',
        'color': Colors.green,
      },
      {
        'icon': Icons.bookmark,
        'title': 'Lưu 5 câu hỏi Vật lý',
        'subtitle': '1 ngày trước',
        'color': Colors.blue,
      },
      {
        'icon': Icons.assignment,
        'title': 'Bắt đầu đề thi Hóa học - Lớp 11',
        'subtitle': 'Điểm: 9.0/10 • 3 ngày trước',
        'color': Colors.orange,
      },
    ];

    return activities.map((activity) {
      return ListTile(
        leading: CircleAvatar(
          backgroundColor: (activity['color'] as Color).withOpacity(0.1),
          child: Icon(
            activity['icon'] as IconData,
            color: activity['color'] as Color,
          ),
        ),
        title: Text(activity['title'] as String),
        subtitle: Text(activity['subtitle'] as String),
        contentPadding: EdgeInsets.zero,
      );
    }).toList();
  }

  void _navigateToEditProfile(BuildContext context) {
    // TODO: Navigate to edit profile page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng chỉnh sửa hồ sơ sẽ sớm có!'),
      ),
    );
  }

  void _navigateToChangePassword(BuildContext context) {
    // TODO: Navigate to change password page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng đổi mật khẩu sẽ sớm có!'),
      ),
    );
  }

  void _navigateToSessions(BuildContext context) {
    // TODO: Navigate to active sessions page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng quản lý thiết bị sẽ sớm có!'),
      ),
    );
  }

  void _navigateToSettings(BuildContext context) {
    // TODO: Navigate to settings page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng cài đặt sẽ sớm có!'),
      ),
    );
  }

  void _navigateToHelp(BuildContext context) {
    // TODO: Navigate to help page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tính năng trợ giúp sẽ sớm có!'),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc muốn đăng xuất khỏi ứng dụng?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }
}

