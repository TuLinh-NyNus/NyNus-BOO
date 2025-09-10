"""
LaTeX Image Processor - Streamlit UI
Tool xử lý hình ảnh trong file LaTeX (TikZ và existing images)
"""
import streamlit as st
import tempfile
import shutil
import zipfile
from pathlib import Path
from processor import LaTeXImageProcessor
from core.streaming_processor import StreamingLaTeXProcessor, ProgressCallback
from config import STREAMLIT_CONFIG
import os
import time
import json

# ===============================
# FUNCTION DEFINITIONS
# ===============================

def _process_multiple_files(selected_files: list, parallel_mode: bool = False) -> dict:
    """Xử lý nhiều files với progress tracking"""
    
    st.markdown("### 📊 Tiến trình xử lý nhiều files")
    
    # Tạo overall progress UI
    overall_progress = st.progress(0)
    overall_status = st.empty()
    
    # File status table
    status_container = st.container()
    
    # Stats containers
    stats_container = st.container()
    
    with stats_container:
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            total_tikz_metric = st.metric("Tổng TikZ", "0")
        with col2:
            total_images_metric = st.metric("Tổng Images", "0")
        with col3:
            total_errors_metric = st.metric("Tổng Errors", "0")
        with col4:
            processing_time_metric = st.metric("Thời gian", "0 min")
    
    # Stop button
    stop_col1, stop_col2, stop_col3 = st.columns([2, 1, 2])
    with stop_col2:
        if st.button("⏹️ Dừng xử lý", type="secondary"):
            st.session_state['stop_multiple_processing'] = True
    
    # Initialize results
    overall_results = {
        'total_files': len(selected_files),
        'completed_files': 0,
        'total_questions': sum(f.get('question_count', 0) for f in selected_files),
        'total_tikz_compiled': 0,
        'total_images_processed': 0,
        'total_errors': 0,
        'file_results': [],
        'start_time': time.time()
    }
    
    try:
        # Process files based on mode
        if parallel_mode:
            # Parallel processing (advanced)
            st.info("⚡ **Chế độ song song** - Xử lý nhiều files cùng lúc")
            overall_results = _process_files_parallel(selected_files, overall_results, 
                                                    overall_progress, overall_status, status_container)
        else:
            # Sequential processing (safe)
            st.info("🔄 **Chế độ từng file** - Xử lý lần lượt")
            overall_results = _process_files_sequential(selected_files, overall_results,
                                                      overall_progress, overall_status, status_container)
        
        # Final summary
        processing_time = time.time() - overall_results['start_time']
        
        st.success("✅ Xử lý hoàn tất tất cả files!")
        
        # Update final stats
        with stats_container:
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Tổng TikZ", f"{overall_results['total_tikz_compiled']:,}")
            with col2:
                st.metric("Tổng Images", f"{overall_results['total_images_processed']:,}")
            with col3:
                st.metric("Tổng Errors", f"{overall_results['total_errors']:,}")
            with col4:
                st.metric("Thời gian", f"{processing_time/60:.1f} min")
        
        st.balloons()
        
    except Exception as e:
        st.error(f"❌ Lỗi xử lý: {str(e)}")
        overall_results['error'] = str(e)
    
    # Chuẩn hóa kết quả cho tab2
    overall_results['tikz_compiled'] = overall_results['total_tikz_compiled']
    overall_results['images_processed'] = overall_results['total_images_processed']
    overall_results['errors'] = overall_results['total_errors']
    
    # Tổng hợp questions từ file_results
    questions = []
    for i, file_result in enumerate(overall_results['file_results']):
        if 'questions' in file_result:
            questions.extend(file_result['questions'])
        else:
            # Tạo question placeholder nếu không có chi tiết
            questions.append({
                'index': i + 1,
                'subcount': 'N/A',
                'question_tikz': 0,
                'solution_tikz': 0,
                'existing_images': 0,
                'errors': [file_result.get('error', '')] if file_result.get('error') else []
            })
    
    overall_results['questions'] = questions
    
    # Thiết lập output_dir và processed_content từ file đầu tiên
    if overall_results['file_results']:
        first_result = overall_results['file_results'][0]
        if 'output_dir' in first_result:
            overall_results['output_dir'] = first_result['output_dir']
        if 'processed_content' in first_result:
            overall_results['processed_content'] = first_result['processed_content']
        if 'processed_file' in first_result:
            overall_results['processed_file'] = first_result['processed_file']
    
    return overall_results


