"""
Tag Generator

Generates tags for questions based on QuestionCode using MapCode.md mappings.
"""

import re
from typing import List, Optional
from .map_code_parser import MapCodeParser


class TagGenerator:
    """
    Generates tags for questions based on QuestionCode.
    
    Logic:
    - Character 1: Level 1 (-[X]) -> Lớp
    - Character 2: Level 4 (----[X]) -> Môn  
    - Character 3: Level 7 (-------[X]) -> Chương
    - Character 4: Fixed mapping -> Mức độ (N=Nhận biết, H=Thông hiểu, etc.)
    - Character 5: Level 10 (----------[X]) -> Bài
    - Character 6: Level 13 (-------------[X]) -> Dạng
    
    Example: [0P1H3-7] -> "Lớp 10; 10-NGÂN HÀNG CHÍNH; Mệnh đề và tập hợp; Thông hiểu; Các phép toán tập hợp; Các phép trên tập hợp với tham số m"
    """
    
    def __init__(self, map_code_parser: MapCodeParser = None):
        """
        Initialize TagGenerator.
        
        Args:
            map_code_parser: MapCodeParser instance. If None, creates a new one.
        """
        self.parser = map_code_parser or MapCodeParser()
    
    def generate_tags(self, question_code: str) -> str:
        """
        Generate semicolon-separated tags from QuestionCode following tree structure.

        Args:
            question_code: Question code like "[0P1H3-7]" or "0P1H3-7"

        Returns:
            Semicolon-separated tag string following the exact tree path
        """
        if not question_code:
            return ""

        # Extract code from brackets if present
        code = self._extract_code(question_code)
        if not code:
            return ""

        # Split by dash to get main part and optional suffix
        parts = code.split('-')
        main_code = parts[0]
        suffix = parts[1] if len(parts) > 1 else ""

        # Build path following tree structure
        path = self._build_tree_path(main_code, suffix)

        return "; ".join(path) if path else ""

    def _build_tree_path(self, main_code: str, suffix: str = "") -> List[str]:
        """
        Build the exact tree path for the given code.

        Args:
            main_code: Main part of the code (e.g., "0P1H3")
            suffix: Optional suffix after dash (e.g., "7")

        Returns:
            List of tags representing the exact path in the tree
        """
        if len(main_code) < 5:
            return []

        char1 = main_code[0]  # Lớp
        char2 = main_code[1]  # Môn
        char3 = main_code[2]  # Chương
        char4 = main_code[3]  # Mức độ
        char5 = main_code[4]  # Bài
        char6 = suffix        # Dạng

        # Find the exact path in the tree structure
        path = []

        # Level 1: Lớp (must match exactly)
        lop_tag = self.parser.get_level_1_tag(char1)
        if not lop_tag:
            return []
        path.append(lop_tag)

        # Level 2: Môn (must be under the correct Lớp)
        mon_tag = self.parser.get_level_4_tag_under_lop(char2, char1)
        if not mon_tag:
            return []
        path.append(mon_tag)

        # Level 3: Chương (must be under the correct Môn)
        chuong_tag = self.parser.get_level_7_tag_under_mon(char3, char1, char2)
        if not chuong_tag:
            return []
        path.append(chuong_tag)

        # Level 4: Mức độ (fixed mapping, always valid)
        mucdo_tag = self.parser.get_difficulty_tag(char4)
        if mucdo_tag:
            path.append(mucdo_tag)

        # Level 5: Bài (must be under the correct Chương)
        bai_tag = self.parser.get_level_10_tag_under_chuong(char5, char1, char2, char3)
        if bai_tag:
            path.append(bai_tag)

        # Level 6: Dạng (must be under the correct Bài)
        if char6:
            dang_tag = self.parser.get_level_13_tag_under_bai(char6, char1, char2, char3, char5)
            if dang_tag:
                path.append(dang_tag)

        return path
    
    def _extract_code(self, question_code: str) -> str:
        """
        Extract code from question code string.
        
        Args:
            question_code: Raw question code
            
        Returns:
            Cleaned code string
        """
        # Remove brackets if present
        code = question_code.strip()
        if code.startswith('[') and code.endswith(']'):
            code = code[1:-1]
        
        # Remove any whitespace
        code = code.strip()
        
        return code
    
    def generate_tag_breakdown(self, question_code: str) -> dict:
        """
        Generate detailed breakdown of tag generation for debugging.
        
        Args:
            question_code: Question code
            
        Returns:
            Dictionary with breakdown information
        """
        code = self._extract_code(question_code)
        if not code:
            return {"error": "Invalid question code"}
        
        parts = code.split('-')
        main_code = parts[0]
        suffix = parts[1] if len(parts) > 1 else ""
        
        breakdown = {
            "original_code": question_code,
            "extracted_code": code,
            "main_code": main_code,
            "suffix": suffix,
            "tags": []
        }
        
        # Character 1: Lớp
        if len(main_code) >= 1:
            char1 = main_code[0]
            tag1 = self.parser.get_level_1_tag(char1)
            breakdown["tags"].append({
                "position": 1,
                "character": char1,
                "type": "Lớp",
                "pattern": f"-[{char1}]",
                "tag": tag1 or "Not found"
            })
        
        # Character 2: Môn
        if len(main_code) >= 2:
            char2 = main_code[1]
            tag2 = self.parser.get_level_4_tag(char2)
            breakdown["tags"].append({
                "position": 2,
                "character": char2,
                "type": "Môn",
                "pattern": f"----[{char2}]",
                "tag": tag2 or "Not found"
            })
        
        # Character 3: Chương
        if len(main_code) >= 3:
            char3 = main_code[2]
            tag3 = self.parser.get_level_7_tag(char3)
            breakdown["tags"].append({
                "position": 3,
                "character": char3,
                "type": "Chương",
                "pattern": f"-------[{char3}]",
                "tag": tag3 or "Not found"
            })
        
        # Character 4: Mức độ
        if len(main_code) >= 4:
            char4 = main_code[3]
            tag4 = self.parser.get_difficulty_tag(char4)
            breakdown["tags"].append({
                "position": 4,
                "character": char4,
                "type": "Mức độ",
                "pattern": f"Fixed mapping [{char4}]",
                "tag": tag4 or "Not found"
            })
        
        # Character 5: Bài
        if len(main_code) >= 5:
            char5 = main_code[4]
            tag5 = self.parser.get_level_10_tag(char5)
            breakdown["tags"].append({
                "position": 5,
                "character": char5,
                "type": "Bài",
                "pattern": f"----------[{char5}]",
                "tag": tag5 or "Not found"
            })
        
        # Character 6: Dạng
        if suffix:
            tag6 = self.parser.get_level_13_tag(suffix)
            breakdown["tags"].append({
                "position": 6,
                "character": suffix,
                "type": "Dạng",
                "pattern": f"-------------[{suffix}]",
                "tag": tag6 or "Not found"
            })
        
        # Generate final tag string
        final_tags = []
        for tag_info in breakdown["tags"]:
            if tag_info["tag"] != "Not found":
                final_tags.append(tag_info["tag"])
        
        breakdown["final_tags"] = "; ".join(final_tags)
        
        return breakdown
