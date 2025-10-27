# LaTeX Question Parser

A powerful Python application for parsing LaTeX questions and converting them to structured CSV format. Built with Streamlit for an intuitive web interface and optimized for processing large files with 200,000+ questions.

## 🚀 Features

- **LaTeX Parsing**: Extract questions from `\begin{ex}...\end{ex}` environments
- **Multiple Question Types**: Support for MC, TF, SA, and ES question types
- **Batch Processing**: Efficient multiprocessing for large files
- **Large File Optimization**: 6-7x speedup for files with 100K+ questions
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

## 🚀 Large File Optimization (100K+ Questions)

### Overview

For ultra-large files (100K+ questions), the parser automatically uses an optimized processor that provides **6-7x speedup** compared to standard processing.

### Performance Comparison

| File Size | Standard Mode | Optimized Mode | Streaming Mode | Best Speedup |
|-----------|---------------|----------------|----------------|--------------|
| 100K questions | 30 phút | 5 phút | 4.5 phút | 6.7x |
| 200K questions | 60 phút | 10 phút | 8.5 phút | 7x |
| 300K questions | 90 phút | 15 phút | 12.5 phút | 7.2x |
| 500K questions | 150 phút | 25 phút | 21 phút | 7.1x |

### How It Works

The optimization includes:

1. **Batch-Level Parallelization**: Uses 4 workers to process batches in parallel
2. **Dynamic Batch Sizing**: Automatically calculates optimal batch size based on file size
3. **Streaming Export** (300K+ questions): Incremental CSV writing for constant memory usage
4. **Memory Efficiency**: Processes large files with minimal memory overhead (~100MB)

### Automatic Activation

The optimizer activates automatically in Streamlit UI:
- **100K-300K questions**: Large File Mode (6x speedup, ~80MB memory)
- **300K+ questions**: Streaming Mode (7.2x speedup, ~100MB memory)
- Sufficient system resources available (4+ CPU cores recommended)

### Manual Usage (Python API)

#### Standard Large File Mode (100K-300K questions)
```python
from processor.large_file_processor import process_large_file_optimized

# Process with batch parallelization + dynamic sizing
results = process_large_file_optimized(
    file_path='large_file_200k.tex',
    output_dir='output',
    batch_workers=4
)

print(f"Processed {results['total_questions']:,} questions")
print(f"Time: {results['processing_time']:.1f}s")
print(f"Speed: {results['questions_per_second']:.1f} q/s")
```

#### Streaming Mode (300K+ questions) - RECOMMENDED
```python
from processor.large_file_processor import process_large_file_streaming

# Process with streaming export for maximum efficiency
results = process_large_file_streaming(
    file_path='ultra_large_file_300k.tex',
    output_dir='output',
    batch_workers=4
)

print(f"Processed {results['total_questions']:,} questions")
print(f"Time: {results['processing_time']:.1f}s")
print(f"Speed: {results['questions_per_second']:.1f} q/s")
print(f"Memory: Constant (~100MB)")
```

### Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `batch_workers` | 4 | Number of parallel workers (2-8 recommended) |
| `enable_dynamic_batch_size` | True | Auto-calculate optimal batch size |

### Performance Tips

1. **CPU Cores**: Use 4-8 workers for best performance
2. **Memory**: Ensure at least 2GB free RAM
3. **Batch Size**: Let auto-optimization handle this (recommended)
4. **File Format**: Ensure clean LaTeX syntax for faster parsing

### Testing

Run the optimization test suite:

```bash
cd tools/parsing-question
python test_large_file_optimization.py
```

This will show:
- Optimal batch size recommendations
- Processing time estimates
- Memory usage analysis
- Performance benchmarks

For detailed technical information, see [LARGE_FILE_OPTIMIZATION.md](LARGE_FILE_OPTIMIZATION.md).

---

## 🐛 Troubleshooting

### Common Issues

1. **File Too Large**: Use Large File Optimization (automatic for 100K+ questions)
2. **Memory Error**: Reduce batch size or CPU cores
3. **Parsing Errors**: Check LaTeX syntax in error.md
4. **Missing Dependencies**: Run `pip install -r requirements.txt`
5. **Slow Processing**: For 100K+ questions, ensure optimization is activated

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