def _process_files_sequential(selected_files: list, overall_results: dict, 
                            overall_progress, overall_status, status_container) -> dict:
    """Xử lý files lần lượt"""
    import time
    
    for idx, file_info in enumerate(selected_files):
        if st.session_state.get('stop_multiple_processing', False):
            break
        
        # Update overall progress
        progress = idx / len(selected_files)
        overall_progress.progress(progress)
        overall_status.text(f"📊 Xử lý file {idx+1}/{len(selected_files)}: {file_info['name']}")
        
        # Display current file status
        with status_container:
            st.info(f"📄 Đang xử lý: **{file_info['name']}** ({file_info.get('question_count', 0):,} câu hỏi)")
        
        try:
            # Determine processing method based on file size
            if file_info.get('question_count', 0) >= 10000:
                # Large file - use streaming processor
                streaming_processor = StreamingLaTeXProcessor()
                file_result = streaming_processor.process_large_file(file_info['path'])
            else:
                # Normal file - use standard processor
                processor = LaTeXImageProcessor()
                file_result = processor.process_file_inplace(file_info['path'], update_original=True)
            
            if 'error' not in file_result:
                # Update overall stats
                overall_results['total_tikz_compiled'] += file_result.get('tikz_compiled', 0)
                overall_results['total_images_processed'] += file_result.get('images_processed', 0)
                overall_results['total_errors'] += file_result.get('errors', 0)
                overall_results['completed_files'] += 1
                
                file_result['status'] = 'success'
                with status_container:
                    st.success(f"✅ Hoàn thành: {file_info['name']} - TikZ: {file_result.get('tikz_compiled', 0)}, Images: {file_result.get('images_processed', 0)}")
            else:
                file_result['status'] = 'error'
                overall_results['total_errors'] += 1
                with status_container:
                    st.error(f"❌ Lỗi: {file_info['name']} - {file_result['error']}")
            
            file_result['file_name'] = file_info['name']
            overall_results['file_results'].append(file_result)
            
        except Exception as e:
            error_result = {
                'file_name': file_info['name'],
                'status': 'error',
                'error': str(e)
            }
            overall_results['file_results'].append(error_result)
            overall_results['total_errors'] += 1
            
            with status_container:
                st.error(f"❌ Exception: {file_info['name']} - {str(e)}")
    
    # Final progress update
    overall_progress.progress(1.0)
    overall_status.text(f"✅ Hoàn thành xử lý {overall_results['completed_files']}/{len(selected_files)} files")
    
    return overall_results


