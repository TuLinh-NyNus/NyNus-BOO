/**
 * NyNus Exam Bank System - Questions & Exams Seed Script
 * 
 * This script creates sample questions and exams
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateId(): string {
  return crypto.randomUUID();
}

export async function seedQuestionsAndExams() {
  console.log('📝 Creating question codes...');

  // Create question codes first (required by foreign key constraint)
  // Using raw SQL because QuestionCode model is not in Prisma schema
  const questionCodes = [
    { code: 'Q000001', format: 'ID5', grade: '9', subject: 'T', chapter: '1', lesson: '1', level: '1' },
    { code: 'Q000002', format: 'ID5', grade: '9', subject: 'T', chapter: '2', lesson: '1', level: '2' },
    { code: 'Q000003', format: 'ID5', grade: '9', subject: 'T', chapter: '1', lesson: '1', level: '1' },
    { code: 'Q000004', format: 'ID5', grade: '9', subject: 'T', chapter: '1', lesson: '1', level: '3' },
    { code: 'Q000005', format: 'ID5', grade: '9', subject: 'T', chapter: '3', lesson: '1', level: '2' },
    { code: 'Q000006', format: 'ID5', grade: '7', subject: 'L', chapter: '1', lesson: '1', level: '1' },
    { code: 'Q000007', format: 'ID5', grade: '7', subject: 'H', chapter: '1', lesson: '1', level: '1' },
  ];

  for (const qc of questionCodes) {
    await prisma.$executeRaw`
      INSERT INTO question_code (code, format, grade, subject, chapter, lesson, level)
      VALUES (${qc.code}, ${qc.format}::codeformat, ${qc.grade}, ${qc.subject}, ${qc.chapter}, ${qc.lesson}, ${qc.level})
      ON CONFLICT (code) DO NOTHING
    `;
  }

  console.log(`✅ Created ${questionCodes.length} question codes\n`);
  console.log('📝 Creating sample questions...');

  // Sample Math questions for Grade 12
  const mathQuestions = [];

  // Question 1: Multiple Choice
  const q1 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Tính đạo hàm của hàm số y = x^2 + 3x + 1',
      content: 'Tính đạo hàm của hàm số y = x² + 3x + 1',
      type: 'MC', // Multiple Choice
      difficulty: 'EASY',
      grade: '9', // Grade 12 (using level 9)
      subject: 'T', // Toán
      chapter: '1',
      level: '1',
      question_code_id: 'Q000001',
      status: 'ACTIVE',
      answers: [
        { id: 'A', text: "y' = 2x + 3" },
        { id: 'B', text: "y' = x + 3" },
        { id: 'C', text: "y' = 2x" },
        { id: 'D', text: "y' = 3x + 1" },
      ],
      correct_answer: { id: 'A' },
      solution: 'Áp dụng công thức đạo hàm: (x^n)\' = n*x^(n-1) và (c)\' = 0',
      tag: ['đạo hàm', 'hàm bậc 2'],
    },
  });
  mathQuestions.push(q1);

  // Question 2: Multiple Choice
  const q2 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Tích phân của hàm số f(x) = 2x từ 0 đến 1 bằng',
      content: 'Tích phân của hàm số f(x) = 2x từ 0 đến 1 bằng',
      type: 'MC', // Multiple Choice
      difficulty: 'MEDIUM',
      grade: '9', // Grade 12 (using level 9)
      subject: 'T',
      chapter: '2',
      level: '2',
      question_code_id: 'Q000002',
      status: 'ACTIVE',
      answers: [
        { id: 'A', text: '0' },
        { id: 'B', text: '1' },
        { id: 'C', text: '2' },
        { id: 'D', text: '4' },
      ],
      correct_answer: { id: 'B' },
      solution: '∫₀¹ 2x dx = [x²]₀¹ = 1² - 0² = 1',
      tag: ['tích phân', 'nguyên hàm'],
    },
  });
  mathQuestions.push(q2);

  // Question 3: True/False
  const q3 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Hàm số y = x^3 đồng biến trên R',
      content: 'Hàm số y = x³ đồng biến trên ℝ',
      type: 'TF', // True/False
      difficulty: 'EASY',
      grade: '9', // Grade 12 (using level 9)
      subject: 'T',
      chapter: '1',
      level: '1',
      question_code_id: 'Q000003',
      status: 'ACTIVE',
      answers: [
        { id: 'A', text: 'Đúng' },
        { id: 'B', text: 'Sai' },
      ],
      correct_answer: { id: 'A' },
      solution: "y' = 3x² ≥ 0 với mọi x ∈ ℝ, nên hàm số đồng biến trên ℝ",
      tag: ['hàm số', 'tính đơn điệu'],
    },
  });
  mathQuestions.push(q3);

  // Question 4: Multiple Choice - Harder
  const q4 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Giá trị lớn nhất của hàm số y = x^3 - 3x + 2 trên đoạn [-2, 2]',
      content: 'Giá trị lớn nhất của hàm số y = x³ - 3x + 2 trên đoạn [-2, 2]',
      type: 'MC', // Multiple Choice
      difficulty: 'HARD',
      grade: '9', // Grade 12 (using level 9)
      subject: 'T',
      chapter: '1',
      level: '3',
      question_code_id: 'Q000004',
      status: 'ACTIVE',
      answers: [
        { id: 'A', text: '0' },
        { id: 'B', text: '2' },
        { id: 'C', text: '4' },
        { id: 'D', text: '6' },
      ],
      correct_answer: { id: 'C' },
      solution: "y' = 3x² - 3 = 0 ⇔ x = ±1. Tính y(-2) = 0, y(-1) = 4, y(1) = 0, y(2) = 4. Max = 4",
      tag: ['cực trị', 'giá trị lớn nhất'],
    },
  });
  mathQuestions.push(q4);

  // Question 5: Short Answer
  const q5 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Tính lim (x->0) (sin x / x)',
      content: 'Tính lim (x→0) (sin x / x)',
      type: 'SA', // Short Answer
      difficulty: 'MEDIUM',
      grade: '9', // Grade 12 (using level 9)
      subject: 'T',
      chapter: '3',
      level: '2',
      question_code_id: 'Q000005',
      status: 'ACTIVE',
      correct_answer: { value: '1' },
      solution: 'Đây là giới hạn cơ bản: lim (x→0) (sin x / x) = 1',
      tag: ['giới hạn', 'hàm lượng giác'],
    },
  });
  mathQuestions.push(q5);

  // Physics questions
  const q6 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Công thức tính vận tốc trong chuyển động thẳng đều',
      content: 'Công thức tính vận tốc trong chuyển động thẳng đều',
      type: 'MC', // Multiple Choice
      difficulty: 'EASY',
      grade: '7', // Grade 10 (using level 7)
      subject: 'L', // Lý
      chapter: '1',
      level: '1',
      question_code_id: 'Q000006',
      status: 'ACTIVE',
      answers: [
        { id: 'A', text: 'v = s/t' },
        { id: 'B', text: 'v = at' },
        { id: 'C', text: 'v = s*t' },
        { id: 'D', text: 'v = a/t' },
      ],
      correct_answer: { id: 'A' },
      solution: 'Trong chuyển động thẳng đều, vận tốc v = quãng đường / thời gian = s/t',
      tag: ['chuyển động thẳng đều', 'vận tốc'],
    },
  });

  // Chemistry question
  const q7 = await prisma.question.create({
    data: {
      id: generateId(),
      raw_content: 'Công thức hóa học của nước',
      content: 'Công thức hóa học của nước',
      type: 'SA', // Short Answer
      difficulty: 'EASY',
      grade: '7', // Grade 10 (using level 7)
      subject: 'H', // Hóa
      chapter: '1',
      level: '1',
      question_code_id: 'Q000007',
      status: 'ACTIVE',
      correct_answer: { value: 'H2O' },
      solution: 'Nước có công thức hóa học là H₂O (2 nguyên tử Hydro, 1 nguyên tử Oxy)',
      tag: ['hóa học cơ bản', 'công thức'],
    },
  });

  console.log(`✅ Created ${await prisma.question.count()} questions\n`);

  // ========================================
  // CREATE EXAMS
  // ========================================
  console.log('📋 Creating sample exams...');

  // Get teacher and admin for exam creation
  const teacher = await prisma.users.findFirst({ where: { role: 'TEACHER', status: 'ACTIVE' } });
  const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });

  if (!teacher || !admin) {
    console.log('⚠️  No teacher or admin found, skipping exam creation');
    return;
  }

  // Exam 1: Math Grade 12
  const exam1 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Đề thi Toán 12 - Học kỳ 1',
      description: 'Đề thi giữa kỳ môn Toán lớp 12 - Chương Đạo hàm và Tích phân',
      instructions: 'Thời gian làm bài: 90 phút. Không được sử dụng tài liệu. Làm bài trên giấy thi.',
      duration_minutes: 90,
      total_points: 100,
      pass_percentage: 50,
      exam_type: 'official',
      status: 'ACTIVE',
      difficulty: 'MEDIUM',
      grade: 12,
      subject: 'Toán',
      chapter: 'Đạo hàm và Tích phân',
      exam_year: '2024-2025',
      source_institution: 'Trường THPT Nguyễn Huệ',
      created_by: teacher.id,
      published_at: new Date(),
    },
  });

  // Add questions to exam 1
  await prisma.exam_questions.createMany({
    data: [
      {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mathQuestions[0].id,
        order_number: 1,
        points: 20,
      },
      {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mathQuestions[1].id,
        order_number: 2,
        points: 25,
      },
      {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mathQuestions[2].id,
        order_number: 3,
        points: 15,
      },
      {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mathQuestions[3].id,
        order_number: 4,
        points: 30,
      },
      {
        id: generateId(),
        exam_id: exam1.id,
        question_id: mathQuestions[4].id,
        order_number: 5,
        points: 10,
      },
    ],
  });

  // Exam 2: Practice exam
  const exam2 = await prisma.exams.create({
    data: {
      id: generateId(),
      title: 'Đề luyện tập Toán 12 - Cơ bản',
      description: 'Đề luyện tập các dạng bài cơ bản môn Toán 12',
      instructions: 'Thời gian làm bài: 45 phút. Đề thi luyện tập, không tính điểm.',
      duration_minutes: 45,
      total_points: 50,
      pass_percentage: 60,
      exam_type: 'generated', // Practice exam (using 'generated' type)
      status: 'ACTIVE',
      difficulty: 'EASY',
      grade: 12,
      subject: 'Toán',
      created_by: admin.id,
      published_at: new Date(),
    },
  });

  await prisma.exam_questions.createMany({
    data: [
      {
        id: generateId(),
        exam_id: exam2.id,
        question_id: mathQuestions[0].id,
        order_number: 1,
        points: 25,
      },
      {
        id: generateId(),
        exam_id: exam2.id,
        question_id: mathQuestions[2].id,
        order_number: 2,
        points: 25,
      },
    ],
  });

  console.log(`✅ Created ${await prisma.exams.count()} exams\n`);
}

