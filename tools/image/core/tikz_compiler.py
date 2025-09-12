"""
Module compile TikZ code thành hình ảnh
"""
import os
import subprocess
import tempfile
import logging
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image, ImageChops
from pdf2image import convert_from_path
from config import (
    LATEX_HEADER, LATEX_FOOTER, LATEX_COMPILER,
    LATEX_TIMEOUT, IMAGE_DPI, IMAGE_QUALITY,
    IMAGE_FORMAT, TEMP_DIR
)

logger = logging.getLogger(__name__)


class TikZCompiler:
    """Compiler cho TikZ code"""
    
    def __init__(self):
        self.temp_dir = TEMP_DIR
        self.temp_dir.mkdir(exist_ok=True)
        
    def compile_tikz(self, tikz_code: str, output_name: str) -> Optional[Path]:
        """
        Compile TikZ code thành hình ảnh
        
        Args:
            tikz_code: TikZ code cần compile
            output_name: Tên file output (không có extension)
            
        Returns:
            Path đến file hình ảnh hoặc None nếu lỗi
        """
        try:
            # Tạo file .tex tạm thời
            tex_content = LATEX_HEADER + tikz_code + LATEX_FOOTER
            tex_file = self.temp_dir / f"{output_name}.tex"
            
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(tex_content)
            
            # Compile LaTeX thành PDF
            pdf_file = self._compile_to_pdf(tex_file)
            if not pdf_file or not pdf_file.exists():
                logger.error(f"Không thể compile {output_name} thành PDF")
                return None
            
            # Convert PDF sang hình ảnh
            image_file = self._convert_to_image(pdf_file, output_name)
            
            # Dọn dẹp file tạm
            self._cleanup_temp_files(tex_file, pdf_file)
            
            return image_file
            
        except Exception as e:
            logger.error(f"Lỗi khi compile TikZ {output_name}: {str(e)}")
            return None
    
    def _compile_to_pdf(self, tex_file: Path) -> Optional[Path]:
        """Compile file .tex thành PDF"""
        try:
            # Chạy pdflatex
            cmd = [
                LATEX_COMPILER,
                "-interaction=nonstopmode",
                "-output-directory", str(self.temp_dir),
                str(tex_file)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=LATEX_TIMEOUT,
                cwd=str(self.temp_dir)
            )
            
            pdf_file = tex_file.with_suffix('.pdf')
            
            if pdf_file.exists():
                logger.info(f"Đã compile thành công: {tex_file.name}")
                return pdf_file
            else:
                logger.error(f"Compile thất bại: {tex_file.name}")
                logger.debug(f"LaTeX output: {result.stdout}")
                logger.debug(f"LaTeX errors: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            logger.error(f"Timeout khi compile {tex_file.name}")
            return None
        except Exception as e:
            logger.error(f"Lỗi khi compile PDF: {str(e)}")
            return None
    
    def _convert_to_image(self, pdf_file: Path, output_name: str) -> Optional[Path]:
        """Convert PDF sang hình ảnh"""
        try:
            # Convert PDF sang PIL Image
            images = convert_from_path(
                str(pdf_file),
                dpi=IMAGE_DPI,
                fmt='png',
                thread_count=2
            )
            
            if not images:
                logger.error(f"Không thể convert PDF: {pdf_file}")
                return None
            
            # Lấy trang đầu tiên
            image = images[0]
            
            # Crop white space
            image = self._crop_whitespace(image)
            
            # Lưu theo format yêu cầu
            output_file = self.temp_dir / f"{output_name}.{IMAGE_FORMAT}"
            
            if IMAGE_FORMAT == 'webp':
                image.save(output_file, 'WEBP', quality=IMAGE_QUALITY, lossless=False)
            elif IMAGE_FORMAT == 'png':
                image.save(output_file, 'PNG', optimize=True)
            elif IMAGE_FORMAT == 'jpg' or IMAGE_FORMAT == 'jpeg':
                # Convert RGBA to RGB cho JPEG
                if image.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = background
                image.save(output_file, 'JPEG', quality=IMAGE_QUALITY, optimize=True)
            else:
                image.save(output_file)
            
            logger.info(f"Đã convert thành công: {output_name}.{IMAGE_FORMAT}")
            return output_file
            
        except Exception as e:
            logger.error(f"Lỗi khi convert PDF sang hình: {str(e)}")
            return None
    
    def _crop_whitespace(self, image: Image.Image) -> Image.Image:
        """Cắt bỏ khoảng trắng xung quanh hình với thuật toán robust"""
        try:
            # Phương pháp 1: Sử dụng ImageChops.difference với background trắng
            if image.mode == 'RGBA':
                # Tạo background trắng
                background = Image.new('RGBA', image.size, (255, 255, 255, 255))
                diff = ImageChops.difference(image, background)
                # Chuyển sang grayscale để tìm bbox
                diff = diff.convert('L')
                bbox = diff.getbbox()
            else:
                # Convert sang RGB nếu cần
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                # Tạo background trắng
                background = Image.new('RGB', image.size, (255, 255, 255))
                diff = ImageChops.difference(image, background)
                # Chuyển sang grayscale để tìm bbox
                diff = diff.convert('L')
                bbox = diff.getbbox()
            
            if bbox:
                # Add configurable padding
                padding = 10  # Có thể thêm vào config sau
                x1, y1, x2, y2 = bbox
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(image.width, x2 + padding)
                y2 = min(image.height, y2 + padding)
                
                return image.crop((x1, y1, x2, y2))
            
            # Nếu không tìm thấy bbox, thử phương pháp fallback
            bbox = image.getbbox()
            if bbox:
                padding = 10
                x1, y1, x2, y2 = bbox
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(image.width, x2 + padding)
                y2 = min(image.height, y2 + padding)
                return image.crop((x1, y1, x2, y2))
            
            return image
            
        except Exception as e:
            logger.warning(f"Không thể crop whitespace: {str(e)}")
            return image
    
    def _cleanup_temp_files(self, tex_file: Path, pdf_file: Path):
        """Dọn dẹp các file tạm"""
        try:
            # Xóa file .tex và .pdf
            for file in [tex_file, pdf_file]:
                if file.exists():
                    file.unlink()
            
            # Xóa các file phụ của LaTeX
            for ext in ['.aux', '.log', '.out']:
                aux_file = tex_file.with_suffix(ext)
                if aux_file.exists():
                    aux_file.unlink()
                    
        except Exception as e:
            logger.warning(f"Không thể dọn dẹp file tạm: {str(e)}")
    
    def batch_compile(self, tikz_codes: list, base_name: str) -> list:
        """
        Compile nhiều TikZ code cùng lúc
        
        Args:
            tikz_codes: List các TikZ code
            base_name: Tên cơ bản cho output files
            
        Returns:
            List các Path đến file hình ảnh đã compile
        """
        results = []
        
        for idx, tikz_code in enumerate(tikz_codes, 1):
            output_name = f"{base_name}-{idx}" if len(tikz_codes) > 1 else base_name
            image_path = self.compile_tikz(tikz_code, output_name)
            results.append(image_path)
        
        return results