def _process_files_parallel(selected_files: list, overall_results: dict,
                           overall_progress, overall_status, status_container) -> dict:
    """Xử lý files song song (advanced - cần nhiều RAM)"""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    import time
    
    max_workers = min(3, len(selected_files))  # Limit concurrent files
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all files
        future_to_file = {}
        for file_info in selected_files:
            if file_info.get('question_count', 0) >= 10000:
                # Large file
                streaming_processor = StreamingLaTeXProcessor()
                future = executor.submit(streaming_processor.process_large_file, file_info['path'])
            else:
                # Normal file 
                processor = LaTeXImageProcessor()
                future = executor.submit(processor.process_file_inplace, file_info['path'], True)
            
            future_to_file[future] = file_info
        
        # Process completed files
        completed_count = 0
        for future in as_completed(future_to_file):
            if st.session_state.get('stop_multiple_processing', False):
                break
            
            file_info = future_to_file[future]
            completed_count += 1
            
            # Update progress
            progress = completed_count / len(selected_files)
            overall_progress.progress(progress)
            overall_status.text(f"📊 Hoàn thành {completed_count}/{len(selected_files)} files")
            
            try:
                file_result = future.result()
                
                if 'error' not in file_result:
                    overall_results['total_tikz_compiled'] += file_result.get('tikz_compiled', 0)
                    overall_results['total_images_processed'] += file_result.get('images_processed', 0)
                    overall_results['total_errors'] += file_result.get('errors', 0)
                    overall_results['completed_files'] += 1
                    file_result['status'] = 'success'
                    
                    with status_container:
                        st.success(f"✅ Hoàn thành: {file_info['name']}")
                else:
                    file_result['status'] = 'error'
                    overall_results['total_errors'] += 1
                    with status_container:
                        st.error(f"❌ Lỗi: {file_info['name']} - {file_result['error']}")
                
                file_result['file_name'] = file_info['name']
                overall_results['file_results'].append(file_result)
                
            except Exception as e:
                error_result = {
                    'file_name': file_info['name'],
                    'status': 'error', 
                    'error': str(e)
                }
                overall_results['file_results'].append(error_result)
                overall_results['total_errors'] += 1
                
                with status_container:
                    st.error(f"❌ Exception: {file_info['name']} - {str(e)}")
    
    return overall_results


def _process_large_file(file_path: str, question_count: int) -> dict:
    """Xử lý file lớn với progress tracking"""
    
    # Tạo progress UI
    progress_container = st.container()
    
    with progress_container:
        st.markdown("### 📊 Tiến trình xử lý")
        
        # Progress bar
        progress_bar = st.progress(0)
        
        # Status text
        status_text = st.empty()
        
        # Stats container
        stats_container = st.container()
        
        with stats_container:
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                tikz_metric = st.metric("TikZ Compiled", "0")
            with col2:
                images_metric = st.metric("Images Processed", "0")
            with col3:
                errors_metric = st.metric("Errors", "0")
            with col4:
                memory_metric = st.metric("Memory Usage", "0 MB")
        
        # Stop button
        stop_col1, stop_col2, stop_col3 = st.columns([2, 1, 2])
        with stop_col2:
            if st.button("⏹️ Dừng xử lý", type="secondary"):
                st.session_state['stop_processing'] = True
    
    # Create progress callback
    progress_callback = ProgressCallback(progress_bar, status_text, stats_container)
    
    # Initialize streaming processor
    streaming_processor = StreamingLaTeXProcessor()
    
    try:
        # Start processing
        results = streaming_processor.process_large_file(file_path, progress_callback)
        
        if 'error' in results:
            st.error(f"❌ Lỗi: {results['error']}")
        else:
            # Final update
            progress_bar.progress(1.0)
            status_text.success("✅ Xử lý hoàn tất!")
            
            # Update final metrics
            with stats_container:
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("TikZ Compiled", f"{results.get('tikz_compiled', 0):,}")
                with col2:
                    st.metric("Images Processed", f"{results.get('images_processed', 0):,}")
                with col3:
                    st.metric("Errors", f"{results.get('errors', 0):,}")
                with col4:
                    processing_time = results.get('processing_time', 0)
                    st.metric("Processing Time", f"{processing_time/60:.1f} min")
            
            st.balloons()
    
    except Exception as e:
        st.error(f"❌ Lỗi xử lý: {str(e)}")
        results = {'error': str(e)}
    
    return results

# ===============================
# HELPER: Persist state and scan files
# ===============================

def _state_dir() -> Path:
    return Path(__file__).parent / "state"

def _state_file() -> Path:
    return _state_dir() / "selection.json"

