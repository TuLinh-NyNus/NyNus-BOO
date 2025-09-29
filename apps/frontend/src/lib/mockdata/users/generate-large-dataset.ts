/**
 * Generate Large Dataset for Testing Pagination
 * Tạo 200+ users mockdata để test pagination với tên tiếng Việt
 */

import { UserRole as MockdataUserRole, UserStatus as MockdataUserStatus, ProfileVisibility } from '../core-types';
import { AdminUser } from '../types';
import {
  convertEnumRoleToProtobuf,
  convertEnumStatusToProtobuf
} from '@/lib/utils/type-converters';

// Danh sách tên tiếng Việt
const vietnameseFirstNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đào', 'Lương', 'Tô',
  'Vương', 'Tạ', 'Thái', 'Hà', 'Trịnh', 'Nông', 'Lâm', 'Châu', 'Mai', 'Cao'
];

const vietnameseLastNames = [
  'Văn Anh', 'Thị Bình', 'Minh Châu', 'Hoàng Dũng', 'Thị Hoa', 'Văn Hùng', 'Thị Lan', 'Minh Long',
  'Thị Mai', 'Văn Nam', 'Thị Oanh', 'Minh Phúc', 'Thị Quỳnh', 'Văn Sơn', 'Thị Tâm', 'Minh Tuấn',
  'Thị Uyên', 'Văn Việt', 'Thị Xuân', 'Minh Yến', 'Văn Đức', 'Thị Linh', 'Minh Khôi', 'Thị Ngọc',
  'Văn Phong', 'Thị Thu', 'Minh Trí', 'Thị Vân', 'Văn Hiếu', 'Thị Diệu', 'Minh Đạt', 'Thị Hương',
  'Văn Kiên', 'Thị Loan', 'Minh Nhật', 'Thị Pha', 'Văn Quang', 'Thị Rạng', 'Minh Sang', 'Thị Thảo',
  'Văn Uy', 'Thị Vui', 'Minh Xuân', 'Thị Yên', 'Văn Zung', 'Thị An', 'Minh Bảo', 'Thị Cẩm',
  'Văn Đăng', 'Thị Ế', 'Minh Phát', 'Thị Giang', 'Văn Hải', 'Thị Ích', 'Minh Khánh', 'Thị Lệ'
];

const vietnameseBios = [
  'Học sinh chăm chỉ, yêu thích môn Toán và Lý',
  'Sinh viên năm 3 ngành Công nghệ thông tin',
  'Giáo viên có 5 năm kinh nghiệm giảng dạy',
  'Quản trị viên hệ thống với chuyên môn cao',
  'Trợ giảng tích cực, hỗ trợ học sinh hiệu quả',
  'Học viên mới, đang khám phá các khóa học',
  'Chuyên gia trong lĩnh vực giáo dục trực tuyến',
  'Sinh viên xuất sắc với nhiều thành tích học tập',
  'Giảng viên kinh nghiệm, được học sinh yêu mến',
  'Người dùng tích cực tham gia cộng đồng học tập'
];

const vietnameseAdminNotes = [
  'Người dùng tích cực, không có vấn đề gì',
  'Cần theo dõi hoạt động đăng nhập',
  'Học viên xuất sắc, có nhiều đóng góp',
  'Tài khoản mới, cần xác minh thông tin',
  'Người dùng có uy tín cao trong cộng đồng',
  'Cần cập nhật thông tin liên hệ',
  'Hoạt động bình thường, không có cảnh báo',
  'Tài khoản VIP, ưu tiên hỗ trợ',
  'Cần kiểm tra lại quyền truy cập',
  'Người dùng thường xuyên, đáng tin cậy'
];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string, role: MockdataUserRole): string {
  const cleanFirstName = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
  
  const rolePrefix = role === MockdataUserRole.STUDENT ? 'hv' :
                    role === MockdataUserRole.TEACHER ? 'gv' :
                    role === MockdataUserRole.TUTOR ? 'tg' :
                    role === MockdataUserRole.ADMIN ? 'admin' : 'user';
  
  const randomNum = getRandomNumber(100, 999);
  return `${rolePrefix}${randomNum}.${cleanFirstName}.${cleanLastName}@gmail.com`;
}

