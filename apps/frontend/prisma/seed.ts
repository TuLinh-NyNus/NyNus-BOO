/**
 * NyNus Exam Bank System - Database Seed Script
 * 
 * This script populates the database with comprehensive test data including:
 * - Users with different roles (ADMIN, TEACHER, STUDENT, TUTOR, GUEST)
 * - Authentication tokens (refresh, email verification, password reset)
 * - User sessions and preferences
 * - Sample questions and exams
 * - Exam attempts and answers
 * 
 * Usage: pnpm prisma:seed
 */

import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import { seedQuestionsAndExams } from './seed-questions-exams';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Helper function to add days to date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.exam_answers.deleteMany();
  await prisma.exam_attempts.deleteMany();
  await prisma.exam_questions.deleteMany();
  await prisma.exams.deleteMany();
  await prisma.question.deleteMany();
  await prisma.question_code.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.exam_feedback.deleteMany();
  await prisma.user_sessions.deleteMany();
  await prisma.password_reset_tokens.deleteMany();
  await prisma.email_verification_tokens.deleteMany();
  await prisma.refresh_tokens.deleteMany();
  await prisma.users.deleteMany();
  console.log('✅ Cleared existing data\n');

  // ========================================
  // 1. CREATE USERS
  // ========================================
  console.log('👥 Creating users...');
  
  const defaultPassword = await hashPassword('password123');
  
  // Admin users
  const admin1 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'admin@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Nguyễn',
      last_name: 'Quản Trị',
      username: 'admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      email_verified: true,
      bio: 'Quản trị viên hệ thống NyNus',
      phone: '0901234567',
      school: 'Trường THPT Chuyên Lê Hồng Phong',
      last_login_at: new Date(),
      last_login_ip: '192.168.1.1',
    },
  });

  const admin2 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'admin2@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Trần',
      last_name: 'Văn Admin',
      username: 'admin2',
      role: 'ADMIN',
      status: 'ACTIVE',
      email_verified: true,
      phone: '0901234568',
    },
  });

  // Teacher users
  const teacher1 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'teacher1@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Lê',
      last_name: 'Thị Hoa',
      username: 'teacher_hoa',
      role: 'TEACHER',
      level: 5, // Teacher level 5 (experienced)
      status: 'ACTIVE',
      email_verified: true,
      bio: 'Giáo viên Toán - 15 năm kinh nghiệm',
      phone: '0902345678',
      school: 'Trường THPT Nguyễn Huệ',
      date_of_birth: new Date('1985-05-15'),
      gender: 'Nữ',
      last_login_at: new Date(),
    },
  });

  const teacher2 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'teacher2@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Phạm',
      last_name: 'Văn Minh',
      username: 'teacher_minh',
      role: 'TEACHER',
      level: 4, // Teacher level 4
      status: 'ACTIVE',
      email_verified: true,
      bio: 'Giáo viên Vật Lý',
      phone: '0902345679',
      school: 'Trường THPT Lê Quý Đôn',
      date_of_birth: new Date('1988-08-20'),
      gender: 'Nam',
    },
  });

  const teacher3 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'teacher3@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Hoàng',
      last_name: 'Thị Lan',
      username: 'teacher_lan',
      role: 'TEACHER',
      level: 3, // Teacher level 3
      status: 'INACTIVE',
      email_verified: false,
      bio: 'Giáo viên Hóa Học',
      phone: '0902345680',
    },
  });

  // Student users
  const student1 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'student1@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Nguyễn',
      last_name: 'Văn An',
      username: 'student_an',
      role: 'STUDENT',
      status: 'ACTIVE',
      email_verified: true,
      level: 9, // Student level 9 (Grade 12)
      bio: 'Học sinh lớp 12A1',
      phone: '0903456789',
      school: 'Trường THPT Trần Phú',
      date_of_birth: new Date('2007-03-10'),
      gender: 'Nam',
      last_login_at: new Date(),
    },
  });

  const student2 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'student2@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Trần',
      last_name: 'Thị Bình',
      username: 'student_binh',
      role: 'STUDENT',
      status: 'ACTIVE',
      email_verified: true,
      level: 9, // Student level 9 (Grade 12)
      bio: 'Học sinh lớp 12A2',
      phone: '0903456790',
      school: 'Trường THPT Trần Phú',
      date_of_birth: new Date('2007-07-25'),
      gender: 'Nữ',
      last_login_at: addDays(new Date(), -1),
    },
  });

  const student3 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'student3@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Lê',
      last_name: 'Văn Cường',
      username: 'student_cuong',
      role: 'STUDENT',
      status: 'ACTIVE',
      email_verified: false,
      level: 8, // Student level 8 (Grade 11)
      bio: 'Học sinh lớp 11A1',
      phone: '0903456791',
      school: 'Trường THPT Lê Lợi',
      date_of_birth: new Date('2008-11-05'),
      gender: 'Nam',
    },
  });

  const student4 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'student4@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Phạm',
      last_name: 'Thị Dung',
      username: 'student_dung',
      role: 'STUDENT',
      status: 'SUSPENDED',
      email_verified: true,
      level: 7, // Student level 7 (Grade 10)
      bio: 'Học sinh lớp 10A3',
      school: 'Trường THPT Nguyễn Trãi',
      date_of_birth: new Date('2009-02-14'),
      gender: 'Nữ',
    },
  });

  // Tutor users
  const tutor1 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'tutor1@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Võ',
      last_name: 'Văn Hùng',
      username: 'tutor_hung',
      role: 'TUTOR',
      level: 2, // Tutor level 2
      status: 'ACTIVE',
      email_verified: true,
      bio: 'Gia sư Toán - Lý',
      phone: '0904567890',
      date_of_birth: new Date('1995-06-18'),
      gender: 'Nam',
    },
  });

  const tutor2 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'tutor2@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Đặng',
      last_name: 'Thị Mai',
      username: 'tutor_mai',
      role: 'TUTOR',
      level: 1, // Tutor level 1
      status: 'ACTIVE',
      email_verified: true,
      bio: 'Gia sư Hóa - Sinh',
      phone: '0904567891',
      date_of_birth: new Date('1996-09-22'),
      gender: 'Nữ',
    },
  });

  // Guest users
  const guest1 = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'guest1@nynus.com',
      password_hash: defaultPassword,
      first_name: 'Khách',
      last_name: 'Vãng Lai 1',
      role: 'GUEST',
      status: 'ACTIVE',
      email_verified: false,
    },
  });

  console.log(`✅ Created ${await prisma.users.count()} users\n`);

  const allUsers = [admin1, admin2, teacher1, teacher2, teacher3, student1, student2, student3, student4, tutor1, tutor2, guest1];

  console.log('📊 Users summary:');
  console.log(`   - ADMIN: 2`);
  console.log(`   - TEACHER: 3`);
  console.log(`   - STUDENT: 4`);
  console.log(`   - TUTOR: 2`);
  console.log(`   - GUEST: 1\n`);

  // ========================================
  // 2. CREATE AUTHENTICATION TOKENS
  // ========================================
  // Skipped: Prisma schema doesn't match database schema for auth tokens
  console.log('⏭️  Skipping authentication tokens (schema mismatch)\n');

  /*
  // Refresh tokens for active users
  await prisma.refresh_tokens.create({
    data: {
      id: generateId(),
      user_id: admin1.id,
      token: `refresh_token_${generateId()}`,
      expiresAt: addDays(new Date(), 7),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  await prisma.refresh_tokens.create({
    data: {
      id: generateId(),
      user_id: student1.id,
      token: `refresh_token_${generateId()}`,
      expiresAt: addDays(new Date(), 7),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    },
  });

  // Email verification tokens for unverified users
  await prisma.email_verification_tokens.create({
    data: {
      id: generateId(),
      user_id: teacher3.id,
      token: `verify_${generateId()}`,
      expiresAt: addDays(new Date(), 1),
    },
  });

  await prisma.email_verification_tokens.create({
    data: {
      id: generateId(),
      user_id: student3.id,
      token: `verify_${generateId()}`,
      expiresAt: addDays(new Date(), 1),
    },
  });

  // Password reset tokens
  await prisma.password_reset_tokens.create({
    data: {
      id: generateId(),
      user_id: student2.id,
      token: `reset_${generateId()}`,
      expiresAt: addDays(new Date(), 0.5), // 12 hours
    },
  });

  // User sessions for logged-in users
  await prisma.user_sessions.create({
    data: {
      id: generateId(),
      user_id: admin1.id,
      token: `session_${generateId()}`,
      expiresAt: addDays(new Date(), 1),
      lastActivityAt: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  await prisma.user_sessions.create({
    data: {
      id: generateId(),
      user_id: student1.id,
      token: `session_${generateId()}`,
      expiresAt: addDays(new Date(), 1),
      lastActivityAt: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    },
  });

  console.log(`✅ Created authentication tokens\n`);
  */

  // ========================================
  // 3. CREATE NOTIFICATIONS
  // ========================================
  // Skipped: Notification type enum mismatch
  console.log('⏭️  Skipping notifications (schema mismatch)\n');

  /*
  await prisma.notifications.createMany({
    data: [
      {
        id: generateId(),
        user_id: student1.id,
        title: 'Chào mừng đến với NyNus!',
        message: 'Chúc bạn học tập hiệu quả với hệ thống ngân hàng đề thi NyNus.',
        type: 'WELCOME',
        isRead: true,
        readAt: new Date(),
      },
      {
        id: generateId(),
        user_id: student1.id,
        title: 'Đề thi mới',
        message: 'Đề thi Toán 12 - Học kỳ 1 đã được thêm vào hệ thống.',
        type: 'NEW_EXAM',
        isRead: false,
      },
      {
        id: generateId(),
        user_id: student2.id,
        title: 'Kết quả thi',
        message: 'Bạn đã hoàn thành đề thi Toán 12 với điểm số 85/100.',
        type: 'EXAM_RESULT',
        isRead: false,
      },
      {
        id: generateId(),
        user_id: teacher1.id,
        title: 'Đề thi được duyệt',
        message: 'Đề thi "Toán 12 - Chương 1" của bạn đã được duyệt.',
        type: 'EXAM_APPROVED',
        isRead: true,
        readAt: addDays(new Date(), -1),
      },
    ],
  });

  console.log(`✅ Created ${await prisma.notifications.count()} notifications\n`);
  */

  // ========================================
  // 4. CREATE QUESTIONS AND EXAMS
  // ========================================
  await seedQuestionsAndExams();

  // ========================================
  // 5. CREATE EXAM ATTEMPTS (for students)
  // ========================================
  console.log('📝 Creating exam attempts...');

  const students = await prisma.users.findMany({
    where: { role: 'STUDENT', status: 'ACTIVE' },
  });

  const exams = await prisma.exams.findMany({
    where: { status: 'ACTIVE' },
    include: {
      exam_questions: {
        include: {
          question: true,
        },
      },
    },
  });

  if (students.length > 0 && exams.length > 0) {
    // Student 1 completes first exam
    const attempt1 = await prisma.exam_attempts.create({
      data: {
        id: generateId(),
        exam_id: exams[0].id,
        user_id: students[0].id,
        attempt_number: 1,
        started_at: addDays(new Date(), -1),
        submitted_at: addDays(new Date(), -1),
        score: 85,
        percentage: 85,
        passed: true,
        time_spent_seconds: 5400, // 90 minutes in seconds
        status: 'submitted',
      },
    });

    // Create answers for attempt 1
    const exam1Questions = exams[0].exam_questions;
    for (let i = 0; i < exam1Questions.length; i++) {
      const eq = exam1Questions[i];
      const isCorrect = i < 4; // First 4 correct, last one wrong
      await prisma.exam_answers.create({
        data: {
          id: generateId(),
          attempt_id: attempt1.id,
          question_id: eq.question_id,
          answer_data: eq.question.correct_answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? eq.points : 0,
          time_spent_seconds: 1000 + i * 200,
          answered_at: addDays(new Date(), -1),
        },
      });
    }

    // Student 2 has in-progress attempt
    if (students.length > 1) {
      await prisma.exam_attempts.create({
        data: {
          id: generateId(),
          exam_id: exams[0].id,
          user_id: students[1].id,
          attempt_number: 1,
          started_at: new Date(),
          status: 'in_progress',
        },
      });
    }

    console.log(`✅ Created ${await prisma.exam_attempts.count()} exam attempts\n`);
  }

  // ========================================
  // 6. CREATE EXAM FEEDBACK
  // ========================================
  console.log('💬 Creating exam feedback...');

  if (students.length > 0 && exams.length > 0) {
    await prisma.exam_feedback.create({
      data: {
        id: generateId(),
        exam_id: exams[0].id,
        user_id: students[0].id,
        rating: 5,
        difficulty_rating: 4,
        content: 'Đề thi rất hay, câu hỏi phù hợp với chương trình học.',
      },
    });

    console.log(`✅ Created ${await prisma.exam_feedback.count()} feedback entries\n`);
  }

  console.log('✅ Seed completed successfully!\n');
  console.log('📊 Final summary:');
  console.log(`   - Users: ${await prisma.users.count()}`);
  console.log(`   - Refresh Tokens: ${await prisma.refresh_tokens.count()}`);
  console.log(`   - Email Verification Tokens: ${await prisma.email_verification_tokens.count()}`);
  console.log(`   - Password Reset Tokens: ${await prisma.password_reset_tokens.count()}`);
  console.log(`   - User Sessions: ${await prisma.user_sessions.count()}`);
  console.log(`   - Notifications: ${await prisma.notifications.count()}`);
  console.log(`   - Questions: ${await prisma.question.count()}`);
  console.log(`   - Exams: ${await prisma.exams.count()}`);
  console.log(`   - Exam Questions: ${await prisma.exam_questions.count()}`);
  console.log(`   - Exam Attempts: ${await prisma.exam_attempts.count()}`);
  console.log(`   - Exam Answers: ${await prisma.exam_answers.count()}`);
  console.log(`   - Exam Feedback: ${await prisma.exam_feedback.count()}\n`);

  console.log('🎉 Database seeded with comprehensive test data!');
  console.log('\n📝 Test credentials:');
  console.log('   Admin: admin@nynus.com / password123');
  console.log('   Teacher: teacher1@nynus.com / password123');
  console.log('   Student: student1@nynus.com / password123');
  console.log('   Tutor: tutor1@nynus.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

