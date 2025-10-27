"""
Streamlit App for Question Management

Interactive interface for viewing and managing parsed questions.
"""

import streamlit as st
import pandas as pd
import os
import sys
from typing import List, Dict, Any
import json
from datetime import datetime

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Page config
st.set_page_config(
    page_title="LaTeX Question Parser - Dashboard",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Force set upload size limit at runtime
# Override upload size limit
try:
    import streamlit.web.server.server as server
    server.UPLOAD_FILE_SIZE_LIMIT_MB = 1024  # 1GB
except:
    pass

try:
    import streamlit.config as config
    config._set_option('server.maxUploadSize', 1024, 'manual')
    config._set_option('server.maxMessageSize', 1024, 'manual')
except:
    pass

# Multi-file processing function
def process_multiple_files(
    uploaded_files,
    output_dir="output",
    max_workers=4,
    batch_size=250,
    enable_checkpoint=True,
    enable_optimization=True,
    resume_session_id=None
):
    """
    Process multiple files concurrently.

    Args:
        uploaded_files: List of uploaded files from Streamlit
        output_dir: Output directory for results
        max_workers: Number of concurrent workers
        batch_size: Questions per batch
        enable_checkpoint: Enable checkpoint & resume
        enable_optimization: Enable performance optimization
        resume_session_id: Session ID to resume from

    Returns:
        Dictionary with processing results
    """
    import tempfile
    import time

    # Add src directory to path
    src_dir = os.path.join(current_dir, "src")
    if src_dir not in sys.path:
        sys.path.insert(0, src_dir)

    from processor.multi_file_processor import MultiFileProcessor
    from processor.error_handler import ErrorHandler
    from export.csv_exporter import CSVExporter
    from export.excel_exporter import ExcelExporter

    # Create progress containers
    st.markdown("### 🔄 Multi-File Processing")
    progress_bar = st.progress(0)
    status_text = st.empty()
    file_status_container = st.container()

    # Save uploaded files to temp directory
    temp_dir = tempfile.mkdtemp()
    file_paths = []

    status_text.text("📁 Đang lưu files...")
    for i, uploaded_file in enumerate(uploaded_files):
        temp_path = os.path.join(temp_dir, uploaded_file.name)
        with open(temp_path, 'wb') as f:
            f.write(uploaded_file.getvalue())
        file_paths.append(temp_path)
        progress_bar.progress((i + 1) / len(uploaded_files) * 10)

    # Initialize multi-file processor
    status_text.text("🚀 Đang khởi tạo multi-file processor...")
    processor = MultiFileProcessor(
        max_workers=max_workers,
        batch_size=batch_size,
        enable_checkpoint=enable_checkpoint
    )
    error_handler = ErrorHandler(output_dir)
    error_handler.clear_errors()

    # Initialize performance optimizer if enabled
    performance_optimizer = None
    if enable_optimization:
        from utils.performance_optimizer import PerformanceOptimizer
        performance_optimizer = PerformanceOptimizer(
            initial_batch_size=batch_size,
            initial_workers=max_workers
        )
        status_text.text("🚀 Performance optimization enabled")

    # Track file processing status
    file_status_dict = {}

    def progress_callback(processed, total, elapsed, file_result):
        """Callback for progress updates."""
        # Update progress bar (10% for setup, 80% for processing, 10% for export)
        progress = 10 + (processed / total * 80)
        progress_bar.progress(int(progress))

        # Update status text
        files_per_sec = processed / elapsed if elapsed > 0 else 0
        remaining = total - processed
        eta = remaining / files_per_sec if files_per_sec > 0 else 0
        eta_text = f"{eta:.0f}s" if eta < 60 else f"{eta/60:.1f}m"

        status_text.text(
            f"⚙️ Processing: {processed}/{total} files | "
            f"⚡ {files_per_sec:.2f} files/s | "
            f"⏱️ ETA: {eta_text}"
        )

        # Update file status
        file_status_dict[file_result['file_name']] = file_result

        # Display file status table
        with file_status_container:
            status_df = pd.DataFrame([
                {
                    'File': name,
                    'Status': '✅' if info['status'] == 'success' else '❌',
                    'Questions': info.get('question_count', 0),
                    'Errors': info.get('error_count', 0),
                    'Time (s)': f"{info.get('processing_time', 0):.1f}"
                }
                for name, info in file_status_dict.items()
            ])
            st.dataframe(status_df, use_container_width=True)

    # Process files
    if resume_session_id:
        status_text.text(f"🔄 Resuming from checkpoint: {resume_session_id[:8]}...")
    else:
        status_text.text("⚙️ Đang xử lý files...")

    start_time = time.time()

    results = processor.process_files(
        file_paths,
        output_dir=output_dir,
        progress_callback=progress_callback,
        resume_session_id=resume_session_id
    )

    processing_time = time.time() - start_time

    # Display session info if checkpoint enabled
    if enable_checkpoint and 'session_id' in results:
        st.info(f"📋 Session ID: {results['session_id']}")

    # Display performance metrics if optimization enabled
    if enable_optimization and performance_optimizer:
        summary = performance_optimizer.get_performance_summary()
        if summary:
            with st.expander("📊 Performance Metrics"):
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Avg CPU", f"{summary.get('avg_cpu_percent', 0):.1f}%")
                with col2:
                    st.metric("Avg Memory", f"{summary.get('avg_memory_percent', 0):.1f}%")
                with col3:
                    st.metric("Questions/s", f"{summary.get('avg_questions_per_second', 0):.1f}")
                with col4:
                    st.metric("Files/s", f"{summary.get('avg_files_per_second', 0):.2f}")

    # Update error handler with results
    for failed_file in results['failed_files']:
        error_handler.add_file_error(
            failed_file.file_path,
            failed_file.error_message or "Unknown error",
            'file_processing'
        )

    for success_file in results['successful_files']:
        error_handler.mark_file_success(success_file.file_path)

    # Export results
    status_text.text("💾 Đang export kết quả...")
    progress_bar.progress(90)

    # Aggregate all questions and question codes
    all_questions = []
    all_question_codes = []

    for file_result in results['successful_files']:
        all_questions.extend(file_result.questions)
        all_question_codes.extend(file_result.question_codes)

    # Export to CSV and Excel
    csv_exporter = CSVExporter(output_dir)
    csv_files = csv_exporter.export_all(all_questions, all_question_codes, [])

    try:
        excel_exporter = ExcelExporter(output_dir)
        excel_file = excel_exporter.export_all(all_questions, all_question_codes, [])
    except Exception as e:
        excel_file = None
        st.warning(f"⚠️ Không thể tạo Excel file: {str(e)}")

    # Save error reports
    if results['failed_files']:
        error_handler.save_failed_files_list()

    error_handler.save_processing_summary()

    # Complete
    progress_bar.progress(100)
    status_text.text("✅ Hoàn thành!")

    # Cleanup temp files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    return {
        'results': results,
        'all_questions': all_questions,
        'all_question_codes': all_question_codes,
        'csv_files': csv_files,
        'excel_file': excel_file,
        'processing_time': processing_time
    }

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .question-card {
        background-color: #ffffff;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid #e0e0e0;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-active {
        background-color: #d4edda;
        color: #155724;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: bold;
    }
    .status-pending {
        background-color: #fff3cd;
        color: #856404;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

def clean_text_display(text):
    """Clean text for better display in Streamlit (for processed content)."""
    if pd.isna(text) or text is None:
        return "N/A"

    text = str(text)

    # Handle JSON strings (for answers field)
    import json
    import re

    # Try to parse as JSON and format nicely (for non-answers fields)
    if text.startswith('[') and text.endswith(']'):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                formatted_items = []
                for i, item in enumerate(parsed):
                    if isinstance(item, dict):
                        content = item.get('content', '')
                        # Don't add ✓ mark here - this is handled by format_answers_display for answers
                        formatted_items.append(f"{i+1}. {content}")
                    else:
                        formatted_items.append(f"{i+1}. {item}")
                text = '\n'.join(formatted_items)
        except:
            pass  # If not valid JSON, continue with text cleaning

    # Decode Unicode escape sequences safely
    import codecs
    try:
        # Only decode if it contains unicode escapes
        if '\\u' in text:
            text = codecs.decode(text, 'unicode_escape')
    except:
        pass  # If decoding fails, continue with original text

    # Handle common LaTeX/encoding issues
    replacements = {
        '\\n': '\n',
        '\\t': '    ',  # Convert tabs to spaces
        '\\\\': '\n',   # LaTeX line breaks
        '\\lq\\lq': '"',
        '\\rq\\rq': '"',
        '\\lq': "'",
        '\\rq': "'",
        '\\$': '$',
        '\\{': '{',
        '\\}': '}',
        '\\&': '&',
        '\\%': '%',
        '\\#': '#',
        '\\_': '_',
        '\\^': '^',
        '\\~': '~',
        '\\textbf{': '**',
        '\\textit{': '*',
        '\\emph{': '*',
        '\\begin{itemize}': '\n',
        '\\end{itemize}': '\n',
        '\\item': '• ',
        '\\begin{enumerate}': '\n',
        '\\end{enumerate}': '\n',
        '\\begin{itemchoice}': '\n',
        '\\end{itemchoice}': '\n',
        '\\itemch': '• ',
        '\\True': '✓ ',
        '\\False': '✗ ',
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Clean up some LaTeX commands but preserve math
    # Keep math expressions like \dfrac, \frac, \sqrt, etc.
    math_commands = ['dfrac', 'frac', 'sqrt', 'infty', 'sum', 'int', 'lim', 'sin', 'cos', 'tan', 'log', 'ln']

    # Don't remove math commands - they should be preserved
    # Only remove some formatting commands
    formatting_commands = ['textbf', 'textit', 'emph']
    for cmd in formatting_commands:
        text = re.sub(rf'\\{cmd}\{{([^}}]*)\}}', r'\1', text)  # Remove formatting but keep content

    # Clean up multiple spaces only (preserve newlines)
    text = re.sub(r' +', ' ', text)  # Multiple spaces to single
    text = re.sub(r'\t+', '    ', text)  # Multiple tabs to spaces

    return text.strip()

def format_answers_display(text):
    """Format answers for display - already in semicolon-separated text format."""
    if pd.isna(text) or text is None:
        return "N/A"

    text = str(text)

    # If it's still JSON format (backward compatibility), parse it
    if text.startswith('[') and text.endswith(']'):
        try:
            import json
            parsed = json.loads(text)
            if isinstance(parsed, list):
                formatted_items = []
                for item in parsed:
                    if isinstance(item, dict):
                        content = item.get('content', '')
                        # Decode Unicode escape sequences
                        import codecs
                        try:
                            if '\\u' in content:
                                content = codecs.decode(content, 'unicode_escape')
                        except:
                            pass
                        formatted_items.append(content)
                    else:
                        formatted_items.append(str(item))
                return '; '.join(formatted_items)
        except:
            pass  # If not valid JSON, continue with text cleaning

    # For new text format, just return as is (already semicolon-separated)
    # Convert double backslashes back to single for display
    text = text.replace('\\\\', '\\')

    return text.strip()

def clean_raw_content_display(text):
    """
    DEPRECATED: Use TextCleaner.prepare_for_display() instead.

    Clean raw content and solution for display - preserve LaTeX commands.
    This function is kept for backward compatibility but should be replaced.
    """
    # Import here to avoid circular imports
    import sys
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)

    try:
        from src.utils.text_cleaner import TextCleaner
        return TextCleaner.prepare_for_display(text)
    except ImportError:
        # Fallback to old logic if import fails
        if pd.isna(text) or text is None:
            return "N/A"

        text = str(text)

        # Only basic cleaning for raw content - preserve all LaTeX commands
        # Decode Unicode escape sequences safely
        import codecs
        import re
        try:
            if '\\u' in text:
                text = codecs.decode(text, 'unicode_escape')
        except:
            pass

        # Only handle basic escape sequences, preserve LaTeX commands
        basic_replacements = {
            '\\n': '\n',
            '\\t': '    ',
            '\\\\': '\n',   # LaTeX line breaks to newlines
        }

        for old, new in basic_replacements.items():
            text = text.replace(old, new)

        # Clean up multiple spaces only (preserve newlines)
        text = re.sub(r' +', ' ', text)  # Multiple spaces to single

        return text.strip()

def load_data():
    """Load data from CSV files."""
    try:
        # Load questions
        questions_path = "output/questions.csv"
        if os.path.exists(questions_path):
            questions_df = pd.read_csv(questions_path, encoding='utf-8')
        else:
            # Return empty DataFrames instead of None to allow dashboard to work
            questions_df = pd.DataFrame()

        # Load question codes
        codes_path = "output/question_codes.csv"
        if os.path.exists(codes_path):
            codes_df = pd.read_csv(codes_path)
        else:
            codes_df = pd.DataFrame()

        # Load question tags
        tags_path = "output/question_tags.csv"
        if os.path.exists(tags_path):
            tags_df = pd.read_csv(tags_path)
        else:
            tags_df = pd.DataFrame()

        return questions_df, codes_df, tags_df
    
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None, None, None

def create_filters(questions_df, codes_df):
    """Create filter sidebar."""
    st.sidebar.header("🔍 Filters")
    
    filters = {}
    
    # Question Type filter
    if 'type' in questions_df.columns:
        types = ['All'] + sorted(questions_df['type'].dropna().unique().tolist())
        filters['type'] = st.sidebar.selectbox("Question Type", types)
    
    # Status filter
    if 'status' in questions_df.columns:
        statuses = ['All'] + sorted(questions_df['status'].dropna().unique().tolist())
        filters['status'] = st.sidebar.selectbox("Status", statuses)
    
    # Difficulty filter
    if 'difficulty' in questions_df.columns:
        difficulties = ['All'] + sorted(questions_df['difficulty'].dropna().unique().tolist())
        filters['difficulty'] = st.sidebar.selectbox("Difficulty", difficulties)
    
    # Creator filter
    if 'creator' in questions_df.columns:
        creators = ['All'] + sorted(questions_df['creator'].dropna().unique().tolist())
        filters['creator'] = st.sidebar.selectbox("Creator", creators)
    
    # QuestionCode filters (if codes available)
    if not codes_df.empty:
        st.sidebar.subheader("📋 Question Code Filters")
        
        # Grade filter
        if 'grade' in codes_df.columns:
            grades = ['All'] + sorted(codes_df['grade'].dropna().unique().tolist())
            filters['grade'] = st.sidebar.selectbox("Grade", grades)
        
        # Subject filter
        if 'subject' in codes_df.columns:
            subjects = ['All'] + sorted(codes_df['subject'].dropna().unique().tolist())
            filters['subject'] = st.sidebar.selectbox("Subject", subjects)
        
        # Level filter
        if 'level' in codes_df.columns:
            levels = ['All'] + sorted(codes_df['level'].dropna().unique().tolist())
            filters['level'] = st.sidebar.selectbox("Level", levels)
        
        # Chapter filter
        if 'chapter' in codes_df.columns:
            chapters = ['All'] + sorted(codes_df['chapter'].dropna().unique().tolist())
            filters['chapter'] = st.sidebar.selectbox("Chapter", chapters)
    
    # Search
    st.sidebar.subheader("🔎 Search")
    filters['search'] = st.sidebar.text_input("Search in content", "")
    
    # Advanced filters
    with st.sidebar.expander("⚙️ Advanced Filters"):
        # Has solution filter
        filters['has_solution'] = st.selectbox("Has Solution", ['All', 'Yes', 'No'])
        
        # Usage count range
        if 'usageCount' in questions_df.columns:
            max_usage = int(questions_df['usageCount'].max()) if questions_df['usageCount'].max() > 0 else 100
            filters['usage_range'] = st.slider("Usage Count Range", 0, max_usage, (0, max_usage))
        
        # Feedback range
        if 'feedback' in questions_df.columns:
            max_feedback = int(questions_df['feedback'].max()) if questions_df['feedback'].max() > 0 else 10
            filters['feedback_range'] = st.slider("Feedback Range", 0, max_feedback, (0, max_feedback))
    
    return filters

def apply_filters(questions_df, codes_df, filters):
    """Apply filters to the dataframe."""
    filtered_df = questions_df.copy()
    
    # Apply question filters
    if filters.get('type') and filters['type'] != 'All':
        filtered_df = filtered_df[filtered_df['type'] == filters['type']]
    
    if filters.get('status') and filters['status'] != 'All':
        filtered_df = filtered_df[filtered_df['status'] == filters['status']]
    
    if filters.get('difficulty') and filters['difficulty'] != 'All':
        filtered_df = filtered_df[filtered_df['difficulty'] == filters['difficulty']]
    
    if filters.get('creator') and filters['creator'] != 'All':
        filtered_df = filtered_df[filtered_df['creator'] == filters['creator']]
    
    # Apply QuestionCode filters
    if not codes_df.empty and 'questionCodeId' in filtered_df.columns:
        code_filters = {}
        
        if filters.get('grade') and filters['grade'] != 'All':
            code_filters['grade'] = filters['grade']
        
        if filters.get('subject') and filters['subject'] != 'All':
            code_filters['subject'] = filters['subject']
        
        if filters.get('level') and filters['level'] != 'All':
            code_filters['level'] = filters['level']
        
        if filters.get('chapter') and filters['chapter'] != 'All':
            code_filters['chapter'] = filters['chapter']
        
        if code_filters:
            # Filter codes first
            filtered_codes = codes_df.copy()
            for field, value in code_filters.items():
                filtered_codes = filtered_codes[filtered_codes[field] == value]
            
            # Get matching question IDs
            valid_code_ids = filtered_codes['code'].tolist()
            filtered_df = filtered_df[filtered_df['questionCodeId'].isin(valid_code_ids)]
    
    # Apply search filter
    if filters.get('search'):
        search_term = filters['search'].lower()
        mask = (
            filtered_df['content'].str.lower().str.contains(search_term, na=False) |
            filtered_df['solution'].str.lower().str.contains(search_term, na=False)
        )
        filtered_df = filtered_df[mask]
    
    # Apply advanced filters
    if filters.get('has_solution') and filters['has_solution'] != 'All':
        if filters['has_solution'] == 'Yes':
            filtered_df = filtered_df[filtered_df['solution'].notna() & (filtered_df['solution'] != '')]
        else:
            filtered_df = filtered_df[filtered_df['solution'].isna() | (filtered_df['solution'] == '')]
    
    if filters.get('usage_range'):
        min_usage, max_usage = filters['usage_range']
        filtered_df = filtered_df[
            (filtered_df['usageCount'] >= min_usage) & 
            (filtered_df['usageCount'] <= max_usage)
        ]
    
    if filters.get('feedback_range'):
        min_feedback, max_feedback = filters['feedback_range']
        filtered_df = filtered_df[
            (filtered_df['feedback'] >= min_feedback) & 
            (filtered_df['feedback'] <= max_feedback)
        ]
    
    return filtered_df

def display_statistics(questions_df, filtered_df):
    """Display statistics dashboard."""
    st.subheader("📊 Statistics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Questions", len(questions_df))
    
    with col2:
        st.metric("Filtered Questions", len(filtered_df))
    
    with col3:
        active_count = len(filtered_df[filtered_df['status'] == 'ACTIVE']) if 'status' in filtered_df.columns else 0
        st.metric("Active Questions", active_count)
    
    with col4:
        pending_count = len(filtered_df[filtered_df['status'] == 'PENDING']) if 'status' in filtered_df.columns else 0
        st.metric("Pending Questions", pending_count)
    
    # Charts
    if len(filtered_df) > 0:
        col1, col2 = st.columns(2)
        
        with col1:
            if 'type' in filtered_df.columns:
                type_counts = filtered_df['type'].value_counts()
                st.bar_chart(type_counts)
                st.caption("Questions by Type")
        
        with col2:
            if 'status' in filtered_df.columns:
                status_counts = filtered_df['status'].value_counts()
                st.bar_chart(status_counts)
                st.caption("Questions by Status")

def process_uploaded_file(uploaded_file):
    """Process uploaded LaTeX file and return parsed data."""
    if uploaded_file is None:
        return None, None, None

    try:
        # Save uploaded file temporarily
        import tempfile
        import os

        # Check file size first
        file_content = uploaded_file.getvalue()
        file_size_mb = len(file_content) / (1024 * 1024)

        if file_size_mb > 1024:  # 1GB limit
            st.error(f"❌ File quá lớn: {file_size_mb:.2f}MB. Giới hạn: 1024MB")
            return None, None, None

        with tempfile.NamedTemporaryFile(delete=False, suffix='.tex') as tmp_file:
            tmp_file.write(file_content)
            tmp_file_path = tmp_file.name

        # Import parser modules
        import sys
        import os

        # Add src directory to path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        src_dir = os.path.join(current_dir, 'src')
        if src_dir not in sys.path:
            sys.path.insert(0, src_dir)

        from processor.file_reader import FileReader
        from processor.batch_processor import BatchProcessor
        from processor.error_handler import ErrorHandler
        from export.data_validator import DataValidator

        # Create progress bar and status
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        # Step 1: Initialize modules
        status_text.text("🔄 Đang khởi tạo modules...")
        progress_bar.progress(10)
        
        # Initialize components
        error_handler = ErrorHandler()
        # Clear any previous errors for fresh processing
        error_handler.clear_errors()

        # Step 2: Read and analyze file
        status_text.text("📖 Đang đọc và phân tích file...")
        progress_bar.progress(20)
        
        # Read file and create batches
        file_reader = FileReader(tmp_file_path)

        # Count questions first
        total_questions = file_reader.count_questions()
        if total_questions == 0:
            st.error("❌ Không tìm thấy câu hỏi nào trong file")
            os.unlink(tmp_file_path)
            return None, None, None

        st.info(f"📊 Tìm thấy {total_questions:,} câu hỏi")

        # Step 3: Determine processing mode based on file size
        use_large_file_optimization = total_questions >= 100000  # Use optimization for 100K+ questions
        use_streaming_mode = total_questions >= 300000  # Use streaming for 300K+ questions

        if use_large_file_optimization:
            # Import LargeFileProcessor
            from processor.large_file_processor import LargeFileProcessor

            # Determine mode
            if use_streaming_mode:
                st.info(f"🚀 Ultra-Large File Detected ({total_questions:,} questions) - Using Streaming Processor")
                st.info("💾 Streaming Mode: Constant memory usage (~100MB), 7x speedup")
            else:
                st.info(f"🚀 Large File Detected ({total_questions:,} questions) - Using Optimized Processor")

            # Initialize processor with 4 workers for large files
            processor = LargeFileProcessor(batch_workers=4, enable_dynamic_batch_size=True)

            # Calculate optimal batch size
            batch_size = processor.calculate_optimal_batch_size(total_questions)
            st.info(f"📦 Optimal batch size: {batch_size} | Workers: 4")

            # Progress tracking
            import time
            start_time = time.time()

            def large_file_progress_callback(processed, total, elapsed, stats):
                """Progress callback for large file processing."""
                # Calculate progress percentage
                progress_pct = (processed / total * 100) if total > 0 else 0
                progress_bar.progress(int(30 + progress_pct * 0.5))  # 30% to 80%

                # Update status
                status_text.text(
                    f"⚙️ Batch {stats['processed_batches']}/{stats['total_batches']} | "
                    f"📊 {processed:,}/{total:,} câu hỏi | "
                    f"⚡ {stats['questions_per_second']:.1f} q/s | "
                    f"⏱️ ETA: {stats['eta_seconds']:.0f}s"
                )

            # Process with appropriate mode
            if use_streaming_mode:
                status_text.text("⚙️ Đang xử lý với Streaming Processor (7x faster)...")
            else:
                status_text.text("⚙️ Đang xử lý với Large File Optimizer (6x faster)...")

            progress_bar.progress(30)

            # Create output directory
            output_dir = "output"
            os.makedirs(output_dir, exist_ok=True)

            try:
                if use_streaming_mode:
                    # Use streaming mode for ultra-large files (300K+)
                    results = processor.process_large_file_streaming(
                        tmp_file_path,
                        output_dir=output_dir,
                        progress_callback=large_file_progress_callback
                    )

                    # For streaming mode, data is already exported to CSV
                    # Load from CSV for display
                    import pandas as pd
                    questions_df = pd.read_csv(results['output_files']['questions'])
                    codes_df = pd.read_csv(results['output_files']['codes'])

                    # Convert to objects for compatibility
                    questions = []  # Empty list, data already in CSV
                    question_codes = []  # Empty list, data already in CSV
                    errors = results['errors']

                    st.success(
                        f"✅ Streaming Mode: Processed {results['total_questions']:,} questions in {results['processing_time']:.1f}s "
                        f"({results['questions_per_second']:.1f} q/s) | Memory: ~100MB"
                    )

                    # Skip validation and export steps (already done)
                    # Jump to display results
                    st.info("💾 Data already exported to CSV files (streaming mode)")

                    # Display summary
                    st.write("### 📊 Processing Summary")
                    st.write(f"- Total questions: {results['total_questions']:,}")
                    st.write(f"- Processing time: {results['processing_time']:.1f}s")
                    st.write(f"- Speed: {results['questions_per_second']:.1f} q/s")
                    st.write(f"- Batch size: {results['batch_size']}")
                    st.write(f"- Workers: {results['batch_workers']}")

                    # Cleanup and return early
                    os.unlink(tmp_file_path)
                    return questions, question_codes, []

                else:
                    # Use standard large file mode (100K-300K)
                    results = processor.process_large_file(
                        tmp_file_path,
                        output_dir=output_dir,
                        progress_callback=large_file_progress_callback
                    )

                    questions = results['questions']
                    question_codes = results['question_codes']
                    errors = results['errors']

                    # Show performance stats
                    st.success(
                        f"✅ Processed {results['total_questions']:,} questions in {results['processing_time']:.1f}s "
                        f"({results['questions_per_second']:.1f} q/s)"
                    )

            except Exception as e:
                st.error(f"❌ Error during processing: {str(e)}")
                import traceback
                st.error(traceback.format_exc())
                os.unlink(tmp_file_path)
                return None, None, None

        else:
            # Standard processing for smaller files
            status_text.text("📦 Đang chia nhỏ thành batches...")
            progress_bar.progress(30)

            # Create batches - Use optimal batch size based on performance analysis
            optimal_batch_size = 250  # BEST PERFORMANCE: 73.4 q/s (+97% improvement)
            batch_size = min(optimal_batch_size, total_questions)
            batches = file_reader.split_into_batches(batch_size)

            # Step 4: Process batches
            status_text.text(f"⚙️ Đang xử lý {len(batches)} batches...")
            progress_bar.progress(40)

            # Create progress callback for batch processing
            import time
            start_time = time.time()
            processed_questions = 0

            def progress_callback(current_batch, total_batches, batch_questions):
                nonlocal processed_questions, start_time
                processed_questions += batch_questions

                # Calculate progress percentage
                batch_progress = (current_batch / total_batches) * 40  # 40% for batch processing (40% to 80%)
                total_progress = 40 + batch_progress
                progress_bar.progress(int(total_progress))

                # Calculate processing speed
                elapsed_time = time.time() - start_time
                questions_per_second = processed_questions / elapsed_time if elapsed_time > 0 else 0

                # Estimate remaining time
                remaining_questions = total_questions - processed_questions
                eta_seconds = remaining_questions / questions_per_second if questions_per_second > 0 else 0
                eta_text = f"{eta_seconds:.0f}s" if eta_seconds < 60 else f"{eta_seconds/60:.1f}m"

                # Update status with detailed info
                status_text.text(
                    f"⚙️ Batch {current_batch}/{total_batches} | "
                    f"📊 {int(processed_questions):,}/{total_questions:,} câu hỏi | "
                    f"⚡ {questions_per_second:.1f} q/s | "
                    f"⏱️ ETA: {eta_text}"
                )

            # Process with BatchProcessor - Use single-threaded mode for Streamlit compatibility
            batch_processor = BatchProcessor(max_workers=1)  # Force single-threaded to avoid ScriptRunContext issues

            # Display performance info
            worker_count = batch_processor.max_workers
            st.info(f"🚀 Standard Mode: Using {worker_count} worker, batch size {batch_size}")
            questions, question_codes, errors = batch_processor.process_batches(
                batches,
                progress_callback
            )

        # Step 5: Validate data
        status_text.text("✅ Đang validate dữ liệu...")
        progress_bar.progress(80)
        
        validator = DataValidator()
        validation_results = validator.validate_all_data(questions, question_codes, [])

        # Step 6: Create output files
        status_text.text("💾 Đang tạo output files...")
        progress_bar.progress(90)

        # Create output directory if not exists
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)

        # Export to CSV
        from export.csv_exporter import CSVExporter
        csv_exporter = CSVExporter(output_dir)
        csv_files = csv_exporter.export_all(
            validation_results['valid_questions'],
            validation_results['valid_question_codes'],
            []
        )

        # Export to Excel
        try:
            from export.excel_exporter import ExcelExporter
            excel_exporter = ExcelExporter(output_dir)
            excel_file = excel_exporter.export_all(
                validation_results['valid_questions'],
                validation_results['valid_question_codes'],
                []
            )
            st.success(f"✅ Đã tạo Excel file: {excel_file}")
        except Exception as excel_error:
            st.warning(f"⚠️ Không thể tạo Excel file: {str(excel_error)}")

        # Create error report
        error_file = None
        if errors:
            error_file = os.path.join(output_dir, "error.md")
            with open(error_file, 'w', encoding='utf-8') as f:
                f.write("# Error Report\n\n")
                for i, error in enumerate(errors, 1):
                    f.write(f"## Error {i}\n{error}\n\n")
            st.info(f"📋 Đã tạo error report: {error_file}")
        else:
            st.info("📋 Không có lỗi nào được tìm thấy")

        # Create summary
        summary_file = os.path.join(output_dir, "export_summary.md")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("# Export Summary\n\n")
            f.write(f"- **Total Questions**: {len(questions)}\n")
            f.write(f"- **Valid Questions**: {len(validation_results['valid_questions'])}\n")
            f.write(f"- **Question Codes**: {len(validation_results['valid_question_codes'])}\n")
            f.write(f"- **Errors**: {len(errors)}\n")
            f.write(f"- **Validation Errors**: {len(validation_results.get('validation_errors', []))}\n")

        # Step 7: Complete
        status_text.text("🎉 Hoàn thành xử lý!")
        progress_bar.progress(100)
        
        st.success("✅ Đã tạo tất cả output files!")

        # Clean up temp file
        os.unlink(tmp_file_path)

        # Clear progress indicators after a short delay
        import time
        time.sleep(1)
        progress_bar.empty()
        status_text.empty()

        return validation_results['valid_questions'], validation_results['valid_question_codes'], []

    except Exception as e:
        st.error(f"Lỗi xử lý file: {str(e)}")
        return None, None, None

