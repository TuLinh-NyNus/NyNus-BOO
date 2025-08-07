import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

/**
 * Admin Controller - Main admin operations
 * Controller quản trị - Các thao tác quản trị chính
 */
@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get admin dashboard data
   * Lấy dữ liệu dashboard admin
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData() {
    return this.adminService.getDashboardData();
  }

  /**
   * Get system health status
   * Lấy trạng thái sức khỏe hệ thống
   */
  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status retrieved' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  /**
   * Get analytics data
   * Lấy dữ liệu phân tích
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics' })
  @ApiQuery({ name: 'metrics', required: false, description: 'Specific metrics to retrieve' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('metrics') metrics?: string[],
  ) {
    return this.adminService.getAnalytics({
      startDate,
      endDate,
      metrics,
    });
  }

  /**
   * Export data
   * Xuất dữ liệu
   */
  @Post('export/:type')
  @ApiOperation({ summary: 'Export data' })
  @ApiParam({ name: 'type', description: 'Type of data to export' })
  @ApiResponse({ status: 200, description: 'Data exported successfully' })
  @HttpCode(HttpStatus.OK)
  async exportData(
    @Param('type') type: string,
    @Body() params: any,
  ) {
    return this.adminService.exportData(type, params);
  }
}
