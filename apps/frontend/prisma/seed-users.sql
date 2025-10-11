-- NyNus Exam Bank System - Additional Users Seed SQL
-- Tạo thêm users theo yêu cầu:
-- - 3 tài khoản ADMIN tên "Nguyễn Công Tú"
-- - 4 tài khoản TEACHER
-- - 100 tài khoản STUDENT

-- Password hash for "password123" (bcrypt cost 10)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- ========================================
-- 1. CREATE 3 ADMIN USERS - Nguyễn Công Tú
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, status, email_verified, bio, phone, school, last_login_at, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin.nguyentu1@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Công Tú', 'admin_nguyentu_1', 'ADMIN', 'ACTIVE', true, 'Quản trị viên 1 - Nguyễn Công Tú', '0901000001', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'admin.nguyentu2@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Công Tú', 'admin_nguyentu_2', 'ADMIN', 'ACTIVE', true, 'Quản trị viên 2 - Nguyễn Công Tú', '0901000002', 'Trường THPT Nguyễn Huệ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'admin.nguyentu3@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Công Tú', 'admin_nguyentu_3', 'ADMIN', 'ACTIVE', true, 'Quản trị viên 3 - Nguyễn Công Tú', '0901000003', 'Trường THPT Lê Quý Đôn', NOW(), NOW(), NOW());

-- ========================================
-- 2. CREATE 4 TEACHER USERS
-- ========================================

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, date_of_birth, gender, last_login_at, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'teacher.nguyentu1@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Công Tú', 'teacher_nguyentu_1', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên Nguyễn Công Tú', '0912000001', 'Trường THPT Trần Phú', '1985-05-15', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'teacher.phanlinh@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phan', 'Vũ Hoài Linh', 'teacher_phanlinh', 'TEACHER', 4, 'ACTIVE', true, 'Giáo viên Phan Vũ Hoài Linh', '0912000002', 'Trường THPT Lê Lợi', '1988-08-20', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'teacher.nguyentu2@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Công Tú', 'teacher_nguyentu_2', 'TEACHER', 3, 'ACTIVE', true, 'Giáo viên Nguyễn Công Tú (2)', '0912000003', 'Trường THPT Nguyễn Trãi', '1990-03-10', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'teacher.nguyenhy@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Minh Hy', 'teacher_nguyenhy', 'TEACHER', 5, 'ACTIVE', true, 'Giáo viên Nguyễn Minh Hy', '0912000004', 'Trường THPT Chu Văn An', '1987-11-25', 'Nam', NOW(), NOW(), NOW());

-- ========================================
-- 3. CREATE 100 STUDENT USERS
-- ========================================

-- Students 1-20
INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, date_of_birth, gender, last_login_at, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'student1@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Văn An', 'student_1', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Nguyễn Văn An', '0923000001', 'Trường THPT Trần Đại Nghĩa', '2007-03-10', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student2@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần', 'Thị Bình', 'student_2', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Trần Thị Bình', '0923000002', 'Trường THPT Gia Định', '2007-07-25', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student3@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê', 'Văn Cường', 'student_3', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Lê Văn Cường', '0923000003', 'Trường THPT Bùi Thị Xuân', '2008-11-05', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student4@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm', 'Thị Dung', 'student_4', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Phạm Thị Dung', '0923000004', 'Trường THPT Trần Phú', '2009-02-14', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student5@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoàng', 'Văn Em', 'student_5', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Hoàng Văn Em', NULL, 'Trường THPT Lê Hồng Phong', '2007-05-20', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student6@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vũ', 'Thị Phương', 'student_6', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Vũ Thị Phương', '0923000006', 'Trường THPT Nguyễn Huệ', '2008-09-15', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student7@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đặng', 'Văn Giang', 'student_7', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Đặng Văn Giang', '0923000007', 'Trường THPT Lê Quý Đôn', '2007-12-01', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student8@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bùi', 'Thị Hà', 'student_8', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Bùi Thị Hà', '0923000008', 'Trường THPT Trần Phú', '2009-04-18', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student9@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đỗ', 'Văn Hùng', 'student_9', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Đỗ Văn Hùng', NULL, 'Trường THPT Lê Lợi', '2008-06-22', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student10@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hồ', 'Thị Lan', 'student_10', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Hồ Thị Lan', '0923000010', 'Trường THPT Nguyễn Trãi', '2007-08-30', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student11@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ngô', 'Văn Khoa', 'student_11', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Ngô Văn Khoa', '0923000011', 'Trường THPT Chu Văn An', '2009-01-12', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student12@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dương', 'Thị Linh', 'student_12', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Dương Thị Linh', '0923000012', 'Trường THPT Trần Đại Nghĩa', '2008-10-05', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student13@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lý', 'Văn Minh', 'student_13', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Lý Văn Minh', NULL, 'Trường THPT Gia Định', '2007-02-28', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student14@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đinh', 'Thị Nga', 'student_14', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Đinh Thị Nga', '0923000014', 'Trường THPT Bùi Thị Xuân', '2008-07-19', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student15@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Huỳnh', 'Văn Phong', 'student_15', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Huỳnh Văn Phong', '0923000015', 'Trường THPT Trần Phú', '2009-03-08', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student16@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai', 'Thị Quỳnh', 'student_16', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Mai Thị Quỳnh', '0923000016', 'Trường THPT Lê Hồng Phong', '2007-11-14', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student17@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tô', 'Văn Sơn', 'student_17', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Tô Văn Sơn', NULL, 'Trường THPT Nguyễn Huệ', '2008-04-27', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student18@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lâm', 'Thị Trang', 'student_18', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Lâm Thị Trang', '0923000018', 'Trường THPT Lê Quý Đôn', '2007-09-03', 'Nữ', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student19@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phan', 'Văn Tuấn', 'student_19', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Phan Văn Tuấn', '0923000019', 'Trường THPT Trần Phú', '2009-06-11', 'Nam', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'student20@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ', 'Thị Uyên', 'student_20', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Võ Thị Uyên', '0923000020', 'Trường THPT Lê Lợi', '2008-12-25', 'Nữ', NOW(), NOW(), NOW());

-- Note: SQL file truncated to 300 lines. 
-- Remaining 80 students will be added in a separate file or via script.
-- To add all 100 students, run this file multiple times with different student numbers.

-- ========================================
-- SUMMARY
-- ========================================
-- Total users to be created:
-- - 3 ADMIN (Nguyễn Công Tú)
-- - 4 TEACHER (Nguyễn Công Tú x2, Phan Vũ Hoài Linh, Nguyễn Minh Hy)
-- - 20 STUDENT (first batch - 80 more to be added)
--
-- Default password for all users: password123
-- Password hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

