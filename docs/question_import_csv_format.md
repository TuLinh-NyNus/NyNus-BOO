# Question Import CSV Format

## 📋 **CSV Format Specification**

### **Required Headers:**
The CSV file must include these required columns:

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `content` | ✅ Yes | String | The question text | "What is the capital of France?" |
| `type` | ✅ Yes | Enum | Question type | MC, TF, SA, ES, MA |
| `difficulty` | ✅ Yes | Enum | Difficulty level | EASY, MEDIUM, HARD |
| `question_code_id` | ✅ Yes | String | Question code ID | 6M1A1E1 |

### **Optional Headers:**
| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `id` | ❌ No | String | Question ID (for upsert) | q_12345 |
| `raw_content` | ❌ No | String | Raw question content | "What is the capital of France?" |
| `subcount` | ❌ No | String | Sub-question count | "1" |
| `source` | ❌ No | String | Question source | "Geography Textbook Ch.1" |
| `answers` | ❌ No | JSON Array | Answer options | `[{"id":"A","text":"Paris"},{"id":"B","text":"London"}]` |
| `correct_answer` | ❌ No | JSON Object | Correct answer | `{"id":"A","text":"Paris"}` |
| `solution` | ❌ No | String | Solution explanation | "Paris is the capital of France" |
| `tags` | ❌ No | String | Tags (semicolon-separated) | "geography;europe;capitals" |
| `status` | ❌ No | Enum | Question status | ACTIVE, PENDING, INACTIVE, ARCHIVED |

## 🎯 **Question Types:**
- **MC** - Multiple Choice
- **TF** - True/False  
- **SA** - Short Answer
- **ES** - Essay
- **MA** - Multiple Answer

## 📊 **Difficulty Levels:**
- **EASY** - Easy questions
- **MEDIUM** - Medium difficulty
- **HARD** - Hard questions

## 🏷️ **Question Code Format:**
Question codes follow the pattern: `GSCLFL` where:
- **G** = Grade (1-9)
- **S** = Subject (M=Math, E=English, S=Science, P=Physics, etc.)
- **C** = Chapter (1-9, A-Z)
- **L** = Lesson (1-9, A-Z)
- **F** = Form (1-9, A-Z) - Optional
- **L** = Level (E=Easy, M=Medium, H=Hard)

Examples: `6M1A1E1`, `7E2B2M1`, `8S3C1H1`

## 📝 **CSV Example:**

```csv
id,content,type,difficulty,question_code_id,raw_content,source,answers,correct_answer,solution,tags,status
q_001,"What is the capital of France?",MC,EASY,6E2B1E1,"What is the capital of France?","Geography Book","[{""id"":""A"",""text"":""Paris""},{""id"":""B"",""text"":""London""},{""id"":""C"",""text"":""Berlin""},{""id"":""D"",""text"":""Madrid""}]","{""id"":""A"",""text"":""Paris""}","Paris is the capital and largest city of France.","geography;europe;capitals",ACTIVE
q_002,"The Earth is flat.",TF,EASY,8S4D1M1,"The Earth is flat.","Science Book","[{""id"":""T"",""text"":""True""},{""id"":""F"",""text"":""False""}]","{""id"":""F"",""text"":""False""}","The Earth is an oblate spheroid, not flat.","science;geography;earth",ACTIVE
q_003,"What is 2 + 2?",MC,EASY,6M1A1E1,"What is 2 + 2?","Math Book","[{""id"":""A"",""text"":""3""},{""id"":""B"",""text"":""4""},{""id"":""C"",""text"":""5""},{""id"":""D"",""text"":""6""}]","{""id"":""B"",""text"":""4""}","Basic arithmetic: 2 + 2 = 4","mathematics;arithmetic;basic",ACTIVE
```

## 🚀 **API Usage:**

### **Endpoint:**
```
POST /api/questions/import
Content-Type: application/json
```

### **Request Body:**
```json
{
  "csv_data_base64": "aWQsY29udGVudCx0eXBlLGRpZmZpY3VsdHksLi4u",
  "upsert_mode": true,
  "creator": "teacher@example.com"
}
```

### **Request Parameters:**
- **csv_data_base64** (required): Base64 encoded CSV data
- **upsert_mode** (optional): If true, update existing questions by ID
- **creator** (required): Email of the user importing questions

### **Response:**
```json
{
  "total_processed": 3,
  "created_count": 2,
  "updated_count": 1,
  "error_count": 0,
  "errors": [],
  "summary": "Import completed: 3 processed, 2 created, 1 updated, 0 errors"
}
```

## ⚠️ **Important Notes:**

### **JSON Fields:**
- **answers**: Must be valid JSON array with `id` and `text` fields
- **correct_answer**: Must be valid JSON object with `id` and `text` fields
- Escape double quotes in CSV: `""` instead of `"`

### **Tags:**
- Use semicolon (`;`) to separate multiple tags
- Example: `"geography;europe;capitals"`

### **Upsert Mode:**
- When `upsert_mode: true`, existing questions with matching IDs will be updated
- When `upsert_mode: false`, all questions will be created as new (IDs ignored)

### **Error Handling:**
- Invalid rows will be skipped with detailed error messages
- Import continues even if some rows fail
- Check the `errors` array in response for details

## 📊 **Sample CSV Files:**

### **Minimal CSV (Required fields only):**
```csv
content,type,difficulty,question_code_id
"What is the capital of France?",MC,EASY,6E2B1E1
"The Earth is flat.",TF,EASY,8S4D1M1
"What is 2 + 2?",MC,EASY,6M1A1E1
```

### **Complete CSV (All fields):**
```csv
id,raw_content,content,subcount,type,source,answers,correct_answer,solution,tags,difficulty,question_code_id,status
q_001,"What is the capital of France?","What is the capital of France?","1",MC,"Geography Book","[{""id"":""A"",""text"":""Paris""},{""id"":""B"",""text"":""London""}]","{""id"":""A"",""text"":""Paris""}","Paris is the capital of France.","geography;europe",EASY,6E2B1E1,ACTIVE
```

## 🎯 **Best Practices:**

1. **Always include required fields**: content, type, difficulty, question_code_id
2. **Use proper JSON formatting** for answers and correct_answer fields
3. **Test with small batches** before importing large datasets
4. **Use meaningful question codes** that follow the hierarchical structure
5. **Include solution explanations** for better learning experience
6. **Tag questions appropriately** for easy searching and filtering
7. **Validate CSV format** before encoding to base64

Your CSV import API is now ready for use! 🎉
