import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateId(): string {
  return crypto.randomUUID();
}

async function main() {
  console.log('📝 Creating exams from imported questions...\n');

  const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('No admin user found');

  const mcQuestions = await prisma.question.findMany({ 
    where: { type: 'MC', status: 'ACTIVE' }, 
    take: 35,
    select: { id: true }
  });
  
  const tfQuestions = await prisma.question.findMany({ 
    where: { type: 'TF', status: 'ACTIVE' }, 
    take: 15,
    select: { id: true }
  });
  
  const saQuestions = await prisma.question.findMany({ 
    where: { type: 'SA', status: 'ACTIVE' }, 
    take: 10,
    select: { id: true }
  });
  
  const esQuestions = await prisma.question.findMany({ 
    where: { type: 'ES', status: 'ACTIVE' }, 
    take: 5,
    select: { id: true }
  });

  console.log(`📊 Found questions: MC=${mcQuestions.length}, TF=${tfQuestions.length}, SA=${saQuestions.length}, ES=${esQuestions.length}\n`);

  // Exam 1: Đề thi tổng hợp - 30 questions (15 MC + 10 TF + 5 SA)
  console.log('📝 Creating Exam 1: Đề thi tổng hợp...');
  const exam1 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Đề thi tổng hợp Toán 10 - Học kỳ 1',
      description: 'Đề thi tổng hợp kiến thức Toán lớp 10 học kỳ 1',
      instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi.',
      exam_type: 'generated',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      subject: 'Toán',
      grade: 10,
      chapter: 'Tổng hợp',
      duration_minutes: 90,
      total_points: 30,
      pass_percentage: 50,
      shuffle_questions: true,
      shuffle_answers: true,
      show_results: true,
      show_answers: false,
      allow_review: true,
      max_attempts: 2,
      tags: ['Toán 10', 'Học kỳ 1', 'Tổng hợp'],
      created_by: admin.id,
      published_at: new Date(),
    },
  });

  // Add 15 MC questions
  for (let i = 0; i < 15; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mcQuestions[i].id,
        order_number: i + 1,
        points: 1,
        is_bonus: false,
      },
    });
  }

  // Add 10 TF questions
  for (let i = 0; i < 10; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam1.id,
        question_id: tfQuestions[i].id,
        order_number: 15 + i + 1,
        points: 1,
        is_bonus: false,
      },
    });
  }

  // Add 5 SA questions
  for (let i = 0; i < 5; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam1.id,
        question_id: saQuestions[i].id,
        order_number: 25 + i + 1,
        points: 1,
        is_bonus: false,
      },
    });
  }

  console.log('✅ Created Exam 1: 30 questions, 30 points\n');

  // Exam 2: Kiểm tra 15 phút - 15 questions (10 MC + 5 TF)
  console.log('📝 Creating Exam 2: Kiểm tra 15 phút...');
  const exam2 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Kiểm tra 15 phút - Toán 10',
      description: 'Bài kiểm tra 15 phút kiến thức cơ bản',
      instructions: 'Thời gian làm bài: 15 phút. Học sinh làm bài trên giấy thi.',
      exam_type: 'generated',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      subject: 'Toán',
      grade: 10,
      chapter: 'Chương 1',
      duration_minutes: 15,
      total_points: 15,
      pass_percentage: 60,
      shuffle_questions: true,
      shuffle_answers: true,
      show_results: true,
      show_answers: true,
      allow_review: true,
      max_attempts: 1,
      tags: ['Toán 10', 'Kiểm tra 15 phút', 'Chương 1'],
      created_by: admin.id,
      published_at: new Date(),
    },
  });

  // Add 10 MC questions (offset 15)
  for (let i = 15; i < 25; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam2.id,
        question_id: mcQuestions[i].id,
        order_number: i - 14,
        points: 1,
        is_bonus: false,
      },
    });
  }

  // Add 5 TF questions (offset 10)
  for (let i = 10; i < 15; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam2.id,
        question_id: tfQuestions[i].id,
        order_number: i - 9 + 10,
        points: 1,
        is_bonus: false,
      },
    });
  }

  console.log('✅ Created Exam 2: 15 questions, 15 points\n');

  // Exam 3: Học sinh giỏi - 20 questions (10 MC + 5 SA + 5 ES)
  console.log('📝 Creating Exam 3: Đề thi học sinh giỏi...');
  const exam3 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Đề thi học sinh giỏi Toán 10',
      description: 'Đề thi dành cho học sinh giỏi, câu hỏi nâng cao',
      instructions: 'Thời gian làm bài: 120 phút. Được sử dụng máy tính cầm tay.',
      exam_type: 'official',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      subject: 'Toán',
      grade: 10,
      chapter: 'Tổng hợp',
      duration_minutes: 120,
      total_points: 35,
      pass_percentage: 70,
      shuffle_questions: false,
      shuffle_answers: false,
      show_results: false,
      show_answers: false,
      allow_review: false,
      max_attempts: 1,
      tags: ['Toán 10', 'Học sinh giỏi', 'Nâng cao'],
      created_by: admin.id,
      published_at: new Date(),
    },
  });

  // Add 10 MC questions (offset 25)
  for (let i = 25; i < 35; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam3.id,
        question_id: mcQuestions[i].id,
        order_number: i - 24,
        points: 1,
        is_bonus: false,
      },
    });
  }

  // Add 5 SA questions (offset 5, 2 points each)
  for (let i = 5; i < 10; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam3.id,
        question_id: saQuestions[i].id,
        order_number: i - 4 + 10,
        points: 2,
        is_bonus: false,
      },
    });
  }

  // Add 5 ES questions (3 points each)
  for (let i = 0; i < 5; i++) {
    await prisma.exam_questions.create({
      data: {
        id: generateId(),
        exam_id: exam3.id,
        question_id: esQuestions[i].id,
        order_number: i + 16,
        points: 3,
        is_bonus: false,
      },
    });
  }

  console.log('✅ Created Exam 3: 20 questions, 35 points\n');

  // Summary
  const totalExams = await prisma.exams.count();
  const totalExamQuestions = await prisma.exam_questions.count();

  console.log('✅ Exam creation completed!\n');
  console.log('📊 Summary:');
  console.log(`   - Total exams in database: ${totalExams}`);
  console.log(`   - Total exam_questions: ${totalExamQuestions}`);
  console.log('\n📋 New exams created:');
  console.log('   - Exam 1: Đề thi tổng hợp (30 questions, 30 points)');
  console.log('   - Exam 2: Kiểm tra 15 phút (15 questions, 15 points)');
  console.log('   - Exam 3: Học sinh giỏi (20 questions, 35 points)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

