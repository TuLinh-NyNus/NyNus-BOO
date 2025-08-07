import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserManagementModule } from './user-management/user-management.module';
import { SecurityModule } from './security/security.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { ResourcesModule } from './resources/resources.module';
import { RolesModule } from './roles/roles.module';
import { SessionsModule } from './sessions/sessions.module';

/**
 * Admin Module - Core admin functionality
 * Module quản trị - Chức năng quản trị cốt lõi
 */
@Module({
  imports: [
    UserManagementModule,
    SecurityModule,
    SettingsModule,
    NotificationsModule,
    AuditModule,
    ResourcesModule,
    RolesModule,
    SessionsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
