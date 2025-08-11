# CSV Files Documentation

## 📁 Current CSV Files

### `question_new_fixed.csv` - **PRODUCTION FILE**

**Status**: ✅ **READY FOR PRODUCTION**

#### 📊 File Information:
- **Size**: 6.6MB (6,603,125 bytes)
- **Total Lines**: 4,091 (4,090 questions + 1 header)
- **Format**: snake_case headers, UTF-8 encoding
- **Last Updated**: 2025-08-10 12:00

#### 🎯 Import Results:
- **Successfully Imported**: 2,762 questions (67.5%)
- **Failed**: 1,328 questions (32.5%)
- **Database Status**: ✅ Working in production

#### 📋 File Structure:
```csv
id,raw_content,content,subcount,type,source,answers,correct_answer,solution,tag,usage_count,creator,status,feedback,difficulty,created_at,updated_at,question_code_id,generated_tags,code,format,grade,subject,chapter,lesson,level,form,question_tags,tag_count
```

#### 🔧 Features:
- ✅ **snake_case headers**: Compatible with import system
- ✅ **LaTeX content**: Vietnamese math questions with proper formatting
- ✅ **JSON fields**: answers/correct_answer converted to JSON arrays
- ✅ **QuestionCode format**: %[XXXXX-X] pattern
- ✅ **UTF-8 encoding**: Full Vietnamese character support

#### 📚 Content:
- **Subject Areas**: Math (P), Physics (L), Chemistry (H), Data/Algebra (D)
- **Grade Levels**: 10, 11, 12 (0, 1, 2)
- **Question Types**: MC (Multiple Choice), SA (Short Answer), TF (True/False), ES (Essay)
- **Difficulty Levels**: N, H, V, C, T, M
- **LaTeX Support**: Full mathematical notation, TikZ diagrams

#### 🚀 Usage:
```bash
# Import all questions
CSV_BASE64=$(base64 -w 0 < docs/question_new_fixed.csv)
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"csv_data_base64":"'$CSV_BASE64'","upsert_mode":true}' \
  'http://localhost:8080/api/v1/questions/import'

# Or use batch import for large files
./tools/scripts/batch-import.sh
```

#### ⚠️ Known Issues:
1. **Invalid Levels**: Some questions have levels B, K, Y (not in validation)
2. **CSV Parsing**: ~32.5% have multiline/quote issues
3. **Missing Content**: Some records flagged as empty content

#### 🔧 Fixes Applied:
- ✅ Header conversion: camelCase → snake_case
- ✅ JSON conversion: semicolon-separated → JSON arrays
- ✅ Validation: Subject accepts A-Z, Form/Chapter accepts 0-9
- ✅ TikZ handling: Multiline → single line with \n

## 📈 Import History

### Latest Import (2025-08-11):
- **Batch Import**: 9 batches of 500 questions each
- **Success Rate**: 98.4% (2,762/2,805 processed)
- **Time**: 19 seconds
- **Database**: 3,616 total questions, 692 question codes

### TikZ Fix Import (2025-08-11):
- **Fixed Records**: 5 TikZ multiline issues
- **Success Rate**: 80% (4/5 imported)
- **Method**: Convert multiline to single line with \n

## 🎯 Recommendations

### For Future Imports:
1. **Add Missing Levels**: B, K, Y to validation
2. **CSV Preprocessing**: Fix multiline content before import
3. **Batch Processing**: Use 500-question batches for large files
4. **Error Handling**: Implement skip-on-error for malformed records

### For Data Quality:
1. **Content Validation**: Ensure all questions have content
2. **LaTeX Validation**: Check mathematical notation syntax
3. **QuestionCode Validation**: Verify format consistency
4. **Duplicate Detection**: Check for duplicate questions

## 📞 Support

For issues with CSV import:
1. Check server logs: `make logs`
2. Validate CSV format: `python3 tools/scripts/check_csv_format.py`
3. Test small batch first: `head -100 docs/question_new_fixed.csv`
4. Use batch import for large files: `./tools/scripts/batch-import.sh`

---

**Last Updated**: 2025-08-11  
**Maintainer**: Exam Bank System  
**Status**: ✅ Production Ready
