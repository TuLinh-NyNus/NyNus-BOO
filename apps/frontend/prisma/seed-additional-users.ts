/**
 * NyNus Exam Bank System - Additional Users Seed Script
 * 
 * Tạo thêm users theo yêu cầu:
 * - 3 tài khoản ADMIN tên "Nguyễn Công Tú"
 * - 4 tài khoản TEACHER: 
 *   + Nguyễn Công Tú
 *   + Phan Vũ Hoài Linh
 *   + Nguyễn Công Tú (duplicate)
 *   + Nguyễn Minh Hy
 * - 100 tài khoản STUDENT với tên ngẫu nhiên
 * 
 * Usage: 
 *   cd apps/frontend
 *   npx tsx prisma/seed-additional-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Vietnamese first names (họ)
const firstNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi',
  'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Huỳnh', 'Mai', 'Tô', 'Lâm'
];

// Vietnamese middle + last names (tên đệm + tên)
const lastNames = [
  'Văn An', 'Thị Bình', 'Văn Cường', 'Thị Dung', 'Văn Em', 'Thị Phương',
  'Văn Giang', 'Thị Hà', 'Văn Hùng', 'Thị Lan', 'Văn Khoa', 'Thị Linh',
  'Văn Minh', 'Thị Nga', 'Văn Phong', 'Thị Quỳnh', 'Văn Sơn', 'Thị Trang',
  'Văn Tuấn', 'Thị Uyên', 'Văn Việt', 'Thị Xuân', 'Văn Yên', 'Thị Ánh',
  'Công Danh', 'Minh Đức', 'Hoàng Anh', 'Thanh Bình', 'Quốc Cường', 'Đức Duy',
  'Hữu Đạt', 'Minh Hiếu', 'Quang Huy', 'Tuấn Kiệt', 'Đình Long', 'Văn Nam',
  'Hoàng Phúc', 'Quang Trung', 'Anh Tuấn', 'Đức Việt', 'Minh Khôi', 'Hoàng Long',
  'Thị Mai', 'Thị Hương', 'Thị Nhung', 'Thị Oanh', 'Thị Phượng', 'Thị Thảo',
  'Thị Thu', 'Thị Vân', 'Thị Yến', 'Thị Hồng', 'Thị Kim', 'Thị Ngọc'
];

// Schools in Vietnam
const schools = [
  'Trường THPT Chuyên Lê Hồng Phong',
  'Trường THPT Nguyễn Huệ',
  'Trường THPT Lê Quý Đôn',
  'Trường THPT Trần Phú',
  'Trường THPT Lê Lợi',
  'Trường THPT Nguyễn Trãi',
  'Trường THPT Chu Văn An',
  'Trường THPT Trần Đại Nghĩa',
  'Trường THPT Gia Định',
  'Trường THPT Bùi Thị Xuân'
];

// Generate random Vietnamese name
function generateRandomName(): { firstName: string; lastName: string } {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName };
}

// Generate random school
function getRandomSchool(): string {
  return schools[Math.floor(Math.random() * schools.length)];
}

// Generate random date of birth (students: 2006-2009, teachers: 1980-1995)
function generateDateOfBirth(role: 'STUDENT' | 'TEACHER'): Date {
  if (role === 'STUDENT') {
    const year = 2006 + Math.floor(Math.random() * 4); // 2006-2009
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  } else {
    const year = 1980 + Math.floor(Math.random() * 16); // 1980-1995
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }
}

async function main() {
  console.log('🌱 Starting additional users seed...\n');

  const defaultPassword = await hashPassword('password123');
  let createdCount = 0;

  // ========================================
  // 1. CREATE 3 ADMIN USERS - Nguyễn Công Tú
  // ========================================
  console.log('👑 Creating 3 ADMIN users (Nguyễn Công Tú)...');
  
  for (let i = 1; i <= 3; i++) {
    try {
      await prisma.users.create({
        data: {
          id: generateId(),
          email: `admin.nguyentu${i}@nynus.com`,
          password_hash: defaultPassword,
          first_name: 'Nguyễn',
          last_name: 'Công Tú',
          username: `admin_nguyentu_${i}`,
          role: 'ADMIN',
          status: 'ACTIVE',
          email_verified: true,
          bio: `Quản trị viên ${i} - Nguyễn Công Tú`,
          phone: `090${1000000 + i}`,
          school: getRandomSchool(),
          last_login_at: new Date(),
        },
      });
      createdCount++;
      console.log(`  ✅ Created ADMIN ${i}: admin.nguyentu${i}@nynus.com`);
    } catch (error) {
      console.error(`  ❌ Failed to create ADMIN ${i}:`, error);
    }
  }

  // ========================================
  // 2. CREATE 4 TEACHER USERS
  // ========================================
  console.log('\n👨‍🏫 Creating 4 TEACHER users...');
  
  const teachers = [
    { firstName: 'Nguyễn', lastName: 'Công Tú', email: 'teacher.nguyentu1@nynus.com', username: 'teacher_nguyentu_1' },
    { firstName: 'Phan', lastName: 'Vũ Hoài Linh', email: 'teacher.phanlinh@nynus.com', username: 'teacher_phanlinh' },
    { firstName: 'Nguyễn', lastName: 'Công Tú', email: 'teacher.nguyentu2@nynus.com', username: 'teacher_nguyentu_2' },
    { firstName: 'Nguyễn', lastName: 'Minh Hy', email: 'teacher.nguyenhy@nynus.com', username: 'teacher_nguyenhy' },
  ];

  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    try {
      await prisma.users.create({
        data: {
          id: generateId(),
          email: teacher.email,
          password_hash: defaultPassword,
          first_name: teacher.firstName,
          last_name: teacher.lastName,
          username: teacher.username,
          role: 'TEACHER',
          level: 3 + Math.floor(Math.random() * 3), // Level 3-5
          status: 'ACTIVE',
          email_verified: true,
          bio: `Giáo viên ${teacher.firstName} ${teacher.lastName}`,
          phone: `091${2000000 + i}`,
          school: getRandomSchool(),
          date_of_birth: generateDateOfBirth('TEACHER'),
          gender: i % 2 === 0 ? 'Nam' : 'Nữ',
          last_login_at: new Date(),
        },
      });
      createdCount++;
      console.log(`  ✅ Created TEACHER ${i + 1}: ${teacher.email} (${teacher.firstName} ${teacher.lastName})`);
    } catch (error) {
      console.error(`  ❌ Failed to create TEACHER ${i + 1}:`, error);
    }
  }

  // ========================================
  // 3. CREATE 100 STUDENT USERS
  // ========================================
  console.log('\n👨‍🎓 Creating 100 STUDENT users with random names...');
  
  for (let i = 1; i <= 100; i++) {
    const { firstName, lastName } = generateRandomName();
    const email = `student${i}@nynus.com`;
    const username = `student_${i}`;
    
    try {
      await prisma.users.create({
        data: {
          id: generateId(),
          email,
          password_hash: defaultPassword,
          first_name: firstName,
          last_name: lastName,
          username,
          role: 'STUDENT',
          level: 7 + Math.floor(Math.random() * 3), // Level 7-9 (Grade 10-12)
          status: 'ACTIVE',
          email_verified: i % 5 !== 0, // 80% verified
          bio: `Học sinh ${firstName} ${lastName}`,
          phone: i % 3 === 0 ? `092${3000000 + i}` : undefined,
          school: getRandomSchool(),
          date_of_birth: generateDateOfBirth('STUDENT'),
          gender: i % 2 === 0 ? 'Nam' : 'Nữ',
          last_login_at: i % 10 === 0 ? undefined : new Date(),
        },
      });
      createdCount++;
      
      // Progress indicator every 10 students
      if (i % 10 === 0) {
        console.log(`  ✅ Created ${i}/100 students...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to create STUDENT ${i}:`, error);
    }
  }

  console.log('\n✅ Seed completed!\n');
  console.log('📊 Summary:');
  console.log(`   - Total users created: ${createdCount}`);
  console.log(`   - ADMIN: 3 (Nguyễn Công Tú)`);
  console.log(`   - TEACHER: 4 (Nguyễn Công Tú x2, Phan Vũ Hoài Linh, Nguyễn Minh Hy)`);
  console.log(`   - STUDENT: 100 (random names)`);
  console.log('\n🔑 Default password for all users: password123\n');
  
  // Display total users in database
  const totalUsers = await prisma.users.count();
  console.log(`📈 Total users in database: ${totalUsers}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