// Generate users by role
function generateUsersByRole(role: MockdataUserRole, count: number, startId: number): AdminUser[] {
  const users: AdminUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const firstName = getRandomElement(vietnameseFirstNames);
    const lastName = getRandomElement(vietnameseLastNames);
    const email = generateEmail(firstName, lastName, role);
    
    // Level logic: STUDENT/TUTOR có level 1-9, TEACHER/ADMIN/GUEST không có level
    const level = (role === MockdataUserRole.STUDENT || role === MockdataUserRole.TUTOR) ? getRandomNumber(1, 9) : null;
    
    // Status distribution: 70% ACTIVE, 20% INACTIVE, 8% SUSPENDED, 2% PENDING_VERIFICATION
    const statusRand = Math.random();
    const enumStatus = statusRand < 0.7 ? MockdataUserStatus.ACTIVE :
                      statusRand < 0.9 ? MockdataUserStatus.INACTIVE :
                      statusRand < 0.98 ? MockdataUserStatus.SUSPENDED : MockdataUserStatus.PENDING_VERIFICATION;
    const status = convertEnumStatusToProtobuf(enumStatus);
    
    // Email verification: 85% verified
    const emailVerified = Math.random() < 0.85;
    
    // Risk score: 0-100, với distribution thực tế
    const riskScore = Math.random() < 0.7 ? getRandomNumber(0, 30) :  // 70% low risk
                     Math.random() < 0.9 ? getRandomNumber(31, 70) :  // 20% medium risk
                     getRandomNumber(71, 100);  // 10% high risk
    
    // Active sessions: 1-5
    const activeSessionsCount = getRandomNumber(1, 5);
    
    // Dates
    const createdAt = getRandomDate(new Date('2023-01-01'), new Date('2024-12-31'));
    const lastLoginAt = getRandomDate(createdAt, new Date());
    
    const user: AdminUser = {
      // ===== CORE REQUIRED FIELDS =====
      id: `${role.toLowerCase()}-${String(id).padStart(3, '0')}`,
      email,
      role: convertEnumRoleToProtobuf(role),
      status,
      emailVerified,
      createdAt,
      updatedAt: getRandomDate(createdAt, new Date()),

      // ===== AUTHENTICATION FIELDS =====
      googleId: Math.random() < 0.3 ? `google-${role.toLowerCase()}-${id}` : undefined,
      password_hash: `$2b$12$${role}HashExample${id}`,

      // ===== CORE BUSINESS LOGIC =====
      level: level ?? undefined,
      maxConcurrentSessions: role === MockdataUserRole.ADMIN ? 5 :
                           role === MockdataUserRole.TEACHER ? 4 :
                           role === MockdataUserRole.TUTOR ? 3 : 2,

      // ===== SECURITY TRACKING =====
      lastLoginAt,
      lastLoginIp: `192.168.1.${getRandomNumber(100, 254)}`,
      loginAttempts: Math.random() < 0.1 ? getRandomNumber(1, 3) : 0,
      lockedUntil: undefined,
      activeSessionsCount,
      totalResourceAccess: getRandomNumber(10, 2000),
      riskScore,

      // ===== PROFILE INFORMATION =====
      username: `${role.toLowerCase()}_${id}`,
      firstName,
      lastName,
      avatar: `/avatars/${role.toLowerCase()}-${String(id).padStart(3, '0')}.svg`,
      bio: getRandomElement(vietnameseBios),
      phone: `+8490${getRandomNumber(1000000, 9999999)}`,
      address: `${getRandomNumber(1, 999)} ${getRandomElement(['Nguyễn Văn Linh', 'Lê Lợi', 'Trần Hưng Đạo', 'Điện Biên Phủ'])}, Q${getRandomNumber(1, 12)}, TP.HCM`,
      school: getRandomElement(['THPT Nguyễn Du', 'Đại học Bách Khoa', 'Đại học Sư phạm', 'THPT Lê Quý Đôn']),
      dateOfBirth: getRandomDate(new Date('1985-01-01'), new Date('2006-12-31')),
      gender: Math.random() < 0.5 ? 'male' : 'female',

      // ===== ADMIN FIELDS =====
      adminNotes: getRandomElement(vietnameseAdminNotes),
      maxConcurrentIPs: getRandomNumber(2, 5),

      // ===== NESTED OBJECTS =====
      profile: {
        bio: getRandomElement(vietnameseBios),
        phoneNumber: `+8490${getRandomNumber(1000000, 9999999)}`,
        completionRate: getRandomNumber(0, 100),
        preferences: {
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
          profileVisibility: Math.random() < 0.7 ? ProfileVisibility.PUBLIC : ProfileVisibility.PRIVATE,
          notifications: {
            email: Math.random() < 0.8,
            push: Math.random() < 0.6,
            sms: Math.random() < 0.3
          }
        }
      },
      stats: {
        totalExamResults: role === MockdataUserRole.STUDENT ? getRandomNumber(0, 50) : 0,
        totalCourses: getRandomNumber(0, 20),
        totalLessons: getRandomNumber(0, 200),
        averageScore: role === MockdataUserRole.STUDENT ? getRandomNumber(0, 10) : 0
      }
    };

    users.push(user);
  }
  
  return users;
}

// Generate large dataset: 250 users total
export function generateLargeUserDataset(): AdminUser[] {
  const users: AdminUser[] = [];
  
  // 50 users per role
  users.push(...generateUsersByRole(MockdataUserRole.ADMIN, 50, 1));
  users.push(...generateUsersByRole(MockdataUserRole.TEACHER, 50, 51));
  users.push(...generateUsersByRole(MockdataUserRole.TUTOR, 50, 101));
  users.push(...generateUsersByRole(MockdataUserRole.STUDENT, 50, 151));
  users.push(...generateUsersByRole(MockdataUserRole.GUEST, 50, 201));
  
  return users;
}
