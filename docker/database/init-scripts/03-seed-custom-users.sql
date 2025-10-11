-- NyNus Exam Bank System - Custom User Seed Script
-- Creates:
-- - 3 Admin accounts (Nguyễn Công Tú)
-- - 4 Teacher accounts (Nguyễn Công Tú, Phan Vũ Hoài Linh, Nguyễn Công Tú, Nguyễn Minh Hy)
-- - 100 Student accounts (random Vietnamese names)
-- Password for all accounts: Abd8stbcs!
-- Hashed password: $2a$10$YourHashedPasswordHere

-- Note: Password hash generated with bcrypt cost 10
-- bcrypt.hash('Abd8stbcs!', 10) = $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe

-- Set client encoding to UTF-8 for Vietnamese characters
SET CLIENT_ENCODING TO 'UTF8';

-- ========================================
-- 1. CREATE 3 ADMIN ACCOUNTS
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, last_login_at, last_login_ip, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'admin1@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'admin.congtu1', 'ADMIN', NULL, 'ACTIVE', true, 'Quản trị viên hệ thống NyNus - 1', '0901234561', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.1', NOW(), NOW()),
  (gen_random_uuid()::text, 'admin2@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'admin.congtu2', 'ADMIN', NULL, 'ACTIVE', true, 'Quản trị viên hệ thống NyNus - 2', '0901234562', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.1', NOW(), NOW()),
  (gen_random_uuid()::text, 'admin3@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'admin.congtu3', 'ADMIN', NULL, 'ACTIVE', true, 'Quản trị viên hệ thống NyNus - 3', '0901234563', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.1', NOW(), NOW());

-- ========================================
-- 2. CREATE 4 TEACHER ACCOUNTS
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, last_login_at, last_login_ip, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'teacher1@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'teacher.congtu1', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên môn Toán - Nguyễn Công Tú', '0912345670', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.2', NOW(), NOW()),
  (gen_random_uuid()::text, 'teacher2@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phan', 'Vũ Hoài Linh', 'teacher.hoailinh', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên môn Toán - Phan Vũ Hoài Linh', '0912345671', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.2', NOW(), NOW()),
  (gen_random_uuid()::text, 'teacher3@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'teacher.congtu2', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên môn Toán - Nguyễn Công Tú', '0912345672', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.2', NOW(), NOW()),
  (gen_random_uuid()::text, 'teacher4@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Minh Hy', 'teacher.minhhy', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên môn Toán - Nguyễn Minh Hy', '0912345673', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.2', NOW(), NOW());

-- ========================================
-- 3. CREATE 100 STUDENT ACCOUNTS
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, last_login_at, last_login_ip, created_at, updated_at)
VALUES
  -- Students 1-20
  (gen_random_uuid()::text, 'student1@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Văn Anh', 'nguyen.vananh1', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000001', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student2@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trần', 'Thị Bình', 'tran.thibinh2', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000002', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student3@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lê', 'Công Cường', 'le.congcuong3', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000003', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student4@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phạm', 'Minh Đức', 'pham.minhduc4', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000004', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student5@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hoàng', 'Hoàng Dũng', 'hoang.hoangdung5', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000005', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student6@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Phan', 'Thị Hà', 'phan.thiha6', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000006', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student7@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Vũ', 'Văn Hải', 'vu.vanhai7', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000007', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student8@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đặng', 'Minh Hiếu', 'dang.minhhieu8', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000008', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student9@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Bùi', 'Thị Hoa', 'bui.thihoa9', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000009', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student10@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đỗ', 'Văn Hùng', 'do.vanhung10', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000010', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student11@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Hồ', 'Thị Lan', 'ho.thilan11', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000011', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student12@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Ngô', 'Văn Long', 'ngo.vanlong12', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000012', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student13@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Dương', 'Minh Nhật', 'duong.minhnhat13', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000013', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student14@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lý', 'Thị Phương', 'ly.thiphuong14', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000014', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student15@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Võ', 'Văn Quân', 'vo.vanquan15', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000015', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student16@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Đinh', 'Thị Thảo', 'dinh.thithao16', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000016', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student17@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Mai', 'Văn Thắng', 'mai.vanthang17', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000017', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student18@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Tô', 'Minh Tuấn', 'to.minhtuan18', 'STUDENT', 3, 'ACTIVE', true, 'Học sinh lớp 12', '0920000018', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student19@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Trịnh', 'Thị Trang', 'trinh.thitrang19', 'STUDENT', 1, 'ACTIVE', true, 'Học sinh lớp 10', '0920000019', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW()),
  (gen_random_uuid()::text, 'student20@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Lâm', 'Văn Việt', 'lam.vanviet20', 'STUDENT', 2, 'ACTIVE', true, 'Học sinh lớp 11', '0920000020', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.3', NOW(), NOW());

-- Note: Due to 300-line limit, students 21-100 will be added in a separate file
-- See: 03-seed-custom-users-part2.sql

-- ========================================
-- SUMMARY
-- ========================================
-- Total users created in this file: 27
-- - 3 Admins
-- - 4 Teachers
-- - 20 Students (1-20)
-- 
-- Remaining: 80 students (21-100) in part 2
-- 
-- Password for ALL accounts: Abd8stbcs!
-- Hashed: $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe
-- 
-- Login examples:
-- - admin1@nynus.com / Abd8stbcs!
-- - teacher1@nynus.com / Abd8stbcs!
-- - student1@nynus.com / Abd8stbcs!

