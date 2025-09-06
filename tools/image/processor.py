"""
Main processor - Tích hợp tất cả các module để xử lý file LaTeX
"""
import re
from pathlib import Path
from typing import Dict, List, Optional
from core import LaTeXParser, TikZCompiler, ImageProcessor, FileManager, Question
from utils.logger import setup_logger
from config import IMAGE_FORMAT, TEMP_DIR

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
    
    def process_file(self, tex_file_path: str) -> Dict:
        """
        Xử lý một file .tex
        
        Args:
            tex_file_path: Đường dẫn file .tex
            
        Returns:
            Dictionary chứa kết quả xử lý
        """
        tex_file = Path(tex_file_path)
        
        if not tex_file.exists():
            logger.error(f"File không tồn tại: {tex_file}")
            return {'error': 'File không tồn tại'}
        
        try:
            # Backup file gốc
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
            
            # Xử lý từng câu hỏi
            for question in questions:
                question_result = self._process_question(question, images_dir, tex_file.parent)
                self.results['questions'].append(question_result)
                
                # Cập nhật nội dung file
                full_content = self._update_content(full_content, question, images_dir)
            
            # Lưu file đã xử lý
            output_tex = output_dir / tex_file.name
            self.file_manager.save_processed_tex(full_content, output_tex)
            
            # Tạo báo cáo
            report_path = output_dir / "report.txt"
            self.file_manager.create_report(self.results, report_path)
            
            # Dọn dẹp temp
            self.file_manager.cleanup_temp_files(TEMP_DIR)
            
            self.results['output_dir'] = str(output_dir)
            self.results['processed_file'] = str(output_tex)
            
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
        """Cập nhật nội dung file với đường dẫn hình mới"""
        updated_content = full_content
        
        # Tìm vị trí câu hỏi trong full content
        question_start = full_content.find(question.content)
        if question_start == -1:
            logger.warning(f"Không tìm thấy câu hỏi {question.index} trong file")
            return updated_content
        
        # Xử lý TikZ codes - thay thế bằng \includegraphics
        all_tikz = []
        
        # TikZ trong câu hỏi
        for idx, (tikz_code, _, _) in enumerate(question.question_tikz, 1):
            image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
            all_tikz.append((tikz_code, image_name))
        
        # TikZ trong lời giải
        for idx, (tikz_code, _, _) in enumerate(question.solution_tikz, 1):
            image_name = question.get_image_name("SOL", idx if len(question.solution_tikz) > 1 else 0)
            all_tikz.append((tikz_code, image_name))
        
        # Thay thế TikZ codes
        for tikz_code, image_name in all_tikz:
            image_path = f"images/{image_name}.{IMAGE_FORMAT}"
            replacement = f"\\includegraphics[width=0.8\\textwidth]{{{image_path}}}"
            
            # Escape special regex characters trong tikz_code
            escaped_tikz = re.escape(tikz_code)
            updated_content = re.sub(escaped_tikz, replacement, updated_content, count=1)
        
        # Xử lý existing images - cập nhật path
        all_images = question.question_images + question.solution_images
        
        for idx, (full_cmd, old_path, _, _) in enumerate(all_images, 1):
            # Xác định loại (QUES hay SOL) dựa vào vị trí
            if (full_cmd, old_path, _, _) in question.question_images:
                img_type = "QUES"
                img_idx = question.question_images.index((full_cmd, old_path, _, _)) + 1
            else:
                img_type = "SOL"
                img_idx = question.solution_images.index((full_cmd, old_path, _, _)) + 1
            
            # Tạo tên mới
            if len(question.question_images if img_type == "QUES" else question.solution_images) > 1:
                image_name = question.get_image_name(img_type, img_idx)
            else:
                image_name = question.get_image_name(img_type, 0)
            
            new_path = f"images/{image_name}.{IMAGE_FORMAT}"
            new_cmd = f"\\includegraphics[width=0.8\\textwidth]{{{new_path}}}"
            
            # Thay thế
            escaped_cmd = re.escape(full_cmd)
            updated_content = re.sub(escaped_cmd, new_cmd, updated_content, count=1)
        
        return updated_content
