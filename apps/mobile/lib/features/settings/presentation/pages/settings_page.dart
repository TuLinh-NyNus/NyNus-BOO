import 'package:flutter/material.dart';
import 'package:mobile/core/storage/app_settings.dart';
import 'package:go_router/go_router.dart';

class SettingsPage extends StatelessWidget {
  static const String routeName = '/settings';
  
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài đặt'),
      ),
      body: ListView(
        children: [
          // Appearance Section
          _buildSection(
            context,
            title: 'Giao diện',
            children: [
              _buildThemeSetting(context),
              _buildLanguageSetting(context),
              _buildFontSizeSetting(context),
            ],
          ),

          const Divider(height: 32),

          // Notifications Section
          _buildSection(
            context,
            title: 'Thông báo',
            children: [
              _buildNotificationsSetting(context),
              _buildSoundsSetting(context),
              _buildVibrateSetting(context),
            ],
          ),

          const Divider(height: 32),

          // Data & Storage Section
          _buildSection(
            context,
            title: 'Dữ liệu & Lưu trữ',
            children: [
              _buildOfflineModeSetting(context),
              _buildAutoSyncSetting(context),
              _buildDownloadWifiOnlySetting(context),
            ],
          ),

          const Divider(height: 32),

          // Exam Settings Section
          _buildSection(
            context,
            title: 'Cài đặt thi',
            children: [
              _buildExamTimerWarningSetting(context),
            ],
          ),

          const Divider(height: 32),

          // Account Section
          _buildSection(
            context,
            title: 'Tài khoản',
            children: [
              ListTile(
                leading: const Icon(Icons.devices),
                title: const Text('Thiết bị đăng nhập'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/profile/sessions'),
              ),
            ],
          ),

          const Divider(height: 32),

          // About Section
          _buildSection(
            context,
            title: 'Thông tin',
            children: [
              const ListTile(
                leading: Icon(Icons.info_outline),
                title: Text('Về ứng dụng'),
                subtitle: Text('Phiên bản 1.0.0'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title.toUpperCase(),
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        ...children,
      ],
    );
  }

  Widget _buildThemeSetting(BuildContext context) {
    return FutureBuilder<ThemeMode>(
      future: AppSettings.getThemeMode(),
      builder: (context, snapshot) {
        final currentTheme = snapshot.data ?? ThemeMode.system;
        
        return ListTile(
          leading: const Icon(Icons.palette_outlined),
          title: const Text('Giao diện'),
          subtitle: Text(_getThemeLabel(currentTheme)),
          onTap: () async {
            final selected = await showDialog<ThemeMode>(
              context: context,
              builder: (context) => SimpleDialog(
                title: const Text('Chọn giao diện'),
                children: [
                  RadioListTile<ThemeMode>(
                    title: const Text('Sáng'),
                    value: ThemeMode.light,
                    groupValue: currentTheme,
                    onChanged: (value) => Navigator.pop(context, value),
                  ),
                  RadioListTile<ThemeMode>(
                    title: const Text('Tối'),
                    value: ThemeMode.dark,
                    groupValue: currentTheme,
                    onChanged: (value) => Navigator.pop(context, value),
                  ),
                  RadioListTile<ThemeMode>(
                    title: const Text('Theo hệ thống'),
                    value: ThemeMode.system,
                    groupValue: currentTheme,
                    onChanged: (value) => Navigator.pop(context, value),
                  ),
                ],
              ),
            );

            if (selected != null) {
              await AppSettings.setThemeMode(selected);
              // Restart app or trigger rebuild
            }
          },
        );
      },
    );
  }

  Widget _buildLanguageSetting(BuildContext context) {
    return FutureBuilder<String>(
      future: AppSettings.getLanguage(),
      builder: (context, snapshot) {
        final language = snapshot.data ?? 'vi';
        
        return ListTile(
          leading: const Icon(Icons.language),
          title: const Text('Ngôn ngữ'),
          subtitle: Text(language == 'vi' ? 'Tiếng Việt' : 'English'),
        );
      },
    );
  }

  Widget _buildFontSizeSetting(BuildContext context) {
    return FutureBuilder<double>(
      future: AppSettings.getFontSize(),
      builder: (context, snapshot) {
        final fontSize = snapshot.data ?? 1.0;
        
        return ListTile(
          leading: const Icon(Icons.text_fields),
          title: const Text('Cỡ chữ'),
          subtitle: Text(_getFontSizeLabel(fontSize)),
        );
      },
    );
  }

  Widget _buildNotificationsSetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.areNotificationsEnabled(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? true;
        
        return SwitchListTile(
          secondary: const Icon(Icons.notifications_outlined),
          title: const Text('Thông báo'),
          subtitle: const Text('Nhận thông báo từ ứng dụng'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setNotifications(value);
          },
        );
      },
    );
  }

  Widget _buildSoundsSetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.areSoundsEnabled(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? true;
        
        return SwitchListTile(
          secondary: const Icon(Icons.volume_up_outlined),
          title: const Text('Âm thanh'),
          subtitle: const Text('Phát âm thanh thông báo'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setSounds(value);
          },
        );
      },
    );
  }

  Widget _buildVibrateSetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.isVibrateEnabled(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? true;
        
        return SwitchListTile(
          secondary: const Icon(Icons.vibration),
          title: const Text('Rung'),
          subtitle: const Text('Rung khi có thông báo'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setVibrate(value);
          },
        );
      },
    );
  }

  Widget _buildOfflineModeSetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.isOfflineMode(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? false;
        
        return SwitchListTile(
          secondary: const Icon(Icons.cloud_off_outlined),
          title: const Text('Chế độ ngoại tuyến'),
          subtitle: const Text('Chỉ sử dụng dữ liệu đã tải'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setOfflineMode(value);
          },
        );
      },
    );
  }

  Widget _buildAutoSyncSetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.isAutoSyncEnabled(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? true;
        
        return SwitchListTile(
          secondary: const Icon(Icons.sync),
          title: const Text('Tự động đồng bộ'),
          subtitle: const Text('Đồng bộ dữ liệu khi có mạng'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setAutoSync(value);
          },
        );
      },
    );
  }

  Widget _buildDownloadWifiOnlySetting(BuildContext context) {
    return FutureBuilder<bool>(
      future: AppSettings.isDownloadWifiOnly(),
      builder: (context, snapshot) {
        final enabled = snapshot.data ?? true;
        
        return SwitchListTile(
          secondary: const Icon(Icons.wifi),
          title: const Text('Chỉ tải qua WiFi'),
          subtitle: const Text('Chỉ tải file khi kết nối WiFi'),
          value: enabled,
          onChanged: (value) async {
            await AppSettings.setDownloadWifiOnly(value);
          },
        );
      },
    );
  }

  Widget _buildExamTimerWarningSetting(BuildContext context) {
    return FutureBuilder<int>(
      future: AppSettings.getExamTimerWarning(),
      builder: (context, snapshot) {
        final minutes = snapshot.data ?? 5;
        
        return ListTile(
          leading: const Icon(Icons.timer_outlined),
          title: const Text('Cảnh báo thời gian thi'),
          subtitle: Text('Cảnh báo trước $minutes phút'),
        );
      },
    );
  }

  String _getThemeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'Sáng';
      case ThemeMode.dark:
        return 'Tối';
      case ThemeMode.system:
        return 'Theo hệ thống';
    }
  }

  String _getFontSizeLabel(double size) {
    if (size < 0.9) return 'Rất nhỏ';
    if (size < 1.0) return 'Nhỏ';
    if (size < 1.1) return 'Mặc định';
    if (size < 1.3) return 'Lớn';
    return 'Rất lớn';
  }
}

