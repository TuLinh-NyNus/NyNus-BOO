"""
Module quản lý file, backup và tổ chức output
"""
import shutil
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Tuple
from utils.file_operations import (
    safe_copy_file, safe_move_file, safe_write_file, safe_remove_file
)

logger = logging.getLogger(__name__)


class FileManager:
    """Quản lý file và thư mục"""
    
    def __init__(self, base_dir: Path = None):
        self.base_dir = base_dir or Path.cwd()
        
    def backup_file(self, filepath: Path) -> Optional[Path]:
        """
        Backup file gốc với prefix GOC-
        
        Args:
            filepath: Đường dẫn file cần backup
            
        Returns:
            Path đến file backup hoặc None nếu lỗi
        """
        try:
            if not filepath.exists():
                logger.warning(f"File không tồn tại: {filepath}")
                return None
            
            # Tạo tên file backup
            backup_name = f"GOC-{filepath.name}"
            backup_path = filepath.parent / backup_name
            
            # Kiểm tra nếu backup đã tồn tại
            if backup_path.exists():
                # Thêm timestamp nếu đã có backup
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_name = f"GOC-{timestamp}-{filepath.name}"
                backup_path = filepath.parent / backup_name
            
            # Copy file với safe operation
            if safe_copy_file(filepath, backup_path, preserve_metadata=True):
                logger.info(f"Đã backup: {filepath.name} -> {backup_name}")
                return backup_path
            else:
                logger.error(f"Không thể backup file: {filepath}")
                return None
            
        except Exception as e:
            logger.error(f"Lỗi khi backup file {filepath}: {str(e)}")
            return None
    
    def create_output_structure(self, tex_file: Path) -> Tuple[Path, Path]:
        """
        Tạo thư mục images cùng thư mục với file .tex
        
        Args:
            tex_file: File .tex đang xử lý
            
        Returns:
            Tuple (tex_file.parent, images_dir)
        """
        try:
            # Thư mục của file .tex là output_dir
            output_dir = tex_file.parent
            images_dir = output_dir / "images"
            
            # Chỉ tạo thư mục images
            images_dir.mkdir(exist_ok=True)
            
            logger.info(f"Đã tạo thư mục images: {images_dir}")
            return output_dir, images_dir
            
        except Exception as e:
            logger.error(f"Lỗi khi tạo thư mục images: {str(e)}")
            raise
    
    def save_processed_tex(self, content: str, output_path: Path) -> bool:
        """
        Lưu file .tex đã xử lý
        
        Args:
            content: Nội dung file .tex
            output_path: Đường dẫn lưu file
            
        Returns:
            True nếu thành công
        """
        return safe_write_file(output_path, content, encoding='utf-8')
    
    def move_image_to_output(self, source: Path, dest_dir: Path, new_name: str) -> Optional[Path]:
        """
        Di chuyển hình ảnh đến thư mục output
        
        Args:
            source: File nguồn
            dest_dir: Thư mục đích
            new_name: Tên file mới (với extension)
            
        Returns:
            Path đến file mới hoặc None nếu lỗi
        """
        try:
            if not source.exists():
                logger.warning(f"File nguồn không tồn tại: {source}")
                return None
            
            dest_path = dest_dir / new_name
            
            # Di chuyển file với safe operation
            if safe_move_file(source, dest_path):
                logger.info(f"Đã di chuyển: {source.name} -> {dest_path}")
                return dest_path
            else:
                logger.error(f"Không thể di chuyển file: {source} -> {dest_path}")
                return None
            
        except Exception as e:
            logger.error(f"Lỗi khi di chuyển file: {str(e)}")
            return None
    
    def cleanup_temp_files(self, temp_dir: Path):
        """
        Dọn dẹp thư mục tạm
        
        Args:
            temp_dir: Thư mục cần dọn dẹp
        """
        try:
            if temp_dir.exists():
                cleaned_count = 0
                for file in temp_dir.iterdir():
                    if file.is_file():
                        if safe_remove_file(file):
                            cleaned_count += 1
                logger.info(f"Đã dọn dẹp {cleaned_count} files trong thư mục tạm: {temp_dir}")
                
        except Exception as e:
            logger.warning(f"Không thể dọn dẹp thư mục tạm: {str(e)}")
    
    def create_report(self, results: dict, output_path: Path) -> bool:
        """
        Tạo báo cáo xử lý
        
        Args:
            results: Dictionary chứa kết quả xử lý
            output_path: Đường dẫn lưu báo cáo
            
        Returns:
            True nếu thành công
        """
        try:
            report = []
            report.append("=" * 60)
            report.append("BÁO CÁO XỬ LÝ HÌNH ẢNH LATEX")
            report.append("=" * 60)
            report.append(f"Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            report.append("")
            
            # Thống kê
            report.append("THỐNG KÊ:")
            report.append(f"- Tổng số câu hỏi: {results.get('total_questions', 0)}")
            report.append(f"- Số TikZ đã compile: {results.get('tikz_compiled', 0)}")
            report.append(f"- Số hình có sẵn đã xử lý: {results.get('images_processed', 0)}")
            report.append(f"- Số lỗi: {results.get('errors', 0)}")
            report.append("")
            
            # Chi tiết từng câu
            if 'questions' in results:
                report.append("CHI TIẾT:")
                for q in results['questions']:
                    report.append(f"\nCâu {q['index']}: {q.get('subcount', 'N/A')}")
                    report.append(f"  - TikZ trong câu hỏi: {q.get('question_tikz', 0)}")
                    report.append(f"  - TikZ trong lời giải: {q.get('solution_tikz', 0)}")
                    report.append(f"  - Hình có sẵn: {q.get('existing_images', 0)}")
                    if q.get('errors'):
                        report.append(f"  - Lỗi: {q['errors']}")
            
            # Lưu báo cáo với safe operation
            report_content = '\n'.join(report)
            if safe_write_file(output_path, report_content, encoding='utf-8'):
                logger.info(f"Đã tạo báo cáo: {output_path}")
                return True
            else:
                logger.error(f"Không thể lưu báo cáo: {output_path}")
                return False
            
        except Exception as e:
            logger.error(f"Lỗi khi tạo báo cáo: {str(e)}")
            return False
