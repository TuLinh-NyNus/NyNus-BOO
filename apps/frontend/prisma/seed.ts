/**
 * NyNus Exam Bank System - Database Seed Script (CHUẨN ARCHITECTURE)
 * 
 * Seed data theo đúng chuẩn từ:
 * - docs/arch/IMPLEMENT_QUESTION.md
 * - docs/arch/ExamSystem.md
 * 
 * Bao gồm:
 * - 3 Admin users (Nguyễn Công Tú)
 * - 4 Teacher users (Nguyễn Công Tú, Phan Vũ Hoài Linh, Nguyễn Công Thành, Nguyễn Minh Hy)
 * - 100 Student users (tên tiếng Việt đa dạng)
 * - Question codes (ID5 và ID6 format)
 * - Questions (MC, TF, SA, ES types với JSONB answers/correct_answer chuẩn)
 * - Exams (generated type với exam_questions junction table)
 * 
 * Password cho tất cả users: Abd8stbcs!
 * 
 * Usage: pnpm prisma:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper function to generate CUID (compatible với backend Go)
function generateId(): string {
  return crypto.randomUUID();
}

// Danh sách tên tiếng Việt cho students
const VIETNAMESE_FIRST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Trương', 'Phùng', 'Tạ'
];

const VIETNAMESE_LAST_NAMES = [
  'Văn An', 'Thị Bình', 'Công Cường', 'Minh Đức', 'Thị Hoa', 'Văn Hùng', 'Thị Lan',
  'Minh Khoa', 'Thị Mai', 'Văn Nam', 'Thị Nga', 'Công Phúc', 'Thị Quỳnh', 'Văn Sơn',
  'Thị Tâm', 'Minh Tuấn', 'Thị Uyên', 'Văn Việt', 'Thị Xuân', 'Công Yên',
  'Hoài Linh', 'Minh Hy', 'Công Thành', 'Công Tú', 'Vũ Anh', 'Thị Diệu',
  'Văn Đạt', 'Thị Giang', 'Minh Hiếu', 'Thị Kim', 'Văn Long', 'Thị Ngọc',
  'Công Phương', 'Thị Thanh', 'Văn Thắng', 'Thị Vân', 'Minh Quang', 'Thị Yến'
];

async function main() {
  console.log('🌱 Starting NyNus database seed (CHUẨN ARCHITECTURE)...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.exam_answers.deleteMany();
  await prisma.exam_attempts.deleteMany();
  await prisma.exam_questions.deleteMany();
  await prisma.exams.deleteMany();
  await prisma.question_image.deleteMany();
  await prisma.question_tag.deleteMany();
  await prisma.question_feedback.deleteMany();
  await prisma.question.deleteMany();
  await prisma.question_code.deleteMany();
  await prisma.users.deleteMany();
  console.log('✅ Cleared existing data\n');

  // ========================================
  // 1. CREATE USERS
  // ========================================
  console.log('👥 Creating users...');
  
  const password = await hashPassword('Abd8stbcs!');
  const users: any[] = [];

  // 3 Admin users - Nguyễn Công Tú
  for (let i = 1; i <= 3; i++) {
    const admin = await prisma.users.create({
      data: {
        id: generateId(),
        email: `admin${i}@nynus.com`,
        password_hash: password,
        first_name: 'Nguyễn',
        last_name: 'Công Tú',
        username: `admin_tu_${i}`,
        role: 'ADMIN',
        status: 'ACTIVE',
        email_verified: true,
        bio: `Admin ${i} - Nguyễn Công Tú`,
        phone: `090123456${i}`,
        school: 'NyNus Exam Bank System',
      },
    });
    users.push(admin);
  }

  // 4 Teacher users
  const teacherNames = [
    { first: 'Nguyễn', last: 'Công Tú', email: 'teacher_tu@nynus.com' },
    { first: 'Phan', last: 'Vũ Hoài Linh', email: 'teacher_linh@nynus.com' },
    { first: 'Nguyễn', last: 'Công Thành', email: 'teacher_thanh@nynus.com' },
    { first: 'Nguyễn', last: 'Minh Hy', email: 'teacher_hy@nynus.com' },
  ];

  for (const teacherName of teacherNames) {
    const teacher = await prisma.users.create({
      data: {
        id: generateId(),
        email: teacherName.email,
        password_hash: password,
        first_name: teacherName.first,
        last_name: teacherName.last,
        username: teacherName.email.split('@')[0],
        role: 'TEACHER',
        status: 'ACTIVE',
        email_verified: true,
        bio: `Giáo viên ${teacherName.first} ${teacherName.last}`,
        phone: `091${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        school: 'Trường THPT Chuyên',
      },
    });
    users.push(teacher);
  }

  // 100 Student users với tên tiếng Việt đa dạng
  for (let i = 1; i <= 100; i++) {
    const firstName = VIETNAMESE_FIRST_NAMES[Math.floor(Math.random() * VIETNAMESE_FIRST_NAMES.length)];
    const lastName = VIETNAMESE_LAST_NAMES[Math.floor(Math.random() * VIETNAMESE_LAST_NAMES.length)];
    
    const student = await prisma.users.create({
      data: {
        id: generateId(),
        email: `student${i}@nynus.com`,
        password_hash: password,
        first_name: firstName,
        last_name: lastName,
        username: `student_${i}`,
        role: 'STUDENT',
        status: 'ACTIVE',
        email_verified: true,
        bio: `Học sinh ${firstName} ${lastName}`,
        phone: `092${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        school: 'Trường THPT',
      },
    });
    users.push(student);
  }

  console.log(`✅ Created ${users.length} users (3 Admin, 4 Teacher, 100 Student)\n`);

  // ========================================
  // 2. CREATE QUESTION CODES (ID5 và ID6)
  // ========================================
  console.log('📝 Creating question codes...');
  
  const questionCodes = [
    // ID5 format: [grade][subject][chapter][level][lesson]
    { code: '0P1N1', format: 'ID5', grade: '0', subject: 'P', chapter: '1', lesson: '1', form: null, level: 'N' },
    { code: '0P1H2', format: 'ID5', grade: '0', subject: 'P', chapter: '1', lesson: '2', form: null, level: 'H' },
    { code: '0P1V3', format: 'ID5', grade: '0', subject: 'P', chapter: '1', lesson: '3', form: null, level: 'V' },
    { code: '1L2N1', format: 'ID5', grade: '1', subject: 'L', chapter: '2', lesson: '1', form: null, level: 'N' },
    { code: '1L2H2', format: 'ID5', grade: '1', subject: 'L', chapter: '2', lesson: '2', form: null, level: 'H' },
    
    // ID6 format: [grade][subject][chapter][level][lesson]-[form]
    { code: '0P1V1-1', format: 'ID6', grade: '0', subject: 'P', chapter: '1', lesson: '1', form: '1', level: 'V' },
    { code: '0P1C2-2', format: 'ID6', grade: '0', subject: 'P', chapter: '1', lesson: '2', form: '2', level: 'C' },
    { code: '1H3V1-1', format: 'ID6', grade: '1', subject: 'H', chapter: '3', lesson: '1', form: '1', level: 'V' },
    { code: '2P4C3-1', format: 'ID6', grade: '2', subject: 'P', chapter: '4', lesson: '3', form: '1', level: 'C' },
    { code: '2L5V2-2', format: 'ID6', grade: '2', subject: 'L', chapter: '5', lesson: '2', form: '2', level: 'V' },
  ];

  for (const qc of questionCodes) {
    await prisma.question_code.create({
      data: qc as any,
    });
  }

  console.log(`✅ Created ${questionCodes.length} question codes (5 ID5, 5 ID6)\n`);

  // ========================================
  // 3. CREATE QUESTIONS (MC, TF, SA, ES)
  // ========================================
  console.log('📚 Creating questions...');
  
  const questions: any[] = [];

  // Question 1: Multiple Choice (MC)
  const q1 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: '\\begin{ex}%[Nguồn: "Sách giáo khoa"]%[0P1N1]\n[TL.001] Tập hợp nào sau đây là tập hợp rỗng?\n\\choice\n{$A = \\{x \\in \\mathbb{R} | x^2 = -1\\}$}\n{$B = \\{x \\in \\mathbb{N} | x < 0\\}$}\n{\\True $C = \\{x \\in \\mathbb{R} | x^2 + 1 = 0\\}$}\n{$D = \\{0\\}$}\n\\loigiai{Phương trình $x^2 + 1 = 0$ vô nghiệm trong $\\mathbb{R}$}\n\\end{ex}',
      content: 'Tập hợp nào sau đây là tập hợp rỗng?',
      subcount: 'TL.001',
      type: 'MC',
      source: 'Sách giáo khoa',
      answers: JSON.stringify([
        { id: '1', content: '$A = \\{x \\in \\mathbb{R} | x^2 = -1\\}$' },
        { id: '2', content: '$B = \\{x \\in \\mathbb{N} | x < 0\\}$' },
        { id: '3', content: '$C = \\{x \\in \\mathbb{R} | x^2 + 1 = 0\\}$' },
        { id: '4', content: '$D = \\{0\\}$' }
      ]),
      correct_answer: JSON.stringify({ id: '3', content: '$C = \\{x \\in \\mathbb{R} | x^2 + 1 = 0\\}$' }),
      solution: 'Phương trình $x^2 + 1 = 0$ vô nghiệm trong $\\mathbb{R}$',
      status: 'ACTIVE',
      difficulty: 'EASY',
      grade: '0',
      subject: 'P',
      chapter: '1',
      level: 'N',
      question_code_id: '0P1N1',
      creator: users[0].id, // Admin 1
    },
  });
  questions.push(q1);

  // Question 2: True/False (TF) - 4 statements
  const q2 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: '\\begin{ex}%[0P1H2]\n[TL.002] Xét tính đúng sai của các mệnh đề sau:\n\\choiceTF\n{\\True Tập hợp $\\mathbb{N}$ là tập con của $\\mathbb{Z}$}\n{Tập hợp $\\mathbb{Q}$ là tập con của $\\mathbb{Z}$}\n{\\True Tập hợp $\\mathbb{Z}$ là tập con của $\\mathbb{Q}$}\n{Tập hợp $\\mathbb{R}$ là tập con của $\\mathbb{Q}$}\n\\loigiai{$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$}\n\\end{ex}',
      content: 'Xét tính đúng sai của các mệnh đề sau:',
      subcount: 'TL.002',
      type: 'TF',
      source: null,
      answers: JSON.stringify([
        { id: '1', content: 'Tập hợp $\\mathbb{N}$ là tập con của $\\mathbb{Z}$' },
        { id: '2', content: 'Tập hợp $\\mathbb{Q}$ là tập con của $\\mathbb{Z}$' },
        { id: '3', content: 'Tập hợp $\\mathbb{Z}$ là tập con của $\\mathbb{Q}$' },
        { id: '4', content: 'Tập hợp $\\mathbb{R}$ là tập con của $\\mathbb{Q}$' }
      ]),
      correct_answer: JSON.stringify([
        { id: '1', content: 'Tập hợp $\\mathbb{N}$ là tập con của $\\mathbb{Z}$' },
        { id: '3', content: 'Tập hợp $\\mathbb{Z}$ là tập con của $\\mathbb{Q}$' }
      ]),
      solution: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      grade: '0',
      subject: 'P',
      chapter: '1',
      level: 'H',
      question_code_id: '0P1H2',
      creator: users[3].id, // Teacher 1
    },
  });
  questions.push(q2);

  // Question 3: Short Answer (SA)
  const q3 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: '\\begin{ex}%[0P1V3]\n[TL.003] Cho tập hợp $A = \\{1, 2, 3, 4, 5\\}$. Số phần tử của tập hợp $A$ là bao nhiêu?\n\\shortans{5}\n\\loigiai{Đếm số phần tử: $|A| = 5$}\n\\end{ex}',
      content: 'Cho tập hợp $A = \\{1, 2, 3, 4, 5\\}$. Số phần tử của tập hợp $A$ là bao nhiêu?',
      subcount: 'TL.003',
      type: 'SA',
      source: null,
      answers: null, // SA không có answers array
      correct_answer: JSON.stringify('5'),
      solution: 'Đếm số phần tử: $|A| = 5$',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      grade: '0',
      subject: 'P',
      chapter: '1',
      level: 'V',
      question_code_id: '0P1V3',
      creator: users[4].id, // Teacher 2
    },
  });
  questions.push(q3);

  // Question 4: Essay (ES)
  const q4 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: '\\begin{ex}%[1L2N1]\n[TL.004] Trình bày định luật Newton thứ nhất và cho ví dụ minh họa.\n\\loigiai{Định luật Newton I: Một vật đứng yên hoặc chuyển động thẳng đều sẽ tiếp tục trạng thái đó nếu không chịu tác dụng của lực hoặc các lực tác dụng cân bằng nhau.}\n\\end{ex}',
      content: 'Trình bày định luật Newton thứ nhất và cho ví dụ minh họa.',
      subcount: 'TL.004',
      type: 'ES',
      source: null,
      answers: null, // ES không có answers
      correct_answer: null, // ES không có correct_answer cố định
      solution: 'Định luật Newton I: Một vật đứng yên hoặc chuyển động thẳng đều sẽ tiếp tục trạng thái đó nếu không chịu tác dụng của lực hoặc các lực tác dụng cân bằng nhau.',
      status: 'ACTIVE',
      difficulty: 'EASY',
      grade: '1',
      subject: 'L',
      chapter: '2',
      level: 'N',
      question_code_id: '1L2N1',
      creator: users[5].id, // Teacher 3
    },
  });
  questions.push(q4);

  // Question 5: MC với ID6 format
  const q5 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: '\\begin{ex}%[0P1V1-1]\n[TL.005] Cho hai tập hợp $A = \\{1, 2, 3\\}$ và $B = \\{2, 3, 4\\}$. Tập hợp $A \\cap B$ là:\n\\choice\n{$\\{1\\}$}\n{\\True $\\{2, 3\\}$}\n{$\\{1, 2, 3, 4\\}$}\n{$\\emptyset$}\n\\loigiai{Giao của hai tập hợp là các phần tử chung: $A \\cap B = \\{2, 3\\}$}\n\\end{ex}',
      content: 'Cho hai tập hợp $A = \\{1, 2, 3\\}$ và $B = \\{2, 3, 4\\}$. Tập hợp $A \\cap B$ là:',
      subcount: 'TL.005',
      type: 'MC',
      source: null,
      answers: JSON.stringify([
        { id: '1', content: '$\\{1\\}$' },
        { id: '2', content: '$\\{2, 3\\}$' },
        { id: '3', content: '$\\{1, 2, 3, 4\\}$' },
        { id: '4', content: '$\\emptyset$' }
      ]),
      correct_answer: JSON.stringify({ id: '2', content: '$\\{2, 3\\}$' }),
      solution: 'Giao của hai tập hợp là các phần tử chung: $A \\cap B = \\{2, 3\\}$',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      grade: '0',
      subject: 'P',
      chapter: '1',
      level: 'V',
      question_code_id: '0P1V1-1',
      creator: users[6].id, // Teacher 4
    },
  });
  questions.push(q5);

  console.log(`✅ Created ${questions.length} questions (MC, TF, SA, ES types)\n`);

  // ========================================
  // 4. CREATE EXAMS với EXAM_QUESTIONS
  // ========================================
  console.log('📋 Creating exams...');

  const exams: any[] = [];

  // Exam 1: Kiểm tra Toán lớp 10 - Chương 1
  const exam1 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Kiểm tra Toán 10 - Chương 1: Mệnh đề và Tập hợp',
      description: 'Bài kiểm tra 15 phút chương 1 môn Toán lớp 10',
      instructions: 'Thời gian làm bài: 15 phút. Học sinh làm bài trên giấy thi.',
      exam_type: 'generated',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      subject: 'Toán',
      grade: 10,
      chapter: 'Chương 1',
      duration_minutes: 15,
      total_points: 0, // Sẽ được tự động tính
      pass_percentage: 50,
      shuffle_questions: true,
      shuffle_answers: true,
      show_results: true,
      show_answers: false,
      allow_review: true,
      max_attempts: 2,
      tags: ['Toán 10', 'Chương 1', 'Mệnh đề', 'Tập hợp'],
      created_by: users[0].id, // Admin 1
      published_at: new Date(),
    },
  });
  exams.push(exam1);

  // Tạo exam_questions cho exam1
  await prisma.exam_questions.create({
    data: {
      id: generateId(),
      exam_id: exam1.id,
      question_id: q1.id,
      order_number: 1,
      points: 2,
      is_bonus: false,
    },
  });

  await prisma.exam_questions.create({
    data: {
      id: generateId(),
      exam_id: exam1.id,
      question_id: q2.id,
      order_number: 2,
      points: 3,
      is_bonus: false,
    },
  });

  await prisma.exam_questions.create({
    data: {
      id: generateId(),
      exam_id: exam1.id,
      question_id: q3.id,
      order_number: 3,
      points: 2,
      is_bonus: false,
    },
  });

  await prisma.exam_questions.create({
    data: {
      id: generateId(),
      exam_id: exam1.id,
      question_id: q5.id,
      order_number: 4,
      points: 3,
      is_bonus: true, // Câu bonus
    },
  });

  // Exam 2: Kiểm tra Vật lý lớp 11
  const exam2 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Kiểm tra Vật lý 11 - Chương 2: Động lực học',
      description: 'Bài kiểm tra 45 phút chương 2 môn Vật lý lớp 11',
      instructions: 'Thời gian làm bài: 45 phút. Được sử dụng máy tính cầm tay.',
      exam_type: 'generated',
      status: 'ACTIVE',
      difficulty: 'EASY',
      subject: 'Vật lý',
      grade: 11,
      chapter: 'Chương 2',
      duration_minutes: 45,
      total_points: 0,
      pass_percentage: 60,
      shuffle_questions: false,
      shuffle_answers: true,
      show_results: true,
      show_answers: true,
      allow_review: true,
      max_attempts: 1,
      tags: ['Vật lý 11', 'Chương 2', 'Động lực học', 'Newton'],
      created_by: users[3].id, // Teacher 1
      published_at: new Date(),
    },
  });
  exams.push(exam2);

  // Tạo exam_questions cho exam2
  await prisma.exam_questions.create({
    data: {
      id: generateId(),
      exam_id: exam2.id,
      question_id: q4.id,
      order_number: 1,
      points: 10,
      is_bonus: false,
    },
  });

  console.log(`✅ Created ${exams.length} exams with exam_questions\n`);

  console.log('✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${users.length} (3 Admin, 4 Teacher, 100 Student)`);
  console.log(`   - Question Codes: ${questionCodes.length} (5 ID5, 5 ID6)`);
  console.log(`   - Questions: ${questions.length} (MC, TF, SA, ES types)`);
  console.log(`   - Exams: ${exams.length} (with exam_questions junction table)`);
  console.log('\n📝 Question Types:');
  console.log('   - MC (Multiple Choice): 2 questions');
  console.log('   - TF (True/False): 1 question');
  console.log('   - SA (Short Answer): 1 question');
  console.log('   - ES (Essay): 1 question');
  console.log('\n📋 Exams:');
  console.log('   - Exam 1: Toán 10 - Chương 1 (4 questions, 10 points)');
  console.log('   - Exam 2: Vật lý 11 - Chương 2 (1 question, 10 points)');
  console.log('\n🔑 Login credentials (Password: Abd8stbcs!):');
  console.log('   Admin: admin1@nynus.com, admin2@nynus.com, admin3@nynus.com');
  console.log('   Teacher: teacher_tu@nynus.com, teacher_linh@nynus.com, teacher_thanh@nynus.com, teacher_hy@nynus.com');
  console.log('   Student: student1@nynus.com ... student100@nynus.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

