# Exam System Design Document

## 1. Tổng quan

### Mục đích
Hệ thống quản lý toàn diện vòng đời của đề thi, từ khâu tạo đề, phân phối, thi, chấm điểm đến phân tích kết quả.

### Phạm vi
- **Đề thi sinh từ ngân hàng**: Tạo từ câu hỏi có sẵn, tự động chấm điểm
- **Đề thi gốc**: Lưu trữ và quản lý đề PDF/Image từ trường/sở/bộ
- **Chia sẻ và cộng tác**: Gửi đề cho nhóm/lớp, theo dõi tiến độ
- **Phân tích và báo cáo**: Thống kê, so sánh, xếp hạng

## 2. Kiến trúc dữ liệu

### 2.1 Bảng chính

#### `exams` - Đề thi
**Mục đích**: Lưu trữ thông tin đề thi (cả generated và official)

**Trường quan trọng**:
- `id` (UUID): Khóa chính
- `origin` (VARCHAR): Phân loại 'generated' | 'official'
- `derived_from_exam_id` (UUID): Liên kết với đề gốc nếu được convert
- `status`: 'draft' | 'published' | 'archived'
- `exam_type`: 'practice' | 'quiz' | 'midterm' | 'final' | 'custom'

**Metadata cho official exams** (nullable khi origin='generated'):
- `exam_code`, `source_type`, `institution_name`, `province`, `academic_year`, `exam_date`, `document_url`

#### `exam_questions` - Liên kết câu hỏi
**Mục đích**: Junction table giữa exams và questions

**Trường quan trọng**:
- `exam_id`, `question_id`: Foreign keys
- `order_number`: Thứ tự hiển thị
- `points`: Điểm cho câu này
- `is_bonus`: Đánh dấu câu thưởng

**Ràng buộc**:
- UNIQUE(exam_id, question_id)
- UNIQUE(exam_id, order_number)

#### `exam_attempts` - Lần làm bài
**Mục đích**: Theo dõi từng lần thi của user

**Trường quan trọng**:
- `exam_id`, `user_id`: Foreign keys
- `attempt_number`: Lần thứ mấy
- `status`: 'in_progress' | 'submitted' | 'graded' | 'cancelled'
- `score`, `percentage`, `passed`: Kết quả

#### `exam_answers` - Câu trả lời
**Mục đích**: Lưu câu trả lời của user

**Trường quan trọng**:
- `attempt_id`, `question_id`: Foreign keys
- `answer_data` (JSONB): Dữ liệu trả lời theo format chuẩn
- `is_correct`, `points_earned`: Kết quả chấm

#### `exam_results` - Kết quả tổng hợp
**Mục đích**: Thống kê chi tiết cho mỗi attempt

**Trường quan trọng**:
- `attempt_id`: Foreign key (UNIQUE)
- `total_questions`, `correct_answers`, `incorrect_answers`
- `score_breakdown` (JSONB): Phân tích theo loại câu hỏi
- `grade`: A+, A, B+, B, C, D, F

### 2.2 Bảng mở rộng

#### `exam_shares` - Chia sẻ đề thi
- Quản lý việc gửi đề cho người khác
- `share_type`: 'individual' | 'group' | 'public_link'
- Time-based access control

#### `exam_groups` - Nhóm/Lớp học
- Tổ chức users thành nhóm
- `is_public`, `require_approval` settings

#### `exam_leaderboard` - Bảng xếp hạng
- Cache kết quả tốt nhất của mỗi user
- Tự động cập nhật qua trigger

## 3. Quan hệ dữ liệu

### ERD chính
```
exams ──┬──< exam_questions >── questions
        ├──< exam_attempts ──< exam_answers
        ├──< exam_shares ──< exam_share_recipients
        └──< exam_feedback

exam_attempts ──|| exam_results
              └──|| exam_leaderboard

users ──< exam_attempts
      └──< exam_groups ──< exam_group_members
```

### Quy tắc quan hệ
- Một exam có nhiều questions (qua exam_questions)
- Một user có nhiều attempts cho mỗi exam
- Một attempt có đúng một result
- Cascade delete được áp dụng cho các quan hệ phụ thuộc

## 4. Business Rules

### 4.1 Exam Lifecycle
1. **Draft**: Đang soạn, có thể chỉnh sửa tự do
2. **Published**: Công khai, không sửa được cấu trúc
3. **Archived**: Lưu trữ, chỉ xem được

### 4.2 Scoring Rules

