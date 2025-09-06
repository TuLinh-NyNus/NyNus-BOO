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
from config import STREAMLIT_CONFIG

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
tab1, tab2, tab3 = st.tabs(["📤 Upload & Xử lý", "📊 Kết quả", "ℹ️ Thông tin"])

with tab1:
    st.markdown("### Upload file LaTeX để xử lý")
    
    # Upload file
    uploaded_file = st.file_uploader(
        "Chọn file .tex",
        type=['tex'],
        help="File LaTeX chứa các câu hỏi với TikZ hoặc hình ảnh"
    )
    
    if uploaded_file:
        st.success(f"✅ Đã tải lên: {uploaded_file.name}")
        
        # Hiển thị thông tin file
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Tên file", uploaded_file.name)
        with col2:
            st.metric("Kích thước", f"{uploaded_file.size / 1024:.2f} KB")
        
        # Preview nội dung
        with st.expander("👁️ Xem trước nội dung file"):
            content = uploaded_file.read().decode('utf-8')
            uploaded_file.seek(0)  # Reset pointer
            st.text_area("Nội dung:", content[:2000] + "..." if len(content) > 2000 else content, height=300)
        
        # Nút xử lý
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🚀 Bắt đầu xử lý", type="primary", use_container_width=True):
                with st.spinner("Đang xử lý file LaTeX..."):
                    # Tạo temp file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.tex') as tmp_file:
                        tmp_file.write(uploaded_file.read())
                        tmp_path = tmp_file.name
                    
                    # Xử lý file
                    processor = LaTeXImageProcessor()
                    results = processor.process_file(tmp_path)
                    
                    # Lưu kết quả vào session state
                    st.session_state['results'] = results
                    st.session_state['processed'] = True
                    
                    # Cleanup temp file
                    Path(tmp_path).unlink()
                    
                    # Chuyển sang tab kết quả
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
