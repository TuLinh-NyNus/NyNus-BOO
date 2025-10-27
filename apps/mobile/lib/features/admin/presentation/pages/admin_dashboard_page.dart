import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminDashboardPage extends StatelessWidget {
  static const String routeName = '/admin';
  
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản trị hệ thống'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Quick Stats
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _buildStatCard(
                context,
                'Users',
                '0',
                Icons.people_outline,
                Colors.blue,
                () => context.push('/admin/users'),
              ),
              _buildStatCard(
                context,
                'Questions',
                '0',
                Icons.quiz_outlined,
                Colors.green,
                () => context.push('/admin/questions'),
              ),
              _buildStatCard(
                context,
                'Exams',
                '0',
                Icons.assignment_outlined,
                Colors.orange,
                () => context.push('/admin/exams'),
              ),
              _buildStatCard(
                context,
                'Pending',
                '0',
                Icons.pending_actions,
                Colors.red,
                () => context.push('/admin/content/pending'),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Quick Actions
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 12),
          
          ListTile(
            leading: const Icon(Icons.people),
            title: const Text('User Management'),
            subtitle: const Text('Manage roles and permissions'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/admin/users'),
          ),
          
          ListTile(
            leading: const Icon(Icons.approval),
            title: const Text('Content Moderation'),
            subtitle: const Text('Approve pending content'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/admin/content/moderation'),
          ),
          
          ListTile(
            leading: const Icon(Icons.analytics),
            title: const Text('System Analytics'),
            subtitle: const Text('View system statistics'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/admin/analytics'),
          ),
          
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Audit Logs'),
            subtitle: const Text('View system audit trail'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/admin/audit-logs'),
          ),
          
          const SizedBox(height: 24),
          
          // Coming Soon
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Icon(
                    Icons.construction,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Admin features',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sẽ sớm có sau khi tích hợp backend',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 32),
              const Spacer(),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: color,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

