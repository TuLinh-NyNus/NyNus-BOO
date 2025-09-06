"""
Module parse file LaTeX để trích xuất các câu hỏi và hình ảnh
"""
import re
import logging
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from config import PATTERNS

logger = logging.getLogger(__name__)


class Question:
    """Class đại diện cho một câu hỏi"""
    def __init__(self, content: str, index: int, filename: str):
        self.content = content
        self.index = index
        self.filename = Path(filename).stem
        self.subcount = self._extract_subcount()
        self.tikz_images = []
        self.existing_images = []
        self.question_tikz = []  # TikZ trong phần câu hỏi
        self.solution_tikz = []  # TikZ trong phần lời giải
        self.question_images = []  # Existing images trong câu hỏi
        self.solution_images = []  # Existing images trong lời giải
        
    def _extract_subcount(self) -> Optional[str]:
        """Trích xuất subcount từ câu hỏi"""
        match = re.search(PATTERNS['subcount'], self.content)
        if match:
            return match.group(1)
        return None
    
    def get_image_name(self, image_type: str = "QUES", image_index: int = 0) -> str:
        """Tạo tên file hình ảnh theo quy tắc"""
        if self.subcount:
            base_name = self.subcount.replace('.', '')
        else:
            base_name = f"{self.filename}_cau{self.index}"
        
        if image_index > 0:
            return f"{base_name}-{image_type}-{image_index}"
        return f"{base_name}-{image_type}"


class LaTeXParser:
    """Parser cho file LaTeX"""
    
    def __init__(self):
        self.questions = []
        
    def parse_file(self, filepath: str) -> List[Question]:
        """Parse file .tex và trả về danh sách câu hỏi"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Tìm tất cả các block \begin{ex}...\end{ex}
            ex_blocks = self._find_ex_blocks(content)
            
            # Parse từng câu hỏi
            filename = Path(filepath).name
            for idx, block in enumerate(ex_blocks, 1):
                question = Question(block, idx, filename)
                self._extract_images(question)
                self.questions.append(question)
            
            logger.info(f"Đã parse {len(self.questions)} câu hỏi từ {filepath}")
            return self.questions
            
        except Exception as e:
            logger.error(f"Lỗi khi parse file {filepath}: {str(e)}")
            raise
    
    def _find_ex_blocks(self, content: str) -> List[str]:
        """Tìm tất cả các block \\begin{ex}...\\end{ex}"""
        blocks = []
        stack = []
        current_block = []
        in_ex = False
        
        lines = content.split('\n')
        for line in lines:
            if '\\begin{ex}' in line:
                in_ex = True
                current_block = [line]
                stack.append('ex')
            elif '\\end{ex}' in line and in_ex:
                current_block.append(line)
                if stack and stack[-1] == 'ex':
                    stack.pop()
                    if not stack or 'ex' not in stack:
                        blocks.append('\n'.join(current_block))
                        current_block = []
                        in_ex = False
            elif in_ex:
                current_block.append(line)
                # Theo dõi các environment lồng nhau
                if '\\begin{' in line:
                    env_match = re.search(r'\\begin\{(\w+)\}', line)
                    if env_match:
                        stack.append(env_match.group(1))
                elif '\\end{' in line:
                    env_match = re.search(r'\\end\{(\w+)\}', line)
                    if env_match and stack and stack[-1] == env_match.group(1):
                        stack.pop()
        
        return blocks
    
    def _extract_images(self, question: Question):
        """Trích xuất TikZ và existing images từ câu hỏi"""
        content = question.content
        
        # Tách phần câu hỏi và lời giải
        loigiai_match = re.search(r'\\loigiai\{', content)
        if loigiai_match:
            question_part = content[:loigiai_match.start()]
            solution_part = self._extract_loigiai(content[loigiai_match.start():])
        else:
            question_part = content
            solution_part = ""
        
        # Tìm TikZ trong câu hỏi
        question.question_tikz = self._find_tikz(question_part)
        
        # Tìm TikZ trong lời giải
        question.solution_tikz = self._find_tikz(solution_part)
        
        # Tìm existing images trong câu hỏi
        question.question_images = self._find_existing_images(question_part)
        
        # Tìm existing images trong lời giải
        question.solution_images = self._find_existing_images(solution_part)
        
        # Tổng hợp
        question.tikz_images = question.question_tikz + question.solution_tikz
        question.existing_images = question.question_images + question.solution_images
    
    def _find_tikz(self, content: str) -> List[Tuple[str, int, int]]:
        """Tìm tất cả TikZ code trong content
        Returns: List of (tikz_code, start_pos, end_pos)
        """
        tikz_blocks = []
        pattern = r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}'
        matches = re.finditer(pattern, content, re.DOTALL)
        
        for match in matches:
            tikz_blocks.append((match.group(), match.start(), match.end()))
        
        return tikz_blocks
    
    def _find_existing_images(self, content: str) -> List[Tuple[str, str, int, int]]:
        """Tìm tất cả \\includegraphics trong content
        Returns: List of (full_command, image_path, start_pos, end_pos)
        """
        images = []
        pattern = r'\\includegraphics(?:\[.*?\])?\{(.*?)\}'
        matches = re.finditer(pattern, content)
        
        for match in matches:
            images.append((match.group(), match.group(1), match.start(), match.end()))
        
        return images
    
    def _extract_loigiai(self, content: str) -> str:
        """Trích xuất nội dung trong \\loigiai{...} với bracket matching"""
        if not content.startswith('\\loigiai{'):
            return ""
        
        stack = 0
        start_idx = len('\\loigiai{')
        
        for i in range(start_idx, len(content)):
            if content[i] == '{':
                stack += 1
            elif content[i] == '}':
                if stack == 0:
                    return content[start_idx:i]
                stack -= 1
        
        return content[start_idx:]
    
    def process_question(self, question: Question, image_dir: Path) -> str:
        """Xử lý một câu hỏi và trả về nội dung đã được cập nhật"""
        updated_content = question.content
        offset = 0
        
        # Xử lý TikZ trong câu hỏi
        for idx, (tikz_code, start, end) in enumerate(question.question_tikz, 1):
            image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
            from config import IMAGE_FORMAT
            image_path = f"images/{image_name}.{IMAGE_FORMAT}"
            replacement = f"\\includegraphics[width=0.8\\textwidth]{{{image_path}}}"
            
            # Cập nhật vị trí với offset
            actual_start = start + offset
            actual_end = end + offset
            
            updated_content = (
                updated_content[:actual_start] +
                replacement +
                updated_content[actual_end:]
            )
            
            offset += len(replacement) - (end - start)
        
        # Xử lý TikZ trong lời giải (tương tự)
        # ... (code tương tự cho solution_tikz)
        
        return updated_content
