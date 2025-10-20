/**
 * NyNus - Create 10 Exams from Imported Questions
 * 
 * Tạo 10 exams với cấu trúc đa dạng từ questions đã import
 * 
 * Usage: tsx prisma/create-exams.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Exam configurations
const examConfigs = [
  {
    title: 'Đề thi tổng hợp Toán 10 - Học kỳ 1',
    description: 'Đề thi tổng hợp kiến thức Toán lớp 10 học kỳ 1',
    instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi. Không sử dụng tài liệu.',
    exam_type: 'generated',
    difficulty: 'MEDIUM',
    subject: 'Toán',
    grade: 10,
    chapter: 'Tổng hợp',
    duration_minutes: 90,
    pass_percentage: 50,
    tags: ['Toán 10', 'Học kỳ 1', 'Tổng hợp'],
    questions: { MC: 20, TF: 15, SA: 10, ES: 5 }, // Total: 50 questions
  },
  {
    title: 'Kiểm tra 15 phút - Toán 10 Chương 1',
    description: 'Bài kiểm tra 15 phút kiến thức cơ bản Chương 1',
    instructions: 'Thời gian làm bài: 15 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'generated',
    difficulty: 'EASY',
    subject: 'Toán',
    grade: 10,
    chapter: 'Chương 1',
    duration_minutes: 15,
    pass_percentage: 60,
    tags: ['Toán 10', 'Kiểm tra 15 phút', 'Chương 1'],
    questions: { MC: 10, TF: 5 }, // Total: 15 questions
  },
  {
    title: 'Đề thi học sinh giỏi Toán 10',
    description: 'Đề thi dành cho học sinh giỏi, câu hỏi nâng cao',
    instructions: 'Thời gian làm bài: 120 phút. Học sinh làm bài trên giấy thi. Được sử dụng máy tính cầm tay.',
    exam_type: 'official',
    difficulty: 'HARD',
    subject: 'Toán',
    grade: 10,
    chapter: 'Tổng hợp',
    duration_minutes: 120,
    pass_percentage: 70,
    tags: ['Toán 10', 'Học sinh giỏi', 'Nâng cao'],
    questions: { MC: 15, SA: 10, ES: 10 }, // Total: 35 questions
  },
  {
    title: 'Đề thi giữa kỳ 1 - Toán 10',
    description: 'Đề thi giữa học kỳ 1 môn Toán lớp 10',
    instructions: 'Thời gian làm bài: 60 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'official',
    difficulty: 'MEDIUM',
    subject: 'Toán',
    grade: 10,
    chapter: 'Chương 1-2',
    duration_minutes: 60,
    pass_percentage: 50,
    tags: ['Toán 10', 'Giữa kỳ', 'Chương 1-2'],
    questions: { MC: 15, TF: 10, SA: 5 }, // Total: 30 questions
  },
  {
    title: 'Đề thi cuối kỳ 1 - Toán 10',
    description: 'Đề thi cuối học kỳ 1 môn Toán lớp 10',
    instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'official',
    difficulty: 'MEDIUM',
    subject: 'Toán',
    grade: 10,
    chapter: 'Tổng hợp HK1',
    duration_minutes: 90,
    pass_percentage: 50,
    tags: ['Toán 10', 'Cuối kỳ', 'Học kỳ 1'],
    questions: { MC: 20, TF: 10, SA: 8, ES: 2 }, // Total: 40 questions
  },
  {
    title: 'Đề luyện tập Toán 10 - Chương 2',
    description: 'Đề luyện tập kiến thức Chương 2',
    instructions: 'Thời gian làm bài: 45 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'generated',
    difficulty: 'EASY',
    subject: 'Toán',
    grade: 10,
    chapter: 'Chương 2',
    duration_minutes: 45,
    pass_percentage: 60,
    tags: ['Toán 10', 'Luyện tập', 'Chương 2'],
    questions: { MC: 15, TF: 10, SA: 5 }, // Total: 30 questions
  },
  {
    title: 'Đề thi thử THPT Quốc gia - Toán',
    description: 'Đề thi thử THPT Quốc gia môn Toán',
    instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi. Được sử dụng máy tính cầm tay.',
    exam_type: 'generated',
    difficulty: 'HARD',
    subject: 'Toán',
    grade: 12,
    chapter: 'Tổng hợp',
    duration_minutes: 90,
    pass_percentage: 50,
    tags: ['Toán 12', 'THPT Quốc gia', 'Thi thử'],
    questions: { MC: 40, SA: 10 }, // Total: 50 questions
  },
  {
    title: 'Kiểm tra 45 phút - Toán 10 Chương 3',
    description: 'Bài kiểm tra 45 phút Chương 3',
    instructions: 'Thời gian làm bài: 45 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'generated',
    difficulty: 'MEDIUM',
    subject: 'Toán',
    grade: 10,
    chapter: 'Chương 3',
    duration_minutes: 45,
    pass_percentage: 50,
    tags: ['Toán 10', 'Kiểm tra 45 phút', 'Chương 3'],
    questions: { MC: 12, TF: 8, SA: 5 }, // Total: 25 questions
  },
  {
    title: 'Đề ôn tập học kỳ 2 - Toán 10',
    description: 'Đề ôn tập tổng hợp học kỳ 2',
    instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi.',
    exam_type: 'generated',
    difficulty: 'MEDIUM',
    subject: 'Toán',
    grade: 10,
    chapter: 'Tổng hợp HK2',
    duration_minutes: 90,
    pass_percentage: 50,
    tags: ['Toán 10', 'Ôn tập', 'Học kỳ 2'],
    questions: { MC: 25, TF: 15, SA: 10 }, // Total: 50 questions
  },
  {
    title: 'Đề thi Olympic Toán 10',
    description: 'Đề thi Olympic Toán lớp 10 cấp trường',
    instructions: 'Thời gian làm bài: 150 phút. Học sinh làm bài trên giấy thi. Được sử dụng máy tính cầm tay.',
    exam_type: 'official',
    difficulty: 'HARD',
    subject: 'Toán',
    grade: 10,
    chapter: 'Tổng hợp',
    duration_minutes: 150,
    pass_percentage: 70,
    tags: ['Toán 10', 'Olympic', 'Nâng cao'],
    questions: { MC: 10, SA: 15, ES: 15 }, // Total: 40 questions
  },
];

async function main() {
  console.log('📝 Starting exam creation...\n');

  // Get first admin user for creator
  const adminUser = await prisma.users.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    throw new Error('No admin user found in database');
  }

  console.log(`✅ Found admin user: ${adminUser.email}\n`);

  // Track created exams
  const createdExams: any[] = [];
  let totalQuestionsUsed = 0;

  // Create each exam
  for (let i = 0; i < examConfigs.length; i++) {
    const config = examConfigs[i];
    const examNumber = i + 1;

    console.log(`📋 Creating Exam ${examNumber}/10: ${config.title}`);

    try {
      // Calculate total points
      const totalPoints = Object.entries(config.questions).reduce((sum, [type, count]) => {
        const pointsPerQuestion = type === 'ES' ? 3 : type === 'SA' ? 2 : 1;
        return sum + (count * pointsPerQuestion);
      }, 0);

      // Create exam
      const exam = await prisma.exams.create({
        data: {
          id: generateId(),
          title: config.title,
          description: config.description,
          instructions: config.instructions,
          exam_type: config.exam_type,
          status: 'ACTIVE',
          difficulty: config.difficulty,
          subject: config.subject,
          grade: config.grade,
          chapter: config.chapter,
          duration_minutes: config.duration_minutes,
          total_points: totalPoints,
          pass_percentage: config.pass_percentage,
          shuffle_questions: true,
          shuffle_answers: true,
          show_results: true,
          show_answers: config.exam_type === 'practice',
          allow_review: true,
          max_attempts: config.exam_type === 'practice' ? 3 : 2,
          tags: config.tags,
          created_by: adminUser.id,
          published_at: new Date(),
        },
      });

      // Add questions to exam
      let orderNumber = 1;
      let examQuestionsCount = 0;

      for (const [type, count] of Object.entries(config.questions)) {
        // Get questions of this type
        const questions = await prisma.question.findMany({
          where: {
            type: type,
            status: 'ACTIVE',
          },
          take: count,
          skip: totalQuestionsUsed, // Offset to avoid duplicates across exams
        });

        // Add questions to exam
        for (const question of questions) {
          const pointsPerQuestion = type === 'ES' ? 3 : type === 'SA' ? 2 : 1;

          await prisma.exam_questions.create({
            data: {
              id: generateId(),
              exam_id: exam.id,
              question_id: question.id,
              order_number: orderNumber,
              points: pointsPerQuestion,
              is_bonus: false,
            },
          });

          orderNumber++;
          examQuestionsCount++;
        }

        totalQuestionsUsed += questions.length;
      }

      createdExams.push({
        id: exam.id,
        title: exam.title,
        questions: examQuestionsCount,
        points: totalPoints,
      });

      console.log(`   ✅ Created with ${examQuestionsCount} questions, ${totalPoints} points\n`);
    } catch (error) {
      console.error(`   ❌ Error creating exam ${examNumber}:`, error);
    }
  }

  console.log('\n✅ Exam creation completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Total exams created: ${createdExams.length}`);
  console.log(`   - Total questions used: ${totalQuestionsUsed}\n`);

  console.log('📋 Created Exams:');
  createdExams.forEach((exam, index) => {
    console.log(`   ${index + 1}. ${exam.title}`);
    console.log(`      - Questions: ${exam.questions}, Points: ${exam.points}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Exam creation failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

