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
    'center': r'\\begin\{center\}(.*?)\\end\{center\}'
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

# Tạo các thư mục nếu chưa tồn tại
for dir_path in [TEMP_DIR, OUTPUT_DIR, IMAGES_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
