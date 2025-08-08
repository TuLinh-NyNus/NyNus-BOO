"""
Main Streamlit Application

LaTeX Question Parser - Web interface for parsing LaTeX questions to CSV.
"""

import streamlit as st
import os
import tempfile
import time
from typing import Optional, Dict, Any

# Import our components
try:
    from .components.file_upload import FileUploadComponent
    from .components.results_view import ResultsViewComponent
    from .components.download import DownloadComponent
    from .utils.session_state import SessionStateManager
except ImportError:
    from ui.components.file_upload import FileUploadComponent
    from ui.components.results_view import ResultsViewComponent
    from ui.components.download import DownloadComponent
    from ui.utils.session_state import SessionStateManager

# Import processing modules
try:
    from ..processor.file_reader import FileReader
    from ..processor.batch_processor import BatchProcessor
    from ..processor.error_handler import ErrorHandler
    from ..export.csv_exporter import CSVExporter
    from ..export.data_validator import DataValidator
except ImportError:
    from processor.file_reader import FileReader
    from processor.batch_processor import BatchProcessor
    from processor.error_handler import ErrorHandler
    from export.csv_exporter import CSVExporter
    from export.data_validator import DataValidator


def main():
    """Main Streamlit application."""
    
    # Page configuration
    st.set_page_config(
        page_title="LaTeX Question Parser",
        page_icon="📝",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize session state
    session_manager = SessionStateManager()
    session_manager.initialize()
    
    # Main header
    st.title("📝 LaTeX Question Parser")
    st.markdown("Convert LaTeX questions to structured CSV format")
    
    # Sidebar configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # Batch size configuration
        batch_size = st.slider(
            "Batch Size",
            min_value=100,
            max_value=2000,
            value=1000,
            step=100,
            help="Number of questions to process per batch"
        )
        
        # CPU cores configuration
        import multiprocessing
        max_cores = multiprocessing.cpu_count()
        cpu_cores = st.slider(
            "CPU Cores",
            min_value=1,
            max_value=max_cores,
            value=max_cores,
            help=f"Number of CPU cores to use (max: {max_cores})"
        )
        
        # Output directory
        output_dir = st.text_input(
            "Output Directory",
            value="tools/parsing-question/output",
            help="Directory to save CSV files and error reports"
        )
        
        st.divider()
        
        # Processing statistics
        if st.session_state.get('processing_stats'):
            st.header("📊 Statistics")
            stats = st.session_state.processing_stats
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Questions", stats.get('total_questions', 0))
                st.metric("Success Rate", f"{stats.get('success_rate', 0):.1f}%")
            
            with col2:
                st.metric("Errors", stats.get('total_errors', 0))
                st.metric("Processing Time", f"{stats.get('processing_time', 0):.1f}s")
    
    # Main content area
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # File upload section
        st.header("📁 Upload LaTeX File")
        uploaded_file = FileUploadComponent.render()
        
        if uploaded_file:
            # Display file information
            file_info = {
                'name': uploaded_file.name,
                'size': uploaded_file.size,
                'type': uploaded_file.type
            }
            FileUploadComponent.display_file_info(file_info)
            
            # Process button
            if st.button("🚀 Start Processing", type="primary", use_container_width=True):
                process_file(uploaded_file, batch_size, cpu_cores, output_dir)
    
    with col2:
        # Quick stats and help
        st.header("ℹ️ Information")
        
        st.info("""
        **Supported Question Types:**
        - MC (Multiple Choice)
        - TF (True/False)
        - SA (Short Answer)
        - ES (Essay)
        
        **Output Files:**
        - questions.csv
        - question_codes.csv
        - question_tags.csv
        - error.md
        """)
        
        # Sample format
        with st.expander("📋 Sample LaTeX Format"):
            st.code("""
%Từ ngân hàng. Câu 3528.
\\begin{ex}%[Nguồn: Thi Thử THPT]%[200N0-0] 
[TL.103528]
    Hàm số nào sau đây nghịch biến trên $\\mathbb{R}$?
    \\choice
    {\\True $y=\\left(\\dfrac{1}{3}\\right)^x$}
    {$y=2^x$}
    {$y=(\\sqrt{\\pi})^x$}
    {$y=\\mathrm{e}^x$}
    \\loigiai{
        Hàm số $y=\\left(\\dfrac{1}{3}\\right)^x$ nghịch biến...
    }
\\end{ex}
            """, language="latex")
    
    # Results section
    if st.session_state.get('processing_complete'):
        st.divider()
        st.header("📊 Processing Results")
        
        # Display results
        ResultsViewComponent.render(st.session_state.processing_results)
        
        # Download section
        if st.session_state.get('export_files'):
            st.header("💾 Download Results")
            DownloadComponent.render(st.session_state.export_files)


def process_file(uploaded_file, batch_size: int, cpu_cores: int, output_dir: str):
    """Process the uploaded LaTeX file."""
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Save uploaded file to temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix='.md') as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        temp_file_path = tmp_file.name
    
    try:
        # Initialize components
        error_handler = ErrorHandler(output_dir)
        error_handler.start_processing()
        
        # Progress tracking
        progress_container = st.container()
        
        with progress_container:
            st.info("🔍 Analyzing file...")
            
            # Read and analyze file
            file_reader = FileReader(temp_file_path)
            file_info = file_reader.get_file_info()
            
            st.success(f"File loaded: {file_info['file_size_mb']} MB")
            
            # Count questions for progress tracking
            st.info("📊 Counting questions...")
            total_questions = file_reader.count_questions()
            st.success(f"Found {total_questions:,} questions")
            
            # Split into batches
            st.info("📦 Creating batches...")
            batches = file_reader.split_into_batches(batch_size)
            st.success(f"Created {len(batches)} batches")
            
            # Process batches
            st.info("⚡ Processing questions...")
            
            # Progress bar setup
            progress_bar = st.progress(0)
            status_text = st.empty()
            stats_container = st.empty()
            
            def progress_callback(processed: int, total: int, elapsed_time: float):
                """Update progress display."""
                progress = processed / total if total > 0 else 0
                progress_bar.progress(progress)
                
                # Update status
                questions_per_sec = processed / elapsed_time if elapsed_time > 0 else 0
                remaining_time = (total - processed) / questions_per_sec if questions_per_sec > 0 else 0
                
                status_text.text(
                    f"Processed: {processed:,}/{total:,} questions "
                    f"({progress*100:.1f}%) - "
                    f"{questions_per_sec:.1f} q/s - "
                    f"ETA: {remaining_time:.0f}s"
                )
                
                # Update stats
                with stats_container.container():
                    col1, col2, col3, col4 = st.columns(4)
                    col1.metric("Processed", f"{processed:,}")
                    col2.metric("Total", f"{total:,}")
                    col3.metric("Speed", f"{questions_per_sec:.1f} q/s")
                    col4.metric("Progress", f"{progress*100:.1f}%")
            
            # Process with multiprocessing
            batch_processor = BatchProcessor(max_workers=cpu_cores)
            questions, question_codes, errors = batch_processor.process_batches(
                batches, 
                progress_callback
            )
            
            # Handle errors
            error_handler.add_batch_errors(errors, -1)
            error_handler.end_processing()
            
            # Validation
            st.info("✅ Validating data...")
            validator = DataValidator()
            validation_results = validator.validate_all_data(questions, question_codes)
            
            # Export to CSV
            st.info("💾 Exporting to CSV...")
            csv_exporter = CSVExporter(output_dir)
            export_files = csv_exporter.export_all(
                validation_results['valid_questions'],
                validation_results['valid_question_codes'],
                validation_results['valid_question_tags']
            )
            
            # Create summary
            summary_path = csv_exporter.create_export_summary(
                validation_results['valid_questions'],
                validation_results['valid_question_codes'],
                validation_results['valid_question_tags'],
                export_files
            )
            export_files['summary'] = summary_path
            
            # Save error report
            error_report_path = error_handler.save_error_report()
            export_files['error_report'] = error_report_path
            
            # Store results in session state
            processing_stats = {
                'total_questions': total_questions,
                'successful_parses': len(validation_results['valid_questions']),
                'failed_parses': len(errors),
                'success_rate': (len(validation_results['valid_questions']) / total_questions * 100) if total_questions > 0 else 0,
                'total_errors': validation_results['statistics']['total_errors'],
                'processing_time': batch_processor.get_processing_stats()['elapsed_time_seconds'],
                'question_types': {}
            }
            
            # Count question types
            for question in validation_results['valid_questions']:
                q_type = question.type
                processing_stats['question_types'][q_type] = processing_stats['question_types'].get(q_type, 0) + 1
            
            st.session_state.processing_stats = processing_stats
            st.session_state.processing_results = validation_results
            st.session_state.export_files = export_files
            st.session_state.processing_complete = True
            
            # Success message
            st.success("🎉 Processing completed successfully!")
            st.balloons()
            
    except Exception as e:
        st.error(f"❌ Processing failed: {str(e)}")
        st.exception(e)
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


if __name__ == "__main__":
    main()
