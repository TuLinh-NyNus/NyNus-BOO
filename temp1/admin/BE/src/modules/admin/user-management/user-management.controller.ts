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
import { UserManagementService } from './user-management.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/user-role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

/**
 * User Management Controller
 * Controller quản lý người dùng
 */
@ApiTags('Admin - User Management')
@ApiBearerAuth()
@Controller('api/v1/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  /**
   * Get all users with filtering and pagination
   * Lấy tất cả người dùng với lọc và phân trang
   */
  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.userManagementService.getUsers({
      page,
      limit,
      search,
      role,
      status,
    });
  }

  /**
   * Get user by ID
   * Lấy người dùng theo ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string) {
    return this.userManagementService.getUserById(id);
  }

  /**
   * Create new user
   * Tạo người dùng mới
   */
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() userData: any) {
    return this.userManagementService.createUser(userData);
  }

  /**
   * Update user
   * Cập nhật người dùng
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.userManagementService.updateUser(id, userData);
  }

  /**
   * Delete user
   * Xóa người dùng
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.userManagementService.deleteUser(id);
  }

  /**
   * Suspend user
   * Tạm ngưng người dùng
   */
  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(@Param('id') id: string, @Body() reason?: any) {
    return this.userManagementService.suspendUser(id, reason?.reason);
  }

  /**
   * Activate user
   * Kích hoạt người dùng
   */
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Param('id') id: string) {
    return this.userManagementService.activateUser(id);
  }

  /**
   * Get user sessions
   * Lấy phiên của người dùng
   */
  @Get(':id/sessions')
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully' })
  async getUserSessions(@Param('id') id: string) {
    return this.userManagementService.getUserSessions(id);
  }

  /**
   * Get user statistics
   * Lấy thống kê người dùng
   */
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats() {
    return this.userManagementService.getUserStats();
  }

  /**
   * Export users data
   * Xuất dữ liệu người dùng
   */
  @Post('export')
  @ApiOperation({ summary: 'Export users data' })
  @ApiResponse({ status: 200, description: 'Users data exported successfully' })
  async exportUsers(@Body() filters: any) {
    return this.userManagementService.exportUsers(filters);
  }
}
