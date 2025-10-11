-- NyNus Exam Bank System - 100 Students Seed SQL (Part 2)
-- Students 151-200 (remaining 50 students)
-- Password: password123 (hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)

INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, school, date_of_birth, gender, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'student151@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ngô', 'Văn Quý', 'student_151', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Ngô Văn Quý', 'Trường THPT Lê Quý Đôn', '2007-03-20', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student152@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dương', 'Văn Sơn', 'student_152', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Dương Văn Sơn', 'Trường THPT Trần Phú', '2008-04-26', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student153@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lý', 'Văn Thắng', 'student_153', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Lý Văn Thắng', 'Trường THPT Lê Lợi', '2009-05-30', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student154@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đinh', 'Văn Toàn', 'student_154', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Đinh Văn Toàn', 'Trường THPT Nguyễn Trãi', '2007-06-18', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student155@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Huỳnh', 'Thị Anh', 'student_155', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Huỳnh Thị Anh', 'Trường THPT Chu Văn An', '2008-07-24', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student156@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai', 'Thị Bích', 'student_156', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Mai Thị Bích', 'Trường THPT Trần Đại Nghĩa', '2007-08-30', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student157@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tô', 'Thị Cẩm', 'student_157', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Tô Thị Cẩm', 'Trường THPT Gia Định', '2008-09-16', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student158@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lâm', 'Thị Diễm', 'student_158', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Lâm Thị Diễm', 'Trường THPT Bùi Thị Xuân', '2009-10-22', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student159@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phan', 'Thị Hạnh', 'student_159', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Phan Thị Hạnh', 'Trường THPT Trần Phú', '2007-11-28', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student160@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ', 'Thị Hiền', 'student_160', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Võ Thị Hiền', 'Trường THPT Lê Hồng Phong', '2008-12-14', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student161@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Thị Khánh', 'student_161', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Nguyễn Thị Khánh', 'Trường THPT Nguyễn Huệ', '2007-01-20', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student162@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần', 'Thị Loan', 'student_162', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Trần Thị Loan', 'Trường THPT Lê Quý Đôn', '2009-02-26', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student163@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê', 'Thị Mỹ', 'student_163', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Lê Thị Mỹ', 'Trường THPT Trần Phú', '2008-03-30', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student164@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm', 'Thị Ngân', 'student_164', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Phạm Thị Ngân', 'Trường THPT Lê Lợi', '2007-04-16', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student165@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoàng', 'Thị Phương', 'student_165', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Hoàng Thị Phương', 'Trường THPT Nguyễn Trãi', '2008-05-22', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student166@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vũ', 'Thị Quyên', 'student_166', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Vũ Thị Quyên', 'Trường THPT Chu Văn An', '2009-06-28', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student167@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đặng', 'Thị Thanh', 'student_167', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Đặng Thị Thanh', 'Trường THPT Trần Đại Nghĩa', '2007-07-14', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student168@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bùi', 'Thị Tuyết', 'student_168', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Bùi Thị Tuyết', 'Trường THPT Gia Định', '2008-08-20', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student169@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đỗ', 'Thị Uyên', 'student_169', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Đỗ Thị Uyên', 'Trường THPT Bùi Thị Xuân', '2007-09-26', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student170@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hồ', 'Thị Vân', 'student_170', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Hồ Thị Vân', 'Trường THPT Trần Phú', '2009-10-10', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student171@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ngô', 'Thị Xuân', 'student_171', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Ngô Thị Xuân', 'Trường THPT Lê Hồng Phong', '2008-11-15', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student172@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dương', 'Văn Bình', 'student_172', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Dương Văn Bình', 'Trường THPT Nguyễn Huệ', '2007-12-22', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student173@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lý', 'Văn Cường', 'student_173', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Lý Văn Cường', 'Trường THPT Lê Quý Đôn', '2008-01-28', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student174@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đinh', 'Văn Dũng', 'student_174', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Đinh Văn Dũng', 'Trường THPT Trần Phú', '2009-02-14', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student175@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Huỳnh', 'Văn Hùng', 'student_175', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Huỳnh Văn Hùng', 'Trường THPT Lê Lợi', '2007-03-20', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student176@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai', 'Văn Khang', 'student_176', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Mai Văn Khang', 'Trường THPT Nguyễn Trãi', '2008-04-26', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student177@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tô', 'Văn Linh', 'student_177', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Tô Văn Linh', 'Trường THPT Chu Văn An', '2007-05-30', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student178@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lâm', 'Văn Minh', 'student_178', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Lâm Văn Minh', 'Trường THPT Trần Đại Nghĩa', '2009-06-18', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student179@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phan', 'Văn Nhân', 'student_179', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Phan Văn Nhân', 'Trường THPT Gia Định', '2008-07-24', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student180@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ', 'Văn Phong', 'student_180', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Võ Văn Phong', 'Trường THPT Bùi Thị Xuân', '2007-08-30', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student181@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn', 'Văn Quân', 'student_181', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Nguyễn Văn Quân', 'Trường THPT Trần Phú', '2008-09-16', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student182@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần', 'Văn Sỹ', 'student_182', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Trần Văn Sỹ', 'Trường THPT Lê Hồng Phong', '2009-10-22', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student183@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê', 'Văn Thành', 'student_183', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Lê Văn Thành', 'Trường THPT Nguyễn Huệ', '2007-11-28', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student184@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm', 'Văn Trí', 'student_184', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Phạm Văn Trí', 'Trường THPT Lê Quý Đôn', '2008-12-14', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student185@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoàng', 'Văn Vương', 'student_185', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Hoàng Văn Vương', 'Trường THPT Trần Phú', '2007-01-20', 'Nam', NOW(), NOW()),
  (gen_random_uuid(), 'student186@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vũ', 'Thị Bảo', 'student_186', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Vũ Thị Bảo', 'Trường THPT Lê Lợi', '2009-02-26', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student187@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đặng', 'Thị Chi', 'student_187', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Đặng Thị Chi', 'Trường THPT Nguyễn Trãi', '2008-03-30', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student188@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bùi', 'Thị Duyên', 'student_188', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Bùi Thị Duyên', 'Trường THPT Chu Văn An', '2007-04-16', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student189@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đỗ', 'Thị Hằng', 'student_189', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Đỗ Thị Hằng', 'Trường THPT Trần Đại Nghĩa', '2008-05-22', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student190@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hồ', 'Thị Huyền', 'student_190', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Hồ Thị Huyền', 'Trường THPT Gia Định', '2009-06-28', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student191@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ngô', 'Thị Kiều', 'student_191', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Ngô Thị Kiều', 'Trường THPT Bùi Thị Xuân', '2007-07-14', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student192@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dương', 'Thị Liên', 'student_192', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Dương Thị Liên', 'Trường THPT Trần Phú', '2008-08-20', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student193@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lý', 'Thị Minh', 'student_193', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Lý Thị Minh', 'Trường THPT Lê Hồng Phong', '2007-09-26', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student194@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đinh', 'Thị Nhi', 'student_194', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Đinh Thị Nhi', 'Trường THPT Nguyễn Huệ', '2009-10-10', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student195@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Huỳnh', 'Thị Phúc', 'student_195', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Huỳnh Thị Phúc', 'Trường THPT Lê Quý Đôn', '2008-11-15', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student196@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai', 'Thị Quế', 'student_196', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Mai Thị Quế', 'Trường THPT Trần Phú', '2007-12-22', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student197@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tô', 'Thị Thơ', 'student_197', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Tô Thị Thơ', 'Trường THPT Lê Lợi', '2008-01-28', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student198@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lâm', 'Thị Uyển', 'student_198', 'STUDENT', 7, 'ACTIVE', true, 'Học sinh Lâm Thị Uyển', 'Trường THPT Nguyễn Trãi', '2009-02-14', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student199@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phan', 'Thị Vân', 'student_199', 'STUDENT', 9, 'ACTIVE', true, 'Học sinh Phan Thị Vân', 'Trường THPT Chu Văn An', '2007-03-20', 'Nữ', NOW(), NOW()),
  (gen_random_uuid(), 'student200@nynus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ', 'Thị Yến', 'student_200', 'STUDENT', 8, 'ACTIVE', true, 'Học sinh Võ Thị Yến', 'Trường THPT Trần Đại Nghĩa', '2008-04-26', 'Nữ', NOW(), NOW());

-- ========================================
-- SUMMARY
-- ========================================
-- Total 100 students created (student101 - student200)
-- - 50 students in part 1 (student101-150)
-- - 50 students in part 2 (student151-200)
--
-- Combined with previous users:
-- - 3 ADMIN (Nguyễn Công Tú)
-- - 4 TEACHER (Nguyễn Công Tú x2, Phan Vũ Hoài Linh, Nguyễn Minh Hy)
-- - 100 STUDENT (random Vietnamese names)
--
-- Default password for all users: password123

