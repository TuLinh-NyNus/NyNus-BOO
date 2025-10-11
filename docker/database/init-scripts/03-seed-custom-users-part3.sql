-- NyNus Exam Bank System - Custom User Seed Script (Part 3)
-- Creates: 50 Guest accounts (guest1-50)
-- Password for all accounts: Abd8stbcs!
-- Hash: $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe

-- Set client encoding to UTF-8 for Vietnamese characters
SET CLIENT_ENCODING TO 'UTF8';

-- ========================================
-- GUESTS 1-50 (50 GUESTS)
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, last_login_at, last_login_ip, created_at, updated_at)
VALUES
  -- Guests 1-25
  (gen_random_uuid()::text, 'guest1@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Văn A', 'guest.vana1', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000001', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest2@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trần', 'Thị B', 'guest.thib2', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000002', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest3@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lê', 'Văn C', 'guest.vanc3', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000003', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest4@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phạm', 'Thị D', 'guest.thid4', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000004', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest5@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hoàng', 'Văn E', 'guest.vane5', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000005', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest6@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phan', 'Thị F', 'guest.thif6', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000006', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest7@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Vũ', 'Văn G', 'guest.vang7', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000007', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest8@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đặng', 'Thị H', 'guest.thih8', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000008', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest9@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Bùi', 'Văn I', 'guest.vani9', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000009', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest10@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đỗ', 'Thị K', 'guest.thik10', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000010', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest11@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hồ', 'Văn L', 'guest.vanl11', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000011', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest12@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Ngô', 'Thị M', 'guest.thim12', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000012', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest13@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Dương', 'Văn N', 'guest.vann13', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000013', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest14@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lý', 'Thị O', 'guest.thio14', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000014', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest15@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Võ', 'Văn P', 'guest.vanp15', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000015', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest16@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đinh', 'Thị Q', 'guest.thiq16', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000016', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest17@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Mai', 'Văn R', 'guest.vanr17', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000017', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest18@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Tô', 'Thị S', 'guest.this18', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000018', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest19@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trịnh', 'Văn T', 'guest.vant19', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000019', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest20@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lâm', 'Thị U', 'guest.thiu20', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000020', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest21@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Văn V', 'guest.vanv21', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000021', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest22@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trần', 'Thị W', 'guest.thiw22', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000022', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest23@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lê', 'Văn X', 'guest.vanx23', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000023', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest24@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phạm', 'Thị Y', 'guest.thiy24', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000024', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest25@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hoàng', 'Văn Z', 'guest.vanz25', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000025', NULL, NOW(), '192.168.1.4', NOW(), NOW()),

  -- Guests 26-50
  (gen_random_uuid()::text, 'guest26@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phan', 'Thị An', 'guest.thian26', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000026', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest27@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Vũ', 'Văn Bình', 'guest.vanbinh27', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000027', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest28@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đặng', 'Thị Chi', 'guest.thichi28', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000028', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest29@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Bùi', 'Văn Dũng', 'guest.vandung29', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000029', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest30@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đỗ', 'Thị Em', 'guest.thiem30', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000030', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest31@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hồ', 'Văn Phúc', 'guest.vanphuc31', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000031', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest32@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Ngô', 'Thị Giang', 'guest.thigiang32', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000032', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest33@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Dương', 'Văn Hải', 'guest.vanhai33', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000033', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest34@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lý', 'Thị Hoa', 'guest.thihoa34', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000034', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest35@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Võ', 'Văn Hùng', 'guest.vanhung35', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000035', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest36@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đinh', 'Thị Lan', 'guest.thilan36', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000036', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest37@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Mai', 'Văn Long', 'guest.vanlong37', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000037', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest38@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Tô', 'Thị Mai', 'guest.thimai38', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000038', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest39@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trịnh', 'Văn Nam', 'guest.vannam39', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000039', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest40@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lâm', 'Thị Nga', 'guest.thinga40', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000040', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest41@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Văn Phong', 'guest.vanphong41', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000041', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest42@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trần', 'Thị Quỳnh', 'guest.thiquynh42', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000042', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest43@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lê', 'Văn Sơn', 'guest.vanson43', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000043', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest44@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phạm', 'Thị Tâm', 'guest.thitam44', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000044', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest45@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hoàng', 'Văn Thắng', 'guest.vanthang45', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000045', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest46@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phan', 'Thị Thu', 'guest.thithu46', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000046', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest47@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Vũ', 'Văn Toàn', 'guest.vantoan47', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000047', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest48@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đặng', 'Thị Tuyết', 'guest.thituyet48', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000048', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest49@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Bùi', 'Văn Việt', 'guest.vanviet49', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000049', NULL, NOW(), '192.168.1.4', NOW(), NOW()),
  (gen_random_uuid()::text, 'guest50@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đỗ', 'Thị Xuân', 'guest.thixuan50', 'GUEST', NULL, 'ACTIVE', true, 'Khách tham quan hệ thống', '0930000050', NULL, NOW(), '192.168.1.4', NOW(), NOW());

-- ========================================
-- SUMMARY (Part 3 - COMPLETE)
-- ========================================
-- Total users in this file: 50 (guests 1-50)
-- 
-- Password for ALL accounts: Abd8stbcs!
-- Hash: $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe
-- 
-- Login examples:
-- - guest1@nynus.com / Abd8stbcs!
-- - guest25@nynus.com / Abd8stbcs!
-- - guest50@nynus.com / Abd8stbcs!
-- 
-- GRAND TOTAL (All 3 parts):
-- - Part 1: 27 users (3 Admin + 4 Teacher + 20 Student)
-- - Part 2: 80 users (80 Student)
-- - Part 3: 50 users (50 Guest)
-- - TOTAL: 157 users

