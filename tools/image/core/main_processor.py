"""
Main processor - Tích hợp tất cả các module để xử lý file LaTeX
"""
import re
from pathlib import Path
from typing import Dict, List, Optional
from core import LaTeXParser, TikZCompiler, ImageProcessor, FileManager, Question
from utils.logger import setup_logger
from config import IMAGE_FORMAT, TEMP_DIR, INCLUDEGRAPHICS_WIDTH

logger = setup_logger(__name__)


class LaTeXImageProcessor:
    """Processor chính để xử lý file LaTeX"""
    
    def __init__(self):
        self.parser = LaTeXParser()
        self.tikz_compiler = TikZCompiler()
        self.file_manager = FileManager()
        self.results = {
            'total_questions': 0,
            'tikz_compiled': 0,
            'images_processed': 0,
            'errors': 0,
            'questions': []
        }
        
    def process_file_inplace(self, tex_file_path: str, update_original: bool = True) -> Dict:
        """
        Xử lý file .tex và cập nhật file gốc nếu cần
        
        Args:
            tex_file_path: Đường dẫn file .tex
            update_original: Có cập nhật file gốc hay không
            
        Returns:
            Dictionary chứa kết quả xử lý
        """
        tex_file = Path(tex_file_path)
        
        # Backup file gốc trước khi xử lý
        backup_path = None
        if update_original:
            backup_path = self.file_manager.backup_file(tex_file)
            if backup_path:
                logger.info(f"Đã backup file gốc: {backup_path}")
        
        # Gọi process_file để xử lý
        results = self.process_file(tex_file_path, create_backup=False)
        
        # Thêm thông tin backup vào results
        if backup_path:
            results['backup_path'] = str(backup_path)
        
        # Nếu yêu cầu cập nhật file gốc và có processed content
        if update_original and 'processed_content' in results and 'error' not in results:
            try:
                # Cập nhật file gốc với processed content
                with open(tex_file, 'w', encoding='utf-8') as f:
                    f.write(results['processed_content'])
                
                logger.info(f"Đã cập nhật file gốc: {tex_file}")
                results['original_updated'] = True
                results['processed_file'] = str(tex_file)
                
            except Exception as e:
                logger.error(f"Lỗi khi cập nhật file gốc: {str(e)}")
                results['update_error'] = str(e)
        
        return results
    
    def process_file(self, tex_file_path: str, create_backup: bool = True) -> Dict:
        """
        Xử lý một file .tex
        
        Args:
            tex_file_path: Đường dẫn file .tex
            create_backup: Có tạo backup hay không
            
        Returns:
            Dictionary chứa kết quả xử lý
        """
        tex_file = Path(tex_file_path)
        
        if not tex_file.exists():
            logger.error(f"File không tồn tại: {tex_file}")
            return {'error': 'File không tồn tại'}
        
        try:
            # Backup file gốc nếu cần
            backup_path = None
            if create_backup:
                backup_path = self.file_manager.backup_file(tex_file)
                logger.info(f"Đã backup file gốc: {backup_path}")
            
            # Tạo cấu trúc output
            output_dir, images_dir = self.file_manager.create_output_structure(tex_file)
            
            # Parse file để tìm câu hỏi
            questions = self.parser.parse_file(tex_file)
            self.results['total_questions'] = len(questions)
            
            # Đọc nội dung file gốc
            with open(tex_file, 'r', encoding='utf-8') as f:
                full_content = f.read()
            original_content = full_content  # Lưu bản gốc để so sánh
            
            # Xử lý từng câu hỏi
            for question in questions:
                question_result = self._process_question(question, images_dir, tex_file.parent)
                self.results['questions'].append(question_result)
                
                # Cập nhật nội dung file
                full_content = self._update_content(full_content, question, images_dir)
            
            # Kiểm tra xem có thay đổi hay không
            if full_content != original_content:
                logger.info("File có thay đổi, sẵn sàng để cập nhật")
                self.results['file_updated'] = True
                self.results['processed_content'] = full_content
            else:
                logger.info("File không có thay đổi, giữ nguyên nội dung gốc")
                self.results['file_updated'] = False
                self.results['processed_content'] = full_content  # Vẫn trả về content
            
            # Tạo báo cáo
            report_path = output_dir / "report.txt"
            self.file_manager.create_report(self.results, report_path)
            
            # Dọc dẹp temp
            self.file_manager.cleanup_temp_files(TEMP_DIR)
            
            # Thêm thông tin backup nếu có
            if backup_path:
                self.results['backup_path'] = str(backup_path)
            
            self.results['output_dir'] = str(output_dir)
            self.results['processed_file'] = str(tex_file)
            self.results['images_dir'] = str(images_dir)
            self.results['report_file'] = str(report_path)
            
            return self.results
            
        except Exception as e:
            logger.error(f"Lỗi khi xử lý file: {str(e)}")
            return {'error': str(e)}
    
    def _process_question(self, question: Question, images_dir: Path, base_dir: Path) -> Dict:
        """Xử lý một câu hỏi"""
        result = {
            'index': question.index,
            'subcount': question.subcount,
            'question_tikz': 0,
            'solution_tikz': 0,
            'existing_images': 0,
            'errors': []
        }
        
        # Khởi tạo image processor
        image_processor = ImageProcessor(images_dir)
        
        # Xử lý TikZ trong câu hỏi
        if question.question_tikz:
            for idx, (tikz_code, _, _) in enumerate(question.question_tikz, 1):
                image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
                compiled_image = self.tikz_compiler.compile_tikz(tikz_code, image_name)
                
                if compiled_image:
                    # Di chuyển từ temp sang output
                    final_name = f"{image_name}.{IMAGE_FORMAT}"
                    self.file_manager.move_image_to_output(compiled_image, images_dir, final_name)
                    result['question_tikz'] += 1
                    self.results['tikz_compiled'] += 1
                else:
                    result['errors'].append(f"Không thể compile TikZ câu hỏi {idx}")
                    self.results['errors'] += 1
        
        # Xử lý TikZ trong lời giải
        if question.solution_tikz:
            for idx, (tikz_code, _, _) in enumerate(question.solution_tikz, 1):
                image_name = question.get_image_name("SOL", idx if len(question.solution_tikz) > 1 else 0)
                compiled_image = self.tikz_compiler.compile_tikz(tikz_code, image_name)
                
                if compiled_image:
                    final_name = f"{image_name}.{IMAGE_FORMAT}"
                    self.file_manager.move_image_to_output(compiled_image, images_dir, final_name)
                    result['solution_tikz'] += 1
                    self.results['tikz_compiled'] += 1
                else:
                    result['errors'].append(f"Không thể compile TikZ lời giải {idx}")
                    self.results['errors'] += 1
        
        # Xử lý existing images trong câu hỏi
        if question.question_images:
            for idx, (_, img_path, _, _) in enumerate(question.question_images, 1):
                image_name = question.get_image_name("QUES", idx if len(question.question_images) > 1 else 0)
                processed = image_processor.process_existing_image(img_path, image_name, base_dir)
                
                if processed:
                    result['existing_images'] += 1
                    self.results['images_processed'] += 1
                else:
                    result['errors'].append(f"Không thể xử lý hình {img_path}")
                    self.results['errors'] += 1
        
        # Xử lý existing images trong lời giải
        if question.solution_images:
            for idx, (_, img_path, _, _) in enumerate(question.solution_images, 1):
                image_name = question.get_image_name("SOL", idx if len(question.solution_images) > 1 else 0)
                processed = image_processor.process_existing_image(img_path, image_name, base_dir)
                
                if processed:
                    result['existing_images'] += 1
                    self.results['images_processed'] += 1
                else:
                    result['errors'].append(f"Không thể xử lý hình {img_path}")
                    self.results['errors'] += 1
        
        return result
    
    def _update_content(self, full_content: str, question: Question, images_dir: Path) -> str:
        """Cập nhật nội dung file với đường dẫn hình mới - giới hạn vùng replace"""
        # Tìm vị trí câu hỏi trong full content
        question_start = full_content.find(question.content)
        if question_start == -1:
            logger.warning(f"Không tìm thấy câu hỏi {question.index} trong file")
            return full_content
        
        question_end = question_start + len(question.content)
        
        # Tháo tác trên nội dung câu hỏi riêng biệt
        question_content = question.content
        
        # Xử lý TikZ codes - thay thế bằng \includegraphics trong vùng câu hỏi
        all_tikz = []
        
        # TikZ trong câu hỏi
        for idx, (tikz_code, _, _) in enumerate(question.question_tikz, 1):
            image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
            all_tikz.append((tikz_code, image_name))
        
        # TikZ trong lời giải
        for idx, (tikz_code, _, _) in enumerate(question.solution_tikz, 1):
            image_name = question.get_image_name("SOL", idx if len(question.solution_tikz) > 1 else 0)
            all_tikz.append((tikz_code, image_name))
        
        # Thay thế TikZ codes trong vùng câu hỏi
        for tikz_code, image_name in all_tikz:
            image_path = f"images/{image_name}.{IMAGE_FORMAT}"
            replacement = f"\\includegraphics[width={INCLUDEGRAPHICS_WIDTH}]{{{image_path}}}"
            
            # Thay thế trong question_content thay vì toàn file
            question_content = question_content.replace(tikz_code, replacement, 1)
        
        # Xử lý existing images - cập nhật path trong vùng câu hỏi
        # Xử lý question images - preserve original formatting
        for idx, (full_cmd, old_path, _, _) in enumerate(question.question_images, 1):
            if len(question.question_images) > 1:
                image_name = question.get_image_name("QUES", idx)
            else:
                image_name = question.get_image_name("QUES", 0)
            
            new_path = f"images/{image_name}.{IMAGE_FORMAT}"
            
            # Preserve original formatting nếu có
            new_cmd = self._preserve_includegraphics_formatting(full_cmd, old_path, new_path)
            
            # Thay thế trong question_content thay vì toàn file
            question_content = question_content.replace(full_cmd, new_cmd, 1)
        
        # Xử lý solution images - preserve original formatting
        for idx, (full_cmd, old_path, _, _) in enumerate(question.solution_images, 1):
            if len(question.solution_images) > 1:
                image_name = question.get_image_name("SOL", idx)
            else:
                image_name = question.get_image_name("SOL", 0)
            
            new_path = f"images/{image_name}.{IMAGE_FORMAT}"
            
            # Preserve original formatting nếu có
            new_cmd = self._preserve_includegraphics_formatting(full_cmd, old_path, new_path)
            
            # Thay thế trong question_content thay vì toàn file
            question_content = question_content.replace(full_cmd, new_cmd, 1)
        
        # Ghép lại full content với nội dung câu hỏi đã cập nhật
        updated_content = (
            full_content[:question_start] + 
            question_content + 
            full_content[question_end:]
        )
        
        return updated_content
    
    def _preserve_includegraphics_formatting(self, full_cmd: str, old_path: str, new_path: str) -> str:
        """Bảo toàn format gốc của \\includegraphics command"""
        try:
            # Thử thay thế chỉ path trong command gốc
            if old_path in full_cmd:
                return full_cmd.replace(old_path, new_path)
            
            # Nếu không tìm thấy exact path, thử tìm pattern
            import re
            # Tìm pattern \\includegraphics[...]{path}
            pattern = r'(\\includegraphics(?:\[.*?\])?\{)([^}]+)(\})'
            match = re.search(pattern, full_cmd)
            
            if match:
                prefix = match.group(1)  # \\includegraphics[...]{  
                suffix = match.group(3)  # }
                return f"{prefix}{new_path}{suffix}"
            
            # Fallback: tạo command mới với default formatting
            return f"\\includegraphics[width={INCLUDEGRAPHICS_WIDTH}]{{{new_path}}}"
            
        except Exception as e:
            logger.warning(f"Không thể preserve formatting: {str(e)}")
            # Fallback đơn giản
            return f"\\includegraphics[width={INCLUDEGRAPHICS_WIDTH}]{{{new_path}}}"