#### Tự động chấm điểm
- **MC (Multiple Choice)**: So khớp ID đáp án
- **TF (True/False)**: Tính % statements đúng
  - 4 statements: 1 đúng=10%, 2 đúng=25%, 3 đúng=50%, 4 đúng=100%
  - Khác 4: tính tỷ lệ đúng/tổng
- **SA (Short Answer)**: So khớp với accepted answers (có/không phân biệt chữ hoa/thường)
- **ES (Essay)**: Yêu cầu chấm thủ công

#### Tính điểm tổng
- Tổng điểm = Σ(points_earned của các câu non-bonus)
- Điểm % = (Tổng điểm / Total points) × 100
- Pass/Fail dựa trên pass_percentage của exam

### 4.3 Attempt Rules
- Giới hạn số lần thi: `max_attempts`
- Chỉ attempt cuối cùng hoặc cao nhất được tính vào leaderboard
- Thời gian làm bài không vượt quá `duration_minutes`

### 4.4 Sharing & Access Control
- **Private**: Chỉ creator
- **Shared**: Người được mời qua exam_shares
- **Group**: Members của group được chỉ định
- **Public**: Mọi người (cần cân nhắc security)

## 5. Data Formats

### 5.1 answer_data JSONB Structure
**Nguyên tắc**: Envelope pattern với `{type, data, metadata?}`

**Ví dụ formats**:
- MC: `{type: "MC", data: {selectedOptions: ["opt-1"]}}`
- TF: `{type: "TF", data: {selectedOptions: ["stmt-1", "stmt-3"]}}`
- SA: `{type: "SA", data: {textAnswer: "answer text"}}`
- ES: `{type: "ES", data: {textAnswer: "essay", attachments: []}}`

### 5.2 score_breakdown JSONB
Thống kê điểm theo loại câu hỏi:
```
{
  "MC": {total_questions: 10, correct: 8, points: 16},
  "TF": {total_questions: 3, correct: 2, points: 5},
  ...
}
```

## 6. Constraints & Validations

### 6.1 Database Constraints
- Foreign keys với CASCADE/RESTRICT phù hợp
- Check constraints cho enums (status, origin, share_type)
- Unique constraints tránh duplicate
- NOT NULL cho các trường bắt buộc

### 6.2 Business Validations
- Title: 3-500 ký tự
- Duration: 5-480 phút  
- Pass percentage: 0-100
- Points per question: 0.1-100
- Max attempts: 1-unlimited

### 6.3 Triggers cần thiết
- Auto-update `total_points` khi thêm/sửa/xóa exam_questions
- Auto-update `updated_at` timestamps
- Auto-update leaderboard sau khi graded
- Auto-update sharing statistics

## 7. Performance Considerations

### 7.1 Indexes cần thiết
- `exams(status, published_at)` cho queries published exams
- `exam_attempts(user_id, exam_id)` cho history lookup
- `exam_answers(attempt_id, is_correct)` cho scoring
- `exam_leaderboard(exam_id, rank)` cho ranking queries

### 7.2 Caching Strategy
- Cache exam details (1 hour)
- Cache questions list (30 minutes)
- Cache leaderboard (5 minutes)
- Cache statistics (10 minutes)

## 8. Security Guidelines

### 8.1 Access Control
- Row-level security dựa trên user_id
- Check exam status và sharing permissions
- Validate attempt ownership
- Rate limiting cho API endpoints

### 8.2 Data Protection
- Sanitize user input (instructions, descriptions)
- Escape SQL injection qua parameterized queries
- Hash sensitive data nếu cần
- Audit logs cho các thao tác quan trọng

## 9. Migration & Compatibility

### 9.1 Backward Compatibility
- Field `questions INT[]` giữ lại cho legacy
- Dual fields cho compatibility (type vs exam_type)
- Support cả string và number IDs cho questions

### 9.2 Future Considerations
- Versioning cho exam schema
- Soft delete thay vì hard delete
- Archive strategy cho old data
- Partition tables theo thời gian nếu cần

## 10. Quy ước & Best Practices

### 10.1 Naming Conventions
- Tables: snake_case, số nhiều
- Columns: snake_case
- Enums: UPPER_SNAKE cho values
- Constraints: chk_, fk_, uk_ prefixes

### 10.2 Development Guidelines
- Không embed business logic trong database
- Sử dụng transactions cho operations phức tạp
- Log đầy đủ cho debugging
- Test coverage cho critical paths

### 10.3 Documentation
- Comment rõ ràng cho các trường phức tạp
- Maintain ERD diagrams cập nhật
- Document API contracts riêng
- Keep changelog cho schema changes