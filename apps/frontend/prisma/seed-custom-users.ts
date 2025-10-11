/**
 * NyNus Exam Bank System - Custom User Seed Script
 * 
 * Creates:
 * - 3 Admin accounts (Nguyễn Công Tú)
 * - 4 Teacher accounts (Nguyễn Công Tú, Phan Vũ Hoài Linh, Nguyễn Công Tú, Nguyễn Minh Hy)
 * - 100 Student accounts (random Vietnamese names)
 * 
 * Password for all accounts: Abd8stbcs!
 * 
 * Usage: pnpm tsx apps/frontend/prisma/seed-custom-users.ts
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

// Vietnamese first names (common names)
const vietnameseFirstNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ',
  'Hồ', 'Ngô', 'Dương', 'Lý', 'Võ', 'Đinh', 'Mai', 'Tô', 'Trịnh', 'Lâm'
];

// Vietnamese middle + last names (common combinations)
const vietnameseLastNames = [
  'Văn Anh', 'Thị Bình', 'Công Cường', 'Minh Đức', 'Hoàng Dũng',
  'Thị Hà', 'Văn Hải', 'Minh Hiếu', 'Thị Hoa', 'Văn Hùng',
  'Thị Lan', 'Văn Long', 'Minh Nhật', 'Thị Phương', 'Văn Quân',
  'Thị Thảo', 'Văn Thắng', 'Minh Tuấn', 'Thị Trang', 'Văn Việt',
  'Công Tú', 'Vũ Hoài Linh', 'Minh Hy', 'Thị Mai', 'Văn Nam',
  'Thị Nga', 'Minh Phúc', 'Thị Quỳnh', 'Văn Sơn', 'Thị Tâm',
  'Minh Thành', 'Thị Thu', 'Văn Toàn', 'Thị Tuyết', 'Minh Vũ',
  'Thị Xuân', 'Văn Yên', 'Minh Châu', 'Thị Diệu', 'Văn Đạt',
  'Thị Giang', 'Minh Hằng', 'Thị Hương', 'Văn Khoa', 'Thị Linh',
  'Minh Ngọc', 'Thị Oanh', 'Văn Phong', 'Thị Quyên', 'Minh Sang'
];

// Generate random Vietnamese name
function generateVietnameseName(): { firstName: string; lastName: string } {
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  return { firstName, lastName };
}

// Generate username from name
function generateUsername(firstName: string, lastName: string, index: number): string {
  const cleanFirstName = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLastName = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  return `${cleanFirstName}.${cleanLastName}${index}`;
}

async function main() {
  console.log('🌱 Starting custom user seed...\n');

  const customPassword = 'Abd8stbcs!';
  const hashedPassword = await hashPassword(customPassword);

  // ========================================
  // 1. CREATE 3 ADMIN ACCOUNTS
  // ========================================
  console.log('👑 Creating 3 Admin accounts (Nguyễn Công Tú)...');
  
  const admins = [];
  for (let i = 1; i <= 3; i++) {
    const admin = await prisma.users.create({
      data: {
        id: generateId(),
        email: `admin${i}@nynus.com`,
        password_hash: hashedPassword,
        first_name: 'Nguyễn',
        last_name: 'Công Tú',
        username: `admin.congtu${i}`,
        role: 'ADMIN',
        status: 'ACTIVE',
        email_verified: true,
        bio: `Quản trị viên hệ thống NyNus - ${i}`,
        phone: `090123456${i}`,
        school: 'Trường THPT Chuyên Lê Hồng Phong',
        last_login_at: new Date(),
        last_login_ip: '192.168.1.1',
      },
    });
    admins.push(admin);
    console.log(`  ✅ Created Admin ${i}: ${admin.email} (${admin.first_name} ${admin.last_name})`);
  }

  // ========================================
  // 2. CREATE 4 TEACHER ACCOUNTS
  // ========================================
  console.log('\n👨‍🏫 Creating 4 Teacher accounts...');
  
  const teacherNames = [
    { firstName: 'Nguyễn', lastName: 'Công Tú', email: 'teacher1@nynus.com', username: 'teacher.congtu1' },
    { firstName: 'Phan', lastName: 'Vũ Hoài Linh', email: 'teacher2@nynus.com', username: 'teacher.hoailinh' },
    { firstName: 'Nguyễn', lastName: 'Công Tú', email: 'teacher3@nynus.com', username: 'teacher.congtu2' },
    { firstName: 'Nguyễn', lastName: 'Minh Hy', email: 'teacher4@nynus.com', username: 'teacher.minhhy' },
  ];

  const teachers = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const { firstName, lastName, email, username } = teacherNames[i];
    const teacher = await prisma.users.create({
      data: {
        id: generateId(),
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        username,
        role: 'TEACHER',
        level: 5, // Teacher level 5
        status: 'ACTIVE',
        email_verified: true,
        bio: `Giáo viên môn Toán - ${firstName} ${lastName}`,
        phone: `091234567${i}`,
        school: 'Trường THPT Chuyên Lê Hồng Phong',
        last_login_at: new Date(),
        last_login_ip: '192.168.1.2',
      },
    });
    teachers.push(teacher);
    console.log(`  ✅ Created Teacher ${i + 1}: ${teacher.email} (${teacher.first_name} ${teacher.last_name})`);
  }

  // ========================================
  // 3. CREATE 100 STUDENT ACCOUNTS
  // ========================================
  console.log('\n👨‍🎓 Creating 100 Student accounts (random Vietnamese names)...');
  
  const students = [];
  for (let i = 1; i <= 100; i++) {
    const { firstName, lastName } = generateVietnameseName();
    const username = generateUsername(firstName, lastName, i);
    const email = `student${i}@nynus.com`;
    
    const student = await prisma.users.create({
      data: {
        id: generateId(),
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        username,
        role: 'STUDENT',
        level: Math.floor(Math.random() * 3) + 10, // Level 10, 11, or 12
        status: 'ACTIVE',
        email_verified: true,
        bio: `Học sinh lớp ${10 + Math.floor(Math.random() * 3)}`,
        phone: `092${String(i).padStart(7, '0')}`,
        school: 'Trường THPT Chuyên Lê Hồng Phong',
        last_login_at: new Date(),
        last_login_ip: '192.168.1.3',
      },
    });
    students.push(student);
    
    if (i % 10 === 0) {
      console.log(`  ✅ Created ${i}/100 students...`);
    }
  }
  console.log(`  ✅ Created all 100 students!`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n📊 Seed Summary:');
  console.log('=====================================');
  console.log(`✅ Total Admins:   ${admins.length}`);
  console.log(`✅ Total Teachers: ${teachers.length}`);
  console.log(`✅ Total Students: ${students.length}`);
  console.log(`✅ Total Users:    ${admins.length + teachers.length + students.length}`);
  console.log('=====================================');
  console.log('\n🔑 Login Credentials:');
  console.log('=====================================');
  console.log('Password for ALL accounts: Abd8stbcs!');
  console.log('');
  console.log('Admin Accounts:');
  admins.forEach((admin, i) => {
    console.log(`  ${i + 1}. ${admin.email} (${admin.first_name} ${admin.last_name})`);
  });
  console.log('');
  console.log('Teacher Accounts:');
  teachers.forEach((teacher, i) => {
    console.log(`  ${i + 1}. ${teacher.email} (${teacher.first_name} ${teacher.last_name})`);
  });
  console.log('');
  console.log('Student Accounts:');
  console.log(`  student1@nynus.com to student100@nynus.com`);
  console.log(`  (Random Vietnamese names)`);
  console.log('=====================================');
  console.log('\n✅ Custom user seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