def process_local_file(file_path: str):
    """Process a local file directly without upload."""
    try:
        if not os.path.exists(file_path):
            st.error(f"❌ File không tồn tại: {file_path}")
            return None, None, None

        # Create progress bar and status
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        # Step 1: Initialize modules
        status_text.text("🔄 Đang khởi tạo modules...")
        progress_bar.progress(10)
        
        # Import parser modules
        import sys
        current_dir = os.path.dirname(os.path.abspath(__file__))
        src_dir = os.path.join(current_dir, 'src')
        if src_dir not in sys.path:
            sys.path.insert(0, src_dir)

        from processor.file_reader import FileReader
        from processor.batch_processor import BatchProcessor
        from processor.error_handler import ErrorHandler
        from export.data_validator import DataValidator

        # Step 2: Initialize error handler
        status_text.text("🔧 Đang khởi tạo error handler...")
        progress_bar.progress(20)
        
        error_handler = ErrorHandler()
        error_handler.clear_errors()

        # Step 3: Read and analyze file
        status_text.text("📖 Đang đọc và phân tích file...")
        progress_bar.progress(30)
        
        file_reader = FileReader(file_path)
        total_questions = file_reader.count_questions()
        st.info(f"📊 Tìm thấy {total_questions} câu hỏi")

        # Step 4: Split into batches
        status_text.text("📦 Đang chia nhỏ thành batches...")
        progress_bar.progress(40)
        
        batches = file_reader.split_into_batches(250)  # Optimal batch size for performance
        
        # Step 5: Process batches
        status_text.text(f"⚙️ Đang xử lý {len(batches)} batches...")
        progress_bar.progress(50)
        
        # Create progress callback for batch processing
        import time
        start_time = time.time()
        processed_questions = 0
        
        def progress_callback(current_batch, total_batches, batch_questions):
            nonlocal processed_questions, start_time
            processed_questions += batch_questions
            
            # Calculate progress percentage
            batch_progress = (current_batch / total_batches) * 30  # 30% for batch processing (50% to 80%)
            total_progress = 50 + batch_progress
            progress_bar.progress(int(total_progress))
            
            # Calculate processing speed
            elapsed_time = time.time() - start_time
            questions_per_second = processed_questions / elapsed_time if elapsed_time > 0 else 0
            
            # Estimate remaining time
            remaining_questions = total_questions - processed_questions
            eta_seconds = remaining_questions / questions_per_second if questions_per_second > 0 else 0
            eta_text = f"{eta_seconds:.0f}s" if eta_seconds < 60 else f"{eta_seconds/60:.1f}m"
            
            # Update status with detailed info
            status_text.text(
                f"⚙️ Batch {current_batch}/{total_batches} | "
                f"📊 {int(processed_questions):,}/{total_questions:,} câu hỏi | "
                f"⚡ {questions_per_second:.1f} q/s | "
                f"⏱️ ETA: {eta_text}"
            )
        
        batch_processor = BatchProcessor()  # Auto-select optimal worker count
        questions, question_codes, errors = batch_processor.process_batches(batches, progress_callback)
        
        # Step 6: Validate data
        status_text.text("✅ Đang validate dữ liệu...")
        progress_bar.progress(80)
        
        validator = DataValidator()
        validation_results = validator.validate_all_data(questions, question_codes, [])

        valid_questions = validation_results['valid_questions']
        valid_codes = validation_results['valid_question_codes']
        
        # Step 7: Complete
        status_text.text("🎉 Hoàn thành xử lý!")
        progress_bar.progress(100)
        
        # Clear progress indicators after a short delay
        import time
        time.sleep(1)
        progress_bar.empty()
        status_text.empty()

        return valid_questions, valid_codes, []

    except Exception as e:
        st.error(f"❌ Lỗi xử lý file local: {str(e)}")
        return None, None, None

