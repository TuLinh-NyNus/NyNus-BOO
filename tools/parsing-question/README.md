# LaTeX Question Parser

A powerful Python application for parsing LaTeX questions and converting them to structured CSV format. Built with Streamlit for an intuitive web interface and optimized for processing large files with 200,000+ questions.

## 🚀 Features

- **LaTeX Parsing**: Extract questions from `\begin{ex}...\end{ex}` environments
- **Multiple Question Types**: Support for MC, TF, SA, and ES question types
- **Batch Processing**: Efficient multiprocessing for large files
- **Web Interface**: User-friendly Streamlit application
- **Data Validation**: Comprehensive validation before export
- **Error Handling**: Detailed error reporting for malformed questions
- **CSV Export**: Export to three structured CSV files

## 📋 Supported Question Types

| Type | Description | Answer Format |
|------|-------------|---------------|
| **MC** | Multiple Choice | Array of options + single correct answer |
| **TF** | True/False | Array of statements + multiple correct answers |
| **SA** | Short Answer | Single text answer |
| **ES** | Essay | No predefined answer |

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Install Dependencies

```bash
cd tools/parsing-question
pip install -r requirements.txt
```

### Required Packages

- `streamlit>=1.28.0` - Web interface
- `pandas>=2.0.0` - Data processing
- `numpy>=1.24.0` - Numerical operations

## 🚀 Quick Start

### 1. Easy Launch (Recommended)

#### **Windows - Choose Your Launcher:**

**🚀 Ultimate Launcher (Recommended):**
```
Double-click: run-parser.bat
```
- ✅ Full dependency check & auto-install
- ✅ Beautiful UI with progress indicators  
- ✅ Auto port management
- ✅ Error handling & recovery
- ✅ Dark theme optimized

**⚡ Quick Start (Fast):**
```
Double-click: quick-start.bat
```
- ✅ Minimal setup, fast startup
- ✅ Auto Streamlit install
- ✅ Perfect for daily use


```
- Tự động kiểm tra Python và dependencies
- Tự động cài đặt Streamlit nếu chưa có
- Tự động mở browser đến http://localhost:8501

#### **Windows - Full Featured:**
```
Double-click: start-streamlit.bat
```
- Launcher đầy đủ với error handling chi tiết
- Hiển thị thông tin debug và progress

#### **Desktop Shortcut:**
```
Double-click: create-desktop-shortcut.vbs
```
- Tạo shortcut trên Desktop để khởi động nhanh

### 2. Manual Start

```bash
# Method 1: Using the run script
python main.py

# Method 2: Using Streamlit directly
streamlit run run.py
```

### 2. Upload LaTeX File

- Open your web browser to `http://localhost:8501`
- Upload a `.md` file containing LaTeX questions
- Configure batch size and CPU cores
- Click "Start Processing"

### 3. Download Results

After processing, download:
- `questions.csv` - Main question data
- `question_codes.csv` - Question code lookup
- `question_tags.csv` - Question tags (empty)
- `error.md` - Error report

## 📁 Project Structure

```
tools/parsing-question/
├── parser/                 # Core parsing logic
│   ├── latex_parser.py     # Main parser class
│   ├── bracket_parser.py   # Bracket-aware parsing
│   ├── content_extractor.py # Content cleaning
│   ├── answer_extractor.py # Answer extraction
│   └── question_code_parser.py # QuestionCode parsing
├── models/                 # Data models
│   ├── question.py         # Question model
│   ├── question_code.py    # QuestionCode model
│   └── question_tag.py     # QuestionTag model
├── processor/              # Batch processing
│   ├── file_reader.py      # File streaming
│   ├── batch_processor.py  # Multiprocessing
│   └── error_handler.py    # Error logging
├── export/                 # CSV export
│   ├── csv_exporter.py     # CSV generation
│   └── data_validator.py   # Data validation
├── ui/                     # Streamlit interface
│   ├── app.py              # Main application
│   └── components/         # UI components
├── run.py                  # Entry point
├── config.py               # Configuration
└── requirements.txt        # Dependencies
```

