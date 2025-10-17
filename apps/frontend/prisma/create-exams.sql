-- NyNus - Create Exams from Imported Questions
-- Tạo 3 exams với questions từ database

-- Get admin user ID
DO $$
DECLARE
  admin_id TEXT;
  exam1_id TEXT;
  exam2_id TEXT;
  exam3_id TEXT;
  question_ids TEXT[];
  question_id TEXT;
  order_num INT;
  total_pts INT;
BEGIN
  -- Get admin user
  SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
  
  -- Generate exam IDs
  exam1_id := gen_random_uuid()::TEXT;
  exam2_id := gen_random_uuid()::TEXT;
  exam3_id := gen_random_uuid()::TEXT;
  
  -- Create Exam 1: Đề thi tổng hợp - 30 questions (15 MC + 10 TF + 5 SA)
  INSERT INTO exams (
    id, title, description, instructions, exam_type, status, difficulty,
    subject, grade, chapter, duration_minutes, total_points, pass_percentage,
    shuffle_questions, shuffle_answers, show_results, show_answers, allow_review,
    max_attempts, tags, created_by, published_at, created_at, updated_at
  ) VALUES (
    exam1_id::UUID,
    'Đề thi tổng hợp Toán 10 - Học kỳ 1',
    'Đề thi tổng hợp kiến thức Toán lớp 10 học kỳ 1',
    'Thời gian làm bài: 90 phút. Học sinh làm bài trên giấy thi. Không sử dụng tài liệu.',
    'generated',
    'ACTIVE',
    'MEDIUM',
    'Toán',
    10,
    'Tổng hợp',
    90,
    30, -- Will update later
    50,
    true,
    true,
    true,
    false,
    true,
    2,
    ARRAY['Toán 10', 'Học kỳ 1', 'Tổng hợp'],
    admin_id,
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Add 15 MC questions to Exam 1
  order_num := 1;
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'MC' AND status = 'ACTIVE' LIMIT 15
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam1_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Add 10 TF questions to Exam 1
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'TF' AND status = 'ACTIVE' LIMIT 10
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam1_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Add 5 SA questions to Exam 1
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'SA' AND status = 'ACTIVE' LIMIT 5
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam1_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Update total_points for Exam 1
  UPDATE exams SET total_points = 30 WHERE id = exam1_id;
  
  -- Create Exam 2: Kiểm tra 15 phút - 15 questions (10 MC + 5 TF)
  INSERT INTO exams (
    id, title, description, instructions, exam_type, status, difficulty,
    subject, grade, chapter, duration_minutes, total_points, pass_percentage,
    shuffle_questions, shuffle_answers, show_results, show_answers, allow_review,
    max_attempts, tags, created_by, published_at, created_at, updated_at
  ) VALUES (
    exam2_id,
    'Kiểm tra 15 phút - Toán 10',
    'Bài kiểm tra 15 phút kiến thức cơ bản',
    'Thời gian làm bài: 15 phút. Học sinh làm bài trên giấy thi.',
    'generated',
    'ACTIVE',
    'MEDIUM',
    'Toán',
    10,
    'Chương 1',
    15,
    15,
    60,
    true,
    true,
    true,
    true,
    true,
    1,
    ARRAY['Toán 10', 'Kiểm tra 15 phút', 'Chương 1'],
    admin_id,
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Add 10 MC questions to Exam 2 (offset 15 to avoid duplicates)
  order_num := 1;
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'MC' AND status = 'ACTIVE' OFFSET 15 LIMIT 10
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam2_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Add 5 TF questions to Exam 2 (offset 10)
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'TF' AND status = 'ACTIVE' OFFSET 10 LIMIT 5
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam2_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Create Exam 3: Học sinh giỏi - 20 questions (10 MC + 5 SA + 5 ES)
  INSERT INTO exams (
    id, title, description, instructions, exam_type, status, difficulty,
    subject, grade, chapter, duration_minutes, total_points, pass_percentage,
    shuffle_questions, shuffle_answers, show_results, show_answers, allow_review,
    max_attempts, tags, created_by, published_at, created_at, updated_at
  ) VALUES (
    exam3_id,
    'Đề thi học sinh giỏi Toán 10',
    'Đề thi dành cho học sinh giỏi, câu hỏi nâng cao',
    'Thời gian làm bài: 120 phút. Học sinh làm bài trên giấy thi. Được sử dụng máy tính cầm tay.',
    'official',
    'ACTIVE',
    'MEDIUM',
    'Toán',
    10,
    'Tổng hợp',
    120,
    25, -- 10 MC (1pt) + 5 SA (2pt) + 5 ES (3pt) = 10 + 10 + 15 = 35
    70,
    false,
    false,
    false,
    false,
    false,
    1,
    ARRAY['Toán 10', 'Học sinh giỏi', 'Nâng cao'],
    admin_id,
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Add 10 MC questions to Exam 3 (offset 25)
  order_num := 1;
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'MC' AND status = 'ACTIVE' OFFSET 25 LIMIT 10
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam3_id, question_id, order_num, 1, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Add 5 SA questions to Exam 3 (offset 5, 2 points each)
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'SA' AND status = 'ACTIVE' OFFSET 5 LIMIT 5
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam3_id, question_id, order_num, 2, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Add 5 ES questions to Exam 3 (3 points each)
  FOR question_id IN 
    SELECT id FROM question WHERE type = 'ES' AND status = 'ACTIVE' LIMIT 5
  LOOP
    INSERT INTO exam_questions (id, exam_id, question_id, order_number, points, is_bonus, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, exam3_id, question_id, order_num, 3, false, NOW(), NOW());
    order_num := order_num + 1;
  END LOOP;
  
  -- Update total_points for Exam 3
  UPDATE exams SET total_points = 35 WHERE id = exam3_id;
  
  RAISE NOTICE 'Created 3 exams successfully!';
  RAISE NOTICE 'Exam 1: % (30 questions, 30 points)', exam1_id;
  RAISE NOTICE 'Exam 2: % (15 questions, 15 points)', exam2_id;
  RAISE NOTICE 'Exam 3: % (20 questions, 35 points)', exam3_id;
END $$;