def show_welcome_screen():
    """Show welcome screen when no data is available."""

    # Welcome content
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown("""
        <div style="text-align: center; padding: 2rem;">
            <h2>🎉 Chào mừng đến với LaTeX Question Parser!</h2>
            <p style="font-size: 1.2rem; color: #666;">
                Hệ thống trích xuất và quản lý câu hỏi từ file LaTeX
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")

        # Features overview
        st.markdown("### 🚀 Tính năng chính:")

        features = [
            "📝 **Trích xuất câu hỏi** từ file LaTeX (.tex, .md)",
            "🏷️ **Tự động tạo tags** dựa trên QuestionCode",
            "📊 **Dashboard thống kê** chi tiết",
            "💾 **Export CSV/Excel** để sử dụng",
            "🔍 **Tìm kiếm và lọc** câu hỏi",
            "⚡ **Xử lý file lớn** lên đến 1GB"
        ]

        for feature in features:
            st.markdown(f"- {feature}")

        st.markdown("---")

        # Getting started
        st.markdown("### 🎯 Bắt đầu:")

        st.info("""
        **Cách 1: Upload File**
        1. Chọn "🔄 Upload File" ở sidebar
        2. Upload file .tex hoặc .md
        3. Đợi hệ thống xử lý

        **Cách 2: File Local**
        1. Chọn "📁 Chọn File Local" ở sidebar
        2. Chọn file từ dropdown
        3. Xử lý trực tiếp
        """)

        # Sample data info
        if os.path.exists("tests/12.OTMN-Lop12-so1-16-24-25.tex"):
            st.success("✅ **File mẫu có sẵn**: `tests/12.OTMN-Lop12-so1-16-24-25.tex` (5,790 câu hỏi)")

        # Statistics
        st.markdown("### 📈 Thống kê hệ thống:")

        col_a, col_b, col_c = st.columns(3)

        with col_a:
            st.metric("Supported Formats", "2", help=".tex, .md files")

        with col_b:
            st.metric("Max File Size", "1GB", help="1024MB upload limit")

        with col_c:
            st.metric("Question Types", "4", help="MC, TF, SA, ES")

        st.markdown("---")

        # Quick actions
        st.markdown("### ⚡ Quick Actions:")

        col_x, col_y = st.columns(2)

        with col_x:
            if st.button("🚀 Xử lý File Mẫu", help="Xử lý file mẫu có sẵn"):
                if os.path.exists("tests/12.OTMN-Lop12-so1-16-24-25.tex"):
                    st.info("🔄 Đang xử lý file mẫu... (có thể mất vài phút)")
                    st.rerun()
                else:
                    st.error("❌ File mẫu không tồn tại")

        with col_y:
            if st.button("📖 Xem Hướng Dẫn", help="Xem hướng dẫn sử dụng"):
                st.info("💡 Hướng dẫn: Sử dụng sidebar để upload file hoặc chọn file local")

def clear_cache_and_session():
    """Clear all cache and session state for fresh processing."""
    # NOTE: Removed st.cache_data.clear() as it causes Streamlit rerun and interrupts logic flow
    # st.cache_data.clear()

    # Clear session state related to previous processing
    keys_to_clear = [
        'last_processed_file',
        'processing_results',
        'error_questions',
        'pending_questions',
        'file_hash',
        'processing_complete',
        'processing_stats',
        'error_content',
        'error_content_hash',
        'filtered_data',
        'current_filters'
    ]

    for key in keys_to_clear:
        if key in st.session_state:
            del st.session_state[key]

    # NOTE: Removed st.rerun() as it causes uploaded_file to be reset
    # st.rerun()

def get_file_hash(file_content):
    """Generate hash for file content to detect changes."""
    import hashlib
    return hashlib.md5(file_content).hexdigest()

def main():
    """Main Streamlit app."""

    # Header
    st.markdown('<h1 class="main-header">📚 LaTeX Question Parser Dashboard</h1>', unsafe_allow_html=True)

    # File upload section
    st.sidebar.header("📁 Upload File")
    st.sidebar.info("💡 **Giới hạn upload**: 1GB (1024MB)")

    # Upload method selection
    upload_method = st.sidebar.radio(
        "Chọn phương thức upload:",
        ["🔄 Upload File", "📁 Chọn File Local"],
        help="Upload File: Upload từ máy tính. File Local: Chọn file đã có trong thư mục."
    )

    uploaded_file = None
    local_file_path = None

    if upload_method == "🔄 Upload File":
        # Multi-file upload support
        uploaded_files = st.sidebar.file_uploader(
            "Chọn file(s) LaTeX để trích xuất",
            type=['tex', 'md'],
            help="Upload một hoặc nhiều file .tex hoặc .md để trích xuất câu hỏi. Hỗ trợ file lên đến 1GB.",
            key="file_uploader_main",
            accept_multiple_files=True
        )

        # Check if files are uploaded
        if uploaded_files is not None and len(uploaded_files) > 0:
            # For single file, maintain backward compatibility
            if len(uploaded_files) == 1:
                uploaded_file = uploaded_files[0]
                file_content = uploaded_file.getvalue()
                current_file_hash = get_file_hash(file_content)

                # Calculate file info
                file_size_mb = len(file_content) / (1024 * 1024)

                # Always clear cache and session for fresh processing when file is uploaded
                clear_cache_and_session()
                st.session_state['file_hash'] = current_file_hash
                st.session_state['last_processed_file'] = uploaded_file.name

                # Show file info - auto-processing will start automatically
                st.sidebar.success(f"✅ File uploaded: {uploaded_file.name}")
                st.sidebar.info(f"📊 File size: {file_size_mb:.2f} MB")
            else:
                # Multi-file mode
                st.session_state['multi_file_mode'] = True
                st.session_state['uploaded_files'] = uploaded_files

                total_size = sum(len(f.getvalue()) for f in uploaded_files) / (1024 * 1024)
                st.sidebar.success(f"✅ {len(uploaded_files)} files uploaded")
                st.sidebar.info(f"📊 Total size: {total_size:.2f} MB")
    else:
        # Local file selection
        st.sidebar.markdown("**📁 File Local Available:**")

        # Look for .tex files in current directory and subdirectories
        available_files = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.endswith(('.tex', '.md')):
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
                    available_files.append((file_path, file_size))

        if available_files:
            file_options = [f"{path} ({size:.1f}MB)" for path, size in available_files]
            selected_file = st.sidebar.selectbox(
                "Chọn file:",
                ["-- Chọn file --"] + file_options
            )

            if selected_file != "-- Chọn file --":
                # Extract file path from selection
                local_file_path = selected_file.split(" (")[0]

                # Always set the file for processing (simplified logic)
                st.session_state['last_processed_file'] = local_file_path
                st.sidebar.success(f"✅ Đã chọn: {os.path.basename(local_file_path)}")
        else:
            st.sidebar.warning("⚠️ Không tìm thấy file .tex hoặc .md nào")

    # Check for multi-file mode
    if st.session_state.get('multi_file_mode', False) and st.session_state.get('uploaded_files'):
        uploaded_files_list = st.session_state['uploaded_files']

        st.markdown("## 📁 Multi-File Processing Mode")
        st.info(f"🔄 Processing {len(uploaded_files_list)} files concurrently")

        # Advanced options
        with st.expander("⚙️ Advanced Options", expanded=False):
            col1, col2 = st.columns(2)

            with col1:
                enable_checkpoint = st.checkbox(
                    "📂 Enable Checkpoint & Resume",
                    value=True,
                    help="Save progress and resume from interruptions"
                )

                enable_optimization = st.checkbox(
                    "🚀 Enable Performance Optimization",
                    value=True,
                    help="Auto-tune batch size and workers based on system resources"
                )

            with col2:
                max_workers = st.slider(
                    "👷 Max Workers",
                    min_value=1,
                    max_value=8,
                    value=4,
                    help="Number of concurrent workers"
                )

                batch_size = st.slider(
                    "📦 Batch Size",
                    min_value=50,
                    max_value=1000,
                    value=250,
                    step=50,
                    help="Questions per batch"
                )

        # Checkpoint resume section
        if enable_checkpoint:
            from processor.multi_file_processor import MultiFileProcessor

            temp_processor = MultiFileProcessor(enable_checkpoint=True)
            resumable_sessions = temp_processor.list_resumable_sessions()

            if resumable_sessions:
                st.markdown("### 🔄 Resume from Checkpoint")

                session_options = ["-- Start New Session --"] + [
                    f"{s['session_id'][:8]}... ({s['progress_percentage']:.1f}% - {s['processed_files']}/{s['total_files']} files)"
                    for s in resumable_sessions
                ]

                selected_session = st.selectbox(
                    "Select session to resume:",
                    session_options,
                    help="Resume from a previous interrupted session"
                )

                if selected_session != "-- Start New Session --":
                    # Extract session ID
                    session_id = selected_session.split("...")[0]

                    # Find full session info
                    full_session = next(s for s in resumable_sessions if s['session_id'].startswith(session_id))

                    # Display session info
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Progress", f"{full_session['progress_percentage']:.1f}%")
                    with col2:
                        st.metric("Processed", f"{full_session['processed_files']}/{full_session['total_files']}")
                    with col3:
                        st.metric("Questions", full_session['total_questions'])

                    st.session_state['resume_session_id'] = full_session['session_id']
                else:
                    st.session_state['resume_session_id'] = None

        # Process button
        if st.button("🚀 Start Multi-File Processing", type="primary"):
            with st.spinner("Processing files..."):
                multi_results = process_multiple_files(
                    uploaded_files_list,
                    output_dir="output",
                    max_workers=max_workers,
                    batch_size=batch_size,
                    enable_checkpoint=enable_checkpoint,
                    enable_optimization=enable_optimization,
                    resume_session_id=st.session_state.get('resume_session_id')
                )

                # Display results
                st.success("✅ Multi-file processing completed!")

                # Statistics
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Total Files", multi_results['results']['total_files'])
                with col2:
                    st.metric("Successful", multi_results['results']['successful_count'])
                with col3:
                    st.metric("Failed", multi_results['results']['failed_count'])
                with col4:
                    st.metric("Total Questions", multi_results['results']['total_questions'])

                # Processing time
                st.info(f"⏱️ Processing time: {multi_results['processing_time']:.2f}s ({multi_results['results']['files_per_second']:.2f} files/s)")

                # Failed files
                if multi_results['results']['failed_files']:
                    with st.expander("❌ Failed Files"):
                        for failed in multi_results['results']['failed_files']:
                            st.error(f"**{failed.file_name}**: {failed.error_message}")

                # Download buttons
                st.markdown("### 📥 Download Results")

                if multi_results['csv_files']:
                    st.download_button(
                        label="📄 Download Questions CSV",
                        data=open(multi_results['csv_files']['questions'], 'rb').read(),
                        file_name="multi_file_questions.csv",
                        mime="text/csv"
                    )

                if multi_results['excel_file']:
                    st.download_button(
                        label="📊 Download Excel File",
                        data=open(multi_results['excel_file'], 'rb').read(),
                        file_name="multi_file_results.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )

                # Show processing summary
                summary_path = "output/processing_summary.json"
                if os.path.exists(summary_path):
                    with open(summary_path, 'r', encoding='utf-8') as f:
                        summary = json.load(f)

                    with st.expander("📊 Processing Summary"):
                        st.json(summary)

                # Convert to DataFrame for display
                questions_df = pd.DataFrame([q.to_csv_dict() for q in multi_results['all_questions']])
                codes_df = pd.DataFrame([c.to_csv_dict() for c in multi_results['all_question_codes']]) if multi_results['all_question_codes'] else pd.DataFrame()
                tags_df = pd.DataFrame()

                st.session_state['multi_file_processed'] = True
        else:
            # Show file list
            st.markdown("### 📋 Files to Process")
            file_list_df = pd.DataFrame([
                {
                    'File Name': f.name,
                    'Size (MB)': f"{len(f.getvalue()) / (1024 * 1024):.2f}"
                }
                for f in uploaded_files_list
            ])
            st.dataframe(file_list_df, use_container_width=True)

            st.info("👆 Click 'Start Multi-File Processing' button to begin")
            return

    # Process uploaded file or load existing data
    elif uploaded_file is not None or local_file_path is not None or st.session_state.get('trigger_processing', False):
        if uploaded_file is not None:
            # Debug logging
            st.sidebar.write(f"🔍 DEBUG: Processing section reached")
            if uploaded_file:
                st.sidebar.write(f"🔍 DEBUG: File: {uploaded_file.name}")
            
            # Clear trigger flag
            if 'trigger_processing' in st.session_state:
                del st.session_state['trigger_processing']
                st.sidebar.write("🔍 DEBUG: Cleared trigger flag")
            
            # Handle uploaded file
            if uploaded_file:
                file_size_mb = len(uploaded_file.getvalue()) / (1024 * 1024)
                st.sidebar.success(f"✅ File uploaded: {uploaded_file.name}")
                st.sidebar.info(f"📊 File size: {file_size_mb:.2f} MB")

                # Show processing message for large files
                if file_size_mb > 50:
                    st.sidebar.warning("⏳ File lớn - quá trình xử lý có thể mất vài phút...")

                # Show auto-processing message
                st.sidebar.info("🚀 Đang tự động xử lý file...")
                
                st.sidebar.write("🔍 DEBUG: About to call process_uploaded_file()")
                questions_list, codes_list, tags_list = process_uploaded_file(uploaded_file)
                st.sidebar.write("🔍 DEBUG: process_uploaded_file() completed")
        else:
            # Handle local file
            file_size_mb = os.path.getsize(local_file_path) / (1024 * 1024)
            st.sidebar.info(f"📊 File size: {file_size_mb:.2f} MB")

            # Show processing message for large files
            if file_size_mb > 50:
                st.sidebar.warning("⏳ File lớn - quá trình xử lý có thể mất vài phút...")

            questions_list, codes_list, tags_list = process_local_file(local_file_path)

        if questions_list is not None:
            # Convert to DataFrame
            questions_df = pd.DataFrame([q.to_csv_dict() for q in questions_list])
            codes_df = pd.DataFrame([c.to_csv_dict() for c in codes_list]) if codes_list else pd.DataFrame()
            tags_df = pd.DataFrame()
            
            st.sidebar.success(f"✅ Đã trích xuất {len(questions_list)} câu hỏi")
        else:
            st.error("❌ Không thể xử lý file. Vui lòng thử lại.")
            return
    else:
        # Check if user wants to load previous data
        st.sidebar.markdown("---")
        st.sidebar.markdown("**📂 Previous Data**")

        # Check if previous data exists
        questions_path = "output/questions.csv"
        has_previous_data = os.path.exists(questions_path)

        if has_previous_data:
            if st.sidebar.button("📊 Load Previous Data", help="Load data from previous parsing session"):
                # Load existing data
                questions_df, codes_df, tags_df = load_data()

                if questions_df is not None and len(questions_df) > 0:
                    st.sidebar.success(f"✅ Loaded {len(questions_df)} questions from previous session")
                else:
                    st.sidebar.error("❌ Could not load previous data")
                    show_welcome_screen()
                    return
            else:
                # Show welcome screen when no file upload and user hasn't chosen to load previous data
                show_welcome_screen()
                return
        else:
            st.sidebar.info("💡 No previous data available")
            # Show welcome screen when no data
            show_welcome_screen()
            return
    
    # Create filters
    filters = create_filters(questions_df, codes_df)
    
    # Apply filters
    filtered_df = apply_filters(questions_df, codes_df, filters)

    # Store filtered_df in session state for CSV export
    st.session_state['filtered_df'] = filtered_df
    
    # Main content tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(["📊 Dashboard", "📝 Questions", "📋 Question Codes", "🏷️ Tags", "❌ Error Questions", "⏳ Pending Questions"])

    with tab1:
        display_statistics(questions_df, filtered_df)

    with tab2:
        st.subheader(f"📝 Questions ({len(filtered_df)} found)")

        # Show available columns info
        if len(filtered_df) > 0:
            with st.expander("ℹ️ Available Data Fields"):
                st.write("**Fields extracted for each question:**")
                cols_info = st.columns(3)

                all_columns = list(filtered_df.columns)
                for i, col in enumerate(all_columns):
                    with cols_info[i % 3]:
                        # Count non-null values
                        non_null_count = filtered_df[col].notna().sum()
                        total_count = len(filtered_df)
                        percentage = (non_null_count / total_count * 100) if total_count > 0 else 0

                        st.write(f"**{col}:** {non_null_count}/{total_count} ({percentage:.1f}%)")

        if len(filtered_df) > 0:
            # Pagination
            items_per_page = st.selectbox("Items per page", [10, 25, 50, 100], index=1)
            total_pages = (len(filtered_df) - 1) // items_per_page + 1
            
            if total_pages > 1:
                page = st.selectbox("Page", range(1, total_pages + 1))
                start_idx = (page - 1) * items_per_page
                end_idx = start_idx + items_per_page
                page_df = filtered_df.iloc[start_idx:end_idx]
            else:
                page_df = filtered_df
            
            # Display questions
            for idx, row in page_df.iterrows():
                # Create expander title with key info
                status_emoji = "✅" if row.get('status') == 'ACTIVE' else "⏳" if row.get('status') == 'PENDING' else "❓"
                type_emoji = {"MC": "🔘", "TF": "✓❌", "SA": "📝", "ES": "📄"}.get(row.get('type', ''), "❓")

                expander_title = f"{status_emoji} {type_emoji} Question {row.get('id', idx)} - {row.get('type', 'Unknown')} - {row.get('status', 'Unknown')}"

                with st.expander(expander_title):
                    # Raw Content section - preserve LaTeX commands
                    st.markdown("### 🔍 Raw Content")
                    raw_content = clean_raw_content_display(row.get('rawContent', 'No raw content available'))
                    st.text_area("Raw Content", raw_content, height=120, disabled=True, key=f"raw_{idx}")

                    # Processed Content section
                    st.markdown("### 📝 Content")
                    content = clean_text_display(row.get('content', 'No content available'))
                    st.text_area("Content", content, height=100, disabled=True, key=f"content_{idx}")

                    # Source section
                    st.markdown("### 📚 Source")
                    source = clean_text_display(row.get('source', 'No source available'))
                    st.text_area("Source", source, height=60, disabled=True, key=f"source_{idx}")

                    # Answers section
                    st.markdown("### 📋 Answers")
                    answers_text = format_answers_display(row.get('answers', 'No answers available'))
                    st.text_area("Answers", answers_text, height=120, disabled=True, key=f"answers_{idx}")

                    # Correct Answer section
                    st.markdown("### ✅ Correct Answer")
                    correct_answer = clean_text_display(row.get('correctAnswer', 'No correct answer available'))
                    st.text_area("Correct Answer", correct_answer, height=60, disabled=True, key=f"correct_{idx}")

                    # Solution section - preserve LaTeX commands
                    st.markdown("### 💡 Solution")
                    solution = clean_raw_content_display(row.get('solution', 'No solution available'))
                    st.text_area("Solution", solution, height=150, disabled=True, key=f"solution_{idx}")

                    # Generated Tags section
                    st.markdown("### 🏷️ Generated Tags")
                    generated_tags = row.get('generatedTags', 'No tags generated')
                    if generated_tags and generated_tags.strip():
                        # Display tags as badges
                        tags_list = [tag.strip() for tag in generated_tags.split(';') if tag.strip()]
                        if tags_list:
                            # Display tags in a nice format
                            tag_text = " | ".join([f"🏷️ {tag}" for tag in tags_list])
                            st.markdown(f"**{tag_text}**")
                        else:
                            st.info("No tags available")
                    else:
                        st.info("No tags generated")

                    # Metadata in columns
                    st.markdown("### 📊 Metadata")
                    col1, col2, col3 = st.columns(3)

                    with col1:
                        st.markdown("**Basic Info:**")
                        st.write(f"🆔 **ID:** {clean_text_display(row.get('id', 'N/A'))}")
                        st.write(f"📝 **Type:** {clean_text_display(row.get('type', 'N/A'))}")

                        status = row.get('status', 'N/A')
                        if status == 'ACTIVE':
                            st.markdown('🟢 **Status:** <span class="status-active">ACTIVE</span>', unsafe_allow_html=True)
                        elif status == 'PENDING':
                            st.markdown('🟡 **Status:** <span class="status-pending">PENDING</span>', unsafe_allow_html=True)
                        else:
                            st.write(f"❓ **Status:** {status}")

                        st.write(f"⭐ **Difficulty:** {clean_text_display(row.get('difficulty', 'N/A'))}")
                        st.write(f"📁 **Source:** {clean_text_display(row.get('source', 'N/A'))}")

                    with col2:
                        st.markdown("**Usage & Quality:**")
                        st.write(f"👤 **Creator:** {clean_text_display(row.get('creator', 'N/A'))}")
                        st.write(f"📊 **Usage Count:** {row.get('usageCount', 0)}")
                        st.write(f"💬 **Feedback:** {row.get('feedback', 0)}")
                        st.write(f"🔢 **Subcount:** {clean_text_display(row.get('subcount', 'N/A'))}")
                        st.write(f"🏷️ **Tags:** {clean_text_display(row.get('tags', 'N/A'))}")

                    with col3:
                        st.markdown("**System & Timestamps:**")
                        st.write(f"🔗 **Question Code ID:** {clean_text_display(row.get('questionCodeId', 'N/A'))}")

                        # Timestamps
                        created_at = clean_text_display(row.get('created_at', 'N/A'))
                        updated_at = clean_text_display(row.get('updated_at', 'N/A'))
                        st.write(f"📅 **Created:** {created_at}")
                        st.write(f"🔄 **Updated:** {updated_at}")

                        # Additional fields that might exist
                        for field in ['answers', 'correctAnswer']:
                            if field in row and row[field] and str(row[field]).strip():
                                field_name = field.replace('Answer', ' Answer').replace('correct', 'Correct')
                                preview = clean_text_display(str(row[field])[:50] + "..." if len(str(row[field])) > 50 else str(row[field]))
                                st.write(f"📋 **{field_name}:** {preview}")

                    # All fields section (collapsible)
                    with st.expander("📋 All Fields (Complete Data)"):
                        st.markdown("**All extracted fields for this question:**")

                        # Display all columns in a structured way
                        all_cols = st.columns(2)
                        col_idx = 0

                        for column in row.index:
                            if column not in ['rawContent']:  # Skip raw content as it's shown separately
                                value = clean_text_display(row[column])

                                # Truncate very long values for overview
                                if len(str(value)) > 100:
                                    display_value = str(value)[:100] + "..."
                                else:
                                    display_value = str(value)

                                with all_cols[col_idx % 2]:
                                    st.write(f"**{column}:** {display_value}")

                                col_idx += 1

                    # Raw content section (collapsible)
                    if row.get('rawContent'):
                        with st.expander("🔍 View Raw LaTeX Content"):
                            raw_content = str(row.get('rawContent', ''))
                            st.code(raw_content, language='latex')
        else:
            st.info("No questions found with current filters.")
    
    with tab3:
        st.subheader("📋 Question Codes")
        if not codes_df.empty:
            st.dataframe(codes_df, use_container_width=True)
        else:
            st.info("No question codes available.")
    
    with tab4:
        st.subheader("🏷️ Tags")
        if not tags_df.empty:
            st.dataframe(tags_df, use_container_width=True)
        else:
            st.info("No tags available.")

    with tab5:
        st.subheader("❌ Error Questions")

        # Load error data if exists - force reload for new files
        error_file = "output/error.md"
        error_content = ""

        # Check if we should reload error data (new file processed or no cached data)
        should_reload_errors = (
            st.session_state.get('file_hash') and
            st.session_state.get('error_content_hash') != st.session_state.get('file_hash')
        ) or 'error_content' not in st.session_state

        if os.path.exists(error_file):
            if should_reload_errors or 'error_content' not in st.session_state:
                with open(error_file, 'r', encoding='utf-8') as f:
                    error_content = f.read()
                # Cache the error content with current file hash
                st.session_state['error_content'] = error_content
                st.session_state['error_content_hash'] = st.session_state.get('file_hash', '')
            else:
                # Use cached error content
                error_content = st.session_state.get('error_content', '')

            if error_content.strip():
                # Parse error content to extract statistics
                lines = error_content.split('\n')
                total_errors = 0
                validation_errors = 0
                malformed_questions = 0

                for line in lines:
                    if line.startswith('- Total Errors:'):
                        total_errors = int(line.split(':')[1].strip())
                    elif line.startswith('- Validation Errors:'):
                        validation_errors = int(line.split(':')[1].strip())
                    elif line.startswith('- Malformed Questions:'):
                        malformed_questions = int(line.split(':')[1].strip())

                # Display metrics
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Errors", total_errors)
                with col2:
                    st.metric("Validation Errors", validation_errors)
                with col3:
                    st.metric("Malformed Questions", malformed_questions)

                st.markdown("---")

                # Display full error report with proper formatting
                st.markdown("### 📋 Complete Error Report")
                st.markdown("**Note**: Each error question includes complete `\\begin{ex}...\\end{ex}` blocks for easy identification.")

                # Use code block for better LaTeX display
                st.code(error_content, language="markdown")

                # Download button for error report
                st.download_button(
                    label="📥 Download Error Report",
                    data=error_content,
                    file_name="error_report.md",
                    mime="text/markdown"
                )
            else:
                st.success("🎉 No errors found!")
        else:
            st.info("No error file available. Run the parser to generate error reports.")

    with tab6:
        st.subheader("⏳ Pending Questions")

        # Filter questions with PENDING status
        if not questions_df.empty:
            pending_questions = questions_df[questions_df['status'] == 'PENDING']

            if not pending_questions.empty:
                st.warning(f"Found {len(pending_questions)} questions with PENDING status")

                # Display pending questions
                for idx, (_, row) in enumerate(pending_questions.iterrows()):
                    status_emoji = "⏳"
                    type_emoji = {"MC": "🔘", "TF": "✓❌", "SA": "📝", "ES": "📄"}.get(row.get('type', ''), "❓")

                    expander_title = f"{status_emoji} {type_emoji} Question {row.get('id', idx)} - {row.get('type', 'Unknown')} - PENDING"

                    with st.expander(expander_title):
                        # Raw Content section
                        st.markdown("### 🔍 Raw Content")
                        raw_content = clean_raw_content_display(row.get('rawContent', 'No raw content available'))
                        st.text_area("Raw Content", raw_content, height=120, disabled=True, key=f"pending_raw_{idx}")

                        # Processed Content section
                        st.markdown("### 📝 Content")
                        content = clean_text_display(row.get('content', 'No content available'))
                        st.text_area("Content", content, height=100, disabled=True, key=f"pending_content_{idx}")

                        # Show why it's pending (if available)
                        st.markdown("### ⚠️ Pending Reason")
                        st.info("This question requires manual review before being marked as ACTIVE.")
            else:
                st.success("🎉 No pending questions found!")
        else:
            st.info("No questions data available.")

# Footer with export options - MOVED OUTSIDE TABS
st.markdown("---")
st.subheader("📥 Export Options")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("📊 Download Filtered CSV"):
        # Show progress for CSV generation
        progress_bar = st.progress(0)
        status_text = st.empty()

        try:
            # Get filtered_df from session state
            filtered_df = st.session_state.get('filtered_df', None)
            if filtered_df is None or filtered_df.empty:
                st.error("❌ No data available for export. Please process a file first.")
                progress_bar.empty()
                status_text.empty()
                st.stop()

            # Step 1: Prepare data
            status_text.text("📋 Đang chuẩn bị dữ liệu...")
            progress_bar.progress(20)

            total_rows = len(filtered_df)

            # Step 2: Generate CSV
            status_text.text(f"📊 Đang tạo CSV cho {total_rows:,} câu hỏi...")
            progress_bar.progress(50)

            # Clean data for CSV export - preserve literal \n but remove actual newlines
            csv_df = filtered_df.copy()
            text_columns = ['rawContent', 'content', 'source', 'solution', 'answers', 'correctAnswer']

            for col in text_columns:
                if col in csv_df.columns:
                    # Question Model đã convert newlines → \n literal rồi
                    # KHÔNG cần convert thêm - chỉ clean whitespace
                    csv_df[col] = csv_df[col].str.replace(r'[ ]+', ' ', regex=True)  # Multiple spaces to single
                    csv_df[col] = csv_df[col].str.strip()  # Remove leading/trailing whitespace

            # Fix CSV export with proper newline handling
            csv = csv_df.to_csv(
                index=False,
                escapechar='\\',  # Escape special characters
                quoting=1,        # Quote all non-numeric fields
                lineterminator='\n'  # Use consistent line endings
            )

            # Step 3: Prepare download
            status_text.text("💾 Đang chuẩn bị download...")
            progress_bar.progress(80)

            # Step 4: Complete
            status_text.text("✅ Hoàn thành!")
            progress_bar.progress(100)

            # Clear progress indicators
            import time
            time.sleep(1)
            progress_bar.empty()
            status_text.empty()

            # Show download button
            st.download_button(
                label="📥 Download CSV File",
                data=csv,
                file_name=f"filtered_questions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )

        except Exception as e:
            progress_bar.empty()
            status_text.empty()
            st.error(f"❌ Lỗi tạo CSV: {str(e)}")

    with col2:
        if os.path.exists("output/questions_export.xlsx"):
            with open("output/questions_export.xlsx", "rb") as file:
                st.download_button(
                    label="📊 Download Full Excel",
                    data=file.read(),
                    file_name="questions_export.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )

    with col3:
        st.info("💡 Use filters to narrow down results before exporting")

if __name__ == "__main__":
    main()
