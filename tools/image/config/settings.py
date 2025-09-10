"""
Cấu hình hệ thống cho tool xử lý hình ảnh LaTeX
"""
import os
from pathlib import Path

# Đường dẫn cơ bản
BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
IMAGES_DIR = OUTPUT_DIR / "images"

# Cấu hình LaTeX
LATEX_COMPILER = "pdflatex"  # Có thể đổi thành xelatex nếu cần
LATEX_TIMEOUT = 30  # Timeout cho compile (giây)

# Cấu hình hình ảnh
IMAGE_FORMAT = "webp"  # Format output (png, webp, jpg)
IMAGE_DPI = 300  # DPI cho convert PDF sang hình
IMAGE_QUALITY = 95  # Chất lượng hình ảnh (1-100)

# Cấu hình batch processing và tối ưu hóa
BATCH_SIZE = 100  # Số câu hỏi mỗi batch cho file lớn
MAX_WORKERS = min(4, (os.cpu_count() or 1) + 1)  # Số thread cho ThreadPoolExecutor
LARGE_FILE_THRESHOLD = 10000  # Ngưỡng số câu hỏi để dùng streaming processor
MEMORY_WARNING_THRESHOLD = 85  # Ngưỡng cảnh báo memory usage (%)
MEMORY_CRITICAL_THRESHOLD = 90  # Ngưỡng critical memory usage (%) 
PROGRESS_UPDATE_INTERVAL = 5  # Cập nhật progress bar mỗi X giây

# Cấu hình đặt tên hình ảnh
PRESERVE_DOT_IN_SUBCOUNT = True  # True: TL.123456-QUES.webp, False: TL123456-QUES.webp
# 🔍 Đã đặt thành True để giữ dấu chấm trong subcount

# Header LaTeX mặc định cho compile TikZ
LATEX_HEADER = r"""
\documentclass[12pt,border=2mm]{standalone}
\usepackage{amsmath,amssymb,makecell,physics,mathrsfs,graphics,yhmath}
\usepackage{tikz,tikz-3dplot,tkz-euclide,tkz-tab,pgfplots,esvect}
\usepackage[utf8]{vietnam}
\usetikzlibrary{shapes.geometric,shadings,calc,patterns.meta,arrows,intersections,angles,backgrounds,quotes,shadows,decorations.text,matrix}
\usetkzobj{all}
\usepgfplotslibrary{fillbetween}
\pgfplotsset{compat=newest}
\mathversion{bold}
\def\vec{\overrightarrow}
\begin{document}
"""

LATEX_FOOTER = r"""
\end{document}
"""

# Regex patterns để parse LaTeX
PATTERNS = {
    'ex_block': r'\\begin\{ex\}.*?\\end\{ex\}',
    'subcount': r'\[([A-Z]{2}\.\d+)\]',  # Pattern [XX.N]
    'tikz': r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}',
    'includegraphics': r'\\includegraphics(?:\[.*?\])?\{(.*?)\}',
    'loigiai': r'\\loigiai\{',
    'immini': r'\\immini(?:\[.*?\])?\{(.*?)\}\{(.*?)\}',
    'center': r'\\begin\{center\}(.*?)\\end\{center\}',
    'IMAGE_FORMAT': 'webp'  # Thêm IMAGE_FORMAT vào PATTERNS để tránh lỗi import
}

# Cấu hình logging
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Cấu hình Streamlit
STREAMLIT_CONFIG = {
    'page_title': 'LaTeX Image Processor',
    'page_icon': '🖼️',
    'layout': 'wide',
    'initial_sidebar_state': 'expanded'
}

# Tạo thư mục tạm nếu chưa tồn tại (không auto-create output/images)
TEMP_DIR.mkdir(parents=True, exist_ok=True)