def load_persisted_state() -> dict:
    try:
        sf = _state_file()
        if sf.exists():
            with open(sf, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    raise ValueError("State file invalid")
                data.setdefault('last_dir', str(Path.home()))
                data.setdefault('selected_paths', [])
                return data
    except Exception:
        pass
    return {'last_dir': str(Path.home()), 'selected_paths': []}

def save_persisted_state(state: dict):
    try:
        sd = _state_dir()
        sd.mkdir(parents=True, exist_ok=True)
        with open(_state_file(), 'w', encoding='utf-8') as f:
            json.dump({'last_dir': state.get('last_dir', str(Path.home())),
                       'selected_paths': state.get('selected_paths', [])}, f, ensure_ascii=False, indent=2)
    except Exception:
        # Không chặn UI nếu lưu state thất bại
        pass

def scan_tex_files(base_dir: str, recursive: bool = True) -> list:
    base = Path(base_dir)
    if not base.exists():
        return []
    try:
        if recursive:
            files = [str(p) for p in base.rglob('*.tex') if p.is_file()]
        else:
            files = [str(p) for p in base.glob('*.tex') if p.is_file()]
        return sorted(files)
    except Exception:
        return []

def pick_tex_files(initial_dir: str | None) -> list:
    """Mở hộp thoại hệ điều hành để chọn nhiều file .tex và trả về danh sách đường dẫn tuyệt đối"""
    try:
        # Chỉ hoạt động tốt khi chạy cục bộ
        import tkinter as tk
        from tkinter import filedialog
        init_dir = initial_dir if initial_dir and Path(initial_dir).exists() else str(Path.home())
        root = tk.Tk()
        root.withdraw()
        # Đưa dialog lên trên cùng để dễ thấy
        try:
            root.attributes('-topmost', True)
        except Exception:
            pass
        file_paths = filedialog.askopenfilenames(
            initialdir=init_dir,
            title='Chọn file LaTeX',
            filetypes=[('LaTeX files', '*.tex')]
        )
        root.destroy()
        return list(file_paths)
    except Exception as e:
        st.error(f"Không mở được hộp thoại duyệt file: {e}")
        return []

# ===============================
# STREAMLIT UI SETUP
# ===============================

# Page config
st.set_page_config(
    page_title=STREAMLIT_CONFIG['page_title'],
    page_icon=STREAMLIT_CONFIG['page_icon'],
    layout=STREAMLIT_CONFIG['layout'],
    initial_sidebar_state=STREAMLIT_CONFIG['initial_sidebar_state']
)

# CSS tùy chỉnh
st.markdown("""
<style>
    .main-header {
        text-align: center;
        color: #2E86AB;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .info-box {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        margin: 10px 0;
    }
    .success-box {
        background-color: #d4edda;
        padding: 15px;
        border-radius: 5px;
        border-left: 5px solid #28a745;
    }
    .error-box {
        background-color: #f8d7da;
        padding: 15px;
        border-radius: 5px;
        border-left: 5px solid #dc3545;
    }
    .warning-box {
        background-color: #fff3cd;
        padding: 15px;
        border-radius: 5px;
        border-left: 5px solid #ffc107;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("<h1 class='main-header'>🖼️ LaTeX Image Processor</h1>", unsafe_allow_html=True)
st.markdown("### Công cụ xử lý hình ảnh TikZ và chuyển đổi hình ảnh trong file LaTeX")

# Sidebar - Hướng dẫn
with st.sidebar:
    st.markdown("## 📖 Hướng dẫn sử dụng")
    
    with st.expander("🎯 Mục đích"):
        st.markdown("""
        Tool này giúp:
        - Compile code TikZ thành hình ảnh WEBP
        - Copy và rename hình ảnh có sẵn theo subcount
        - Thay thế TikZ và cập nhật path hình trong file .tex
        - Tổ chức hình ảnh vào thư mục images/
        """)
    
    with st.expander("📝 Quy tắc đặt tên"):
        st.markdown("""
        **Với subcount [XX.N]:**
        - Câu hỏi: `XXN-QUES.webp`
        - Lời giải: `XXN-SOL.webp`
        - Nhiều hình: `XXN-QUES-1.webp`, `XXN-QUES-2.webp`
        
        **Không có subcount:**
        - Format: `tênfile_cauX-TYPE.webp`
        """)
    
    with st.expander("⚙️ Cấu hình"):
        st.markdown("""
        - **Compiler:** pdflatex
        - **Format:** WEBP
        - **DPI:** 300
        - **Quality:** 95%
        """)
    
    st.markdown("---")
    st.markdown("### 🛠️ Yêu cầu hệ thống")
    st.markdown("""
    - LaTeX distribution (MiKTeX/TeX Live)
    - Python 3.9+
    - poppler-utils (cho pdf2image)
    """)

# Main content
tab1, tab2, tab3 = st.tabs(["📁 Duyệt & Xử lý", "📊 Kết quả", "ℹ️ Thông tin"])

with tab1:
    st.markdown("### 📂 Chọn file LaTeX để xử lý")

    # Tải/Persist state lựa chọn
    if 'persist_state' not in st.session_state:
        st.session_state['persist_state'] = load_persisted_state()
    state = st.session_state['persist_state']


    st.markdown("#### 🗂️ Duyệt file")
    st.caption(f"Thư mục mặc định: {state.get('last_dir') or str(Path.home())}")

    if st.button("📁 Chọn file .tex", type="secondary", use_container_width=True):
        picks = pick_tex_files(state.get('last_dir'))
        if picks:
            st.session_state['selected_paths_widget'] = list(picks)
            # Cập nhật last_dir theo file đầu tiên được chọn
            st.session_state['persist_state']['last_dir'] = str(Path(picks[0]).parent)
            save_persisted_state(st.session_state['persist_state'])
            st.success(f"✅ Đã chọn {len(picks)} file(s)")
        else:
            st.info("Không có file nào được chọn")

    # Biên dịch selected_files từ selected_paths
    selected_files = []
    for p in st.session_state.get('selected_paths_widget', state.get('selected_paths', [])):
        f = Path(p)
        if f.exists() and f.suffix == '.tex':
            selected_files.append({
                'name': f.name,
                'path': str(f),
                'size': f.stat().st_size,
                'source': 'browse'
            })

    # Hiển thị danh sách file đã chọn
    if selected_files:
        st.markdown("### 📋 Danh sách file đã chọn")

        total_size = sum(f['size'] for f in selected_files)
        st.info(f"📊 Đã chọn: {len(selected_files)} file(s) - {total_size/1024:.1f} KB")

        for idx, file_info in enumerate(selected_files):
            with st.expander(f"📄 {file_info['name']} ({file_info['size']/1024:.1f} KB)", expanded=False):
                col1, col2, col3 = st.columns([2, 1, 1])

                with col1:
                    st.text(f"Path: {file_info['path']}")
                    st.text("Source: Duyệt file")

                with col2:
                    # Preview button
                    if st.button(f"👁️ Preview", key=f"preview_{idx}"):
                        try:
                            with open(file_info['path'], 'r', encoding='utf-8') as f:
                                content = f.read()
                            st.text_area(
                                f"Nội dung {file_info['name']}",
                                content[:1000] + "..." if len(content) > 1000 else content,
                                height=200,
                                key=f"content_{idx}"
                            )
                        except Exception as e:
                            st.error(f"Không thể đọc file: {str(e)}")

                with col3:
                    if st.button(f"🗑️ Xóa", key=f"remove_{idx}"):
                        # Cập nhật danh sách đã chọn trong widget và persist
                        current_sel = st.session_state.get('selected_paths_widget', [])
                        if file_info['path'] in current_sel:
                            current_sel = [p for p in current_sel if p != file_info['path']]
                            st.session_state['selected_paths_widget'] = current_sel
                        st.rerun()
        # Phân tích files đã chọn
        st.markdown("### 📊 Phân tích files")
        total_questions = 0
        large_files = []
        normal_files = []
        with st.spinner("Phân tích files..."):
            for file_info in selected_files:
                try:
                    with open(file_info['path'], 'r', encoding='utf-8') as f:
                        question_count = sum(1 for line in f if '\\begin{ex}' in line)
                    file_info['question_count'] = question_count
                    total_questions += question_count
                    if question_count >= 10000:
                        large_files.append(file_info)
                    else:
                        normal_files.append(file_info)
                except Exception as e:
                    st.error(f"Lỗi phân tích file {file_info['name']}: {str(e)}")
                    file_info['question_count'] = 0

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Tổng files", len(selected_files))
        with col2:
            st.metric("Tổng câu hỏi", f"{total_questions:,}")
        with col3:
            st.metric("Files lớn", len(large_files))
        with col4:
            st.metric("Files thường", len(normal_files))

        if large_files:
            st.warning(f"📈 **{len(large_files)} file(s) lớn** phát hiện - Sẽ dùng chế độ tối ưu")
            for file_info in large_files:
                st.info(f"  • {file_info['name']}: {file_info['question_count']:,} câu hỏi")
        if normal_files:
            st.info(f"📄 **{len(normal_files)} file(s) thường** - Chế độ chuẩn")
            for file_info in normal_files:
                st.info(f"  • {file_info['name']}: {file_info['question_count']:,} câu hỏi")

        estimated_time = total_questions * 2 / 60  # 2 giây/câu trung bình
        st.info(f"⏱️ **Ước tính thời gian xử lý**: {estimated_time:.1f} phút")

        # Processing section
        st.markdown("### 🚀 Xử lý Files")
        processing_mode = st.radio(
            "Chế độ xử lý:",
            ["Từng file một (🔄 Từng file)", "Song song (⚡ Nhanh hơn)"],
            help="Từng file: ít tài nguyên nhưng chậm hơn. Song song: nhanh hơn nhưng cần nhiều RAM"
        )

        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🚀 Bắt đầu xử lý tất cả files", type="primary", use_container_width=True):
                # Lưu persist lựa chọn hiện tại (last_dir đã lưu khi chọn file)
                st.session_state['persist_state']['selected_paths'] = st.session_state.get('selected_paths_widget', [])
                save_persisted_state(st.session_state['persist_state'])

                parallel_mode = "Song song" in processing_mode
                st.success(f"🚀 Khởi động xử lý {len(selected_files)} file(s) - {'Song song' if parallel_mode else 'Từng file'}!")

                results = _process_multiple_files(selected_files, parallel_mode)

                processed_content = results.get('processed_content')
                if processed_content:
                    st.session_state['processed_content'] = processed_content
                    st.session_state['original_filename'] = 'processed_files.tex'
                    if 'backup_path' in results:
                        st.session_state['backup_info'] = f"File backup tại: {results['backup_path']}"
                    else:
                        st.session_state['backup_info'] = "Backup đã được tạo"
                elif not results.get('error'):
                    st.warning("⚠️ File không có thay đổi hoặc không thể xử lý")
                st.session_state['results'] = results
                st.session_state['processed'] = True
                st.success("✅ Xử lý hoàn tất!")
                st.balloons()

with tab2:
    if 'results' in st.session_state and st.session_state.get('processed'):
        results = st.session_state['results']
        
        if 'error' in results:
            st.error(f"❌ Lỗi: {results['error']}")
        else:
            st.markdown("### 📊 Kết quả xử lý")
            
            # Thống kê tổng quan
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("📝 Tổng câu hỏi", results['total_questions'])
            with col2:
                st.metric("🎨 TikZ đã compile", results['tikz_compiled'])
            with col3:
                st.metric("🖼️ Hình đã xử lý", results['images_processed'])
            with col4:
                st.metric("⚠️ Lỗi", results['errors'])
            
            # Chi tiết từng câu
            with st.expander("📋 Chi tiết từng câu hỏi"):
                for q in results['questions']:
                    col1, col2, col3 = st.columns([1, 2, 3])
                    with col1:
                        st.write(f"**Câu {q['index']}**")
                    with col2:
                        st.write(f"Subcount: {q.get('subcount', 'N/A')}")
                    with col3:
                        stats = []
                        if q['question_tikz'] > 0:
                            stats.append(f"TikZ câu hỏi: {q['question_tikz']}")
                        if q['solution_tikz'] > 0:
                            stats.append(f"TikZ lời giải: {q['solution_tikz']}")
                        if q['existing_images'] > 0:
                            stats.append(f"Hình có sẵn: {q['existing_images']}")
                        st.write(" | ".join(stats) if stats else "Không có hình")
                    
                    if q.get('errors'):
                        st.error(f"Lỗi: {', '.join(q['errors'])}")
            
            # Download section
            st.markdown("### 💾 Tải xuống kết quả")
            
            output_dir = Path(results['output_dir'])
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Tạo zip file
                zip_path = output_dir.parent / f"{output_dir.name}.zip"
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for file_path in output_dir.rglob('*'):
                        if file_path.is_file():
                            arcname = file_path.relative_to(output_dir.parent)
                            zipf.write(file_path, arcname)
                
                # Download button
                with open(zip_path, 'rb') as f:
                    st.download_button(
                        label="📦 Tải xuống tất cả (ZIP)",
                        data=f.read(),
                        file_name=f"{output_dir.name}.zip",
                        mime="application/zip",
                        use_container_width=True
                    )
            
            with col2:
                # Download processed .tex file
                if 'processed_content' in st.session_state and 'original_filename' in st.session_state:
                    st.download_button(
                        label="📄 Tải file .tex đã xử lý",
                        data=st.session_state['processed_content'].encode('utf-8'),
                        file_name=st.session_state['original_filename'],
                        mime="text/plain",
                        use_container_width=True
                    )
                else:
                    # Fallback nếu không có processed_content
                    processed_tex = Path(results['processed_file'])
                    if processed_tex.exists():
                        with open(processed_tex, 'rb') as f:
                            st.download_button(
                                label="📄 Tải file .tex đã xử lý",
                                data=f.read(),
                                file_name=processed_tex.name,
                                mime="text/plain",
                                use_container_width=True
                            )
            
            # Hiển thị đường dẫn output
            st.info(f"📁 Kết quả được lưu tại: `{output_dir}`")
            
            # Hiển thị thông tin backup nếu có
            if 'backup_info' in st.session_state:
                st.success(f"💾 {st.session_state['backup_info']}")
    else:
        st.info("👆 Vui lòng upload và xử lý file trước")

with tab3:
    st.markdown("### ℹ️ Thông tin về tool")
    
    st.markdown("""
    #### 🎯 Chức năng chính:
    1. **Parse file LaTeX** để tìm các block `\\begin{ex}...\\end{ex}`
    2. **Trích xuất subcount** dạng `[XX.N]` từ mỗi câu hỏi
    3. **Compile TikZ** thành hình ảnh WEBP chất lượng cao
    4. **Xử lý hình có sẵn**: copy và rename theo quy tắc
    5. **Cập nhật file .tex** với đường dẫn hình mới
    6. **Tạo báo cáo** chi tiết về quá trình xử lý
    
    #### 🔧 Công nghệ sử dụng:
    - **Python 3.9+** với Streamlit framework
    - **pdflatex** để compile LaTeX
    - **pdf2image** & **Pillow** để xử lý hình ảnh
    - **regex** để parse LaTeX phức tạp
    
    #### 📝 Lưu ý:
    - File gốc sẽ được backup với prefix `GOC-`
    - Nếu compile TikZ thất bại, code TikZ sẽ được giữ nguyên
    - Hình ảnh output có format WEBP với chất lượng 95%
    - Thư mục output có cùng tên với file .tex
    
    #### 👨‍💻 Phát triển bởi:
    Hệ thống NyNus - LaTeX Question Bank
    """)
    
    # System check
    st.markdown("### 🔍 Kiểm tra hệ thống")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Check LaTeX
        import subprocess
        try:
            result = subprocess.run(['pdflatex', '--version'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                st.success("✅ pdflatex đã được cài đặt")
            else:
                st.error("❌ pdflatex chưa được cài đặt")
        except:
            st.error("❌ Không tìm thấy pdflatex")
    
    with col2:
        # Check poppler
        try:
            from pdf2image import convert_from_path
            st.success("✅ pdf2image và poppler hoạt động")
        except:
            st.error("❌ Cần cài đặt poppler-utils")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #888;'>
    <small>LaTeX Image Processor v1.0.0 | © 2025 NyNus System</small>
</div>
""", unsafe_allow_html=True)