## 📝 LaTeX Format

### Sample Question Format

```latex
%Từ ngân hàng. Câu 3528. File gốc: path/to/file.tex
\begin{ex}%[Nguồn: Thi Thử THPT Lục Ngạn 1 Bắc Giang Lần 2 2023-2024]%[200N0-0] 
[TL.103528]
    Hàm số nào sau đây nghịch biến trên $\mathbb{R}$?
    \choice
    {\True $y=\left(\dfrac{1}{3}\right)^x$}
    {$y=2^x$}
    {$y=(\sqrt{\pi})^x$}
    {$y=\mathrm{e}^x$}
    \loigiai{
        Hàm số $y=\left(\dfrac{1}{3}\right)^x$ nghịch biến trên $\mathbb{R}$ vì có $0<a=\dfrac{1}{3}<1$.
    }
\end{ex}
```

### Question Components

- **QuestionCode**: `%[200N0-0]` - Hierarchical classification
- **Source**: `%[Nguồn: ...]` - Question source information
- **Subcount**: `[TL.103528]` - Creator and sequence number
- **Content**: Question text (preserves LaTeX math)
- **Answers**: Answer options with correct answer marking
- **Solution**: `\loigiai{...}` - Detailed solution

## 📊 Output Format

### Questions CSV

| Field | Type | Description |
|-------|------|-------------|
| id | int | Sequential ID |
| rawContent | text | Original LaTeX content |
| content | text | Cleaned question content |
| subcount | string | Subcount identifier |
| type | string | Question type (MC/TF/SA/ES) |
| source | string | Question source |
| answers | json | Answer options array |
| correctAnswer | json | Correct answer(s) |
| solution | text | Solution content |
| questionCodeId | string | Foreign key to QuestionCode |

### Question Codes CSV

| Field | Type | Description |
|-------|------|-------------|
| code | string | Primary key (e.g., "200N0-0") |
| format | string | ID5 or ID6 format |
| grade | string | Grade level |
| subject | string | Subject code |
| chapter | string | Chapter number |
| lesson | string | Lesson identifier |
| level | string | Difficulty level |
| form | string | Form identifier (ID6 only) |

## ⚙️ Configuration

### Batch Processing

- **Batch Size**: 100-5000 questions per batch (default: 1000)
- **CPU Cores**: 1 to max available cores
- **Memory**: Optimized for large files

### File Limits

- **Max File Size**: 500 MB
- **Supported Formats**: .md, .tex, .txt
- **Encoding**: UTF-8

## 🔧 Advanced Usage

### Command Line Processing

```python
from parser.latex_parser import LaTeXQuestionParser
from processor.file_reader import FileReader
from export.csv_exporter import CSVExporter

# Read file
reader = FileReader("questions.md")
content = reader.read_full_content()

# Parse questions
questions, codes, errors = LaTeXQuestionParser.parse_latex_file(content)

# Export to CSV
exporter = CSVExporter("output/")
file_paths = exporter.export_all(questions, codes, [])
```

### Custom Configuration

```python
from config import Config

# Modify settings
Config.DEFAULT_BATCH_SIZE = 2000
Config.MAX_FILE_SIZE_MB = 1000
```

## 🐛 Troubleshooting

### Common Issues

1. **File Too Large**: Increase batch size or split file
2. **Memory Error**: Reduce batch size or CPU cores
3. **Parsing Errors**: Check LaTeX syntax in error.md
4. **Missing Dependencies**: Run `pip install -r requirements.txt`

### Error Reports

Check `error.md` for detailed information about:
- Malformed LaTeX questions
- Parsing failures
- Validation errors
- Processing statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the NyNus Question Bank System.

## 📞 Support

For issues and questions:
- Check the error.md file for parsing issues
- Review the troubleshooting section
- Contact the development team

---

**Built with ❤️ for the NyNus Education Platform**
