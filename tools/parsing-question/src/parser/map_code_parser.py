"""
MapCode Parser

Parses MapCode.md file to create lookup dictionaries for tag generation.
"""

import os
import re
from typing import Dict, Optional


class MapCodeParser:
    """
    Parses MapCode.md file and creates lookup dictionaries for tag generation.
    
    Supports different dash levels:
    - 1 dash: -[X] (Lớp)
    - 4 dashes: ----[X] (Môn)  
    - 7 dashes: -------[X] (Chương)
    - 10 dashes: ----------[X] (Bài)
    - 13 dashes: -------------[X] (Dạng)
    """
    
    def __init__(self, map_code_file: str = None):
        """
        Initialize MapCodeParser.
        
        Args:
            map_code_file: Path to MapCode.md file
        """
        if map_code_file is None:
            # Use the actual Map ID.tex file that user has open
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Try multiple possible locations for Map ID.tex
            possible_paths = [
                os.path.join(current_dir, '..', '..', '..', 'temp1', 'web', 'DATA', 'template', 'Map ID.tex'),
                os.path.join(current_dir, 'MapCode.md'),  # Correct path - same directory
                os.path.join(current_dir, '..', 'Map ID.tex')   # Alternative
            ]

            map_code_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    map_code_file = path
                    break

            if map_code_file is None:
                # Default fallback - correct path
                map_code_file = os.path.join(current_dir, 'MapCode.md')
        
        self.map_code_file = map_code_file

        # Tree structure: path-based mapping
        self.tree_structure = {}  # Full tree structure

        # Legacy flat maps (for backward compatibility)
        self.level_1_map = {}  # -[X] -> content
        self.level_4_map = {}  # ----[X] -> content
        self.level_7_map = {}  # -------[X] -> content
        self.level_10_map = {} # ----------[X] -> content
        self.level_13_map = {} # -------------[X] -> content
        
        # Difficulty level mapping (fixed)
        self.difficulty_map = {
            'N': 'Nhận biết',
            'H': 'Thông hiểu', 
            'V': 'VD',
            'C': 'VD Cao',
            'T': 'VIP',  # Updated from file
            'M': 'Note', # Updated from file
            # Alternative mappings
            'Y': 'Nhận biết',  # Y -> N
            'B': 'Thông hiểu', # B -> H
            'K': 'VD',         # K -> V
            'G': 'VD Cao'      # G -> C
        }
        
        self._parse_map_code_file()
        self._build_tree_structure()
    
    def _parse_map_code_file(self):
        """Parse the MapCode.md file and populate lookup dictionaries."""
        if not os.path.exists(self.map_code_file):
            print(f"Warning: MapCode.md file not found at {self.map_code_file}")
            return
        
        try:
            with open(self.map_code_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('%'):
                    continue
                
                # Parse different dash levels
                self._parse_line(line)
                
        except Exception as e:
            print(f"Error parsing MapCode.md: {e}")
    
    def _parse_line(self, line: str):
        """Parse a single line and extract mapping information."""
        # Level 1: -[X] content
        match = re.match(r'^-\[([^\]]+)\]\s*(.+)$', line)
        if match:
            key, content = match.groups()
            self.level_1_map[key] = content.strip()
            return
        
        # Level 4: ----[X] content  
        match = re.match(r'^----\[([^\]]+)\]\s*(.+)$', line)
        if match:
            key, content = match.groups()
            self.level_4_map[key] = content.strip()
            return
        
        # Level 7: -------[X] content
        match = re.match(r'^-------\[([^\]]+)\]\s*(.+)$', line)
        if match:
            key, content = match.groups()
            self.level_7_map[key] = content.strip()
            return
        
        # Level 10: ----------[X] content
        match = re.match(r'^----------\[([^\]]+)\]\s*(.+)$', line)
        if match:
            key, content = match.groups()
            self.level_10_map[key] = content.strip()
            return
        
        # Level 13: -------------[X] content
        match = re.match(r'^-------------\[([^\]]+)\]\s*(.+)$', line)
        if match:
            key, content = match.groups()
            self.level_13_map[key] = content.strip()
            return
    
    def get_level_1_tag(self, key: str) -> Optional[str]:
        """Get level 1 tag (Lớp) for given key."""
        return self.level_1_map.get(key)
    
    def get_level_4_tag(self, key: str) -> Optional[str]:
        """Get level 4 tag (Môn) for given key."""
        return self.level_4_map.get(key)
    
    def get_level_7_tag(self, key: str) -> Optional[str]:
        """Get level 7 tag (Chương) for given key."""
        return self.level_7_map.get(key)
    
    def get_difficulty_tag(self, key: str) -> Optional[str]:
        """Get difficulty tag for given key."""
        return self.difficulty_map.get(key)
    
    def get_level_10_tag(self, key: str) -> Optional[str]:
        """Get level 10 tag (Bài) for given key."""
        return self.level_10_map.get(key)
    
    def get_level_13_tag(self, key: str) -> Optional[str]:
        """Get level 13 tag (Dạng) for given key."""
        return self.level_13_map.get(key)
    
    def get_stats(self) -> Dict[str, int]:
        """Get statistics about parsed mappings."""
        return {
            'level_1_entries': len(self.level_1_map),
            'level_4_entries': len(self.level_4_map),
            'level_7_entries': len(self.level_7_map),
            'level_10_entries': len(self.level_10_map),
            'level_13_entries': len(self.level_13_map),
            'difficulty_entries': len(self.difficulty_map)
        }

    def get_level_4_tag_under_lop(self, char: str, lop_char: str) -> str:
        """Get level 4 tag that belongs under the specified Lớp."""
        path_key = f"{lop_char}->{char}"
        if path_key in self.tree_structure:
            return self.tree_structure[path_key]['content']
        return self.level_4_map.get(char, "")

    def get_level_7_tag_under_mon(self, char: str, lop_char: str, mon_char: str) -> str:
        """Get level 7 tag that belongs under the specified Lớp and Môn."""
        path_key = f"{lop_char}->{mon_char}->{char}"
        if path_key in self.tree_structure:
            return self.tree_structure[path_key]['content']
        return self.level_7_map.get(char, "")

    def get_level_10_tag_under_chuong(self, char: str, lop_char: str, mon_char: str, chuong_char: str) -> str:
        """Get level 10 tag that belongs under the specified Lớp->Môn->Chương."""
        path_key = f"{lop_char}->{mon_char}->{chuong_char}->{char}"
        if path_key in self.tree_structure:
            return self.tree_structure[path_key]['content']
        return self.level_10_map.get(char, "")

    def get_level_13_tag_under_bai(self, char: str, lop_char: str, mon_char: str, chuong_char: str, bai_char: str) -> str:
        """Get level 13 tag that belongs under the specified Lớp->Môn->Chương->Bài."""
        path_key = f"{lop_char}->{mon_char}->{chuong_char}->{bai_char}->{char}"
        if path_key in self.tree_structure:
            return self.tree_structure[path_key]['content']
        return self.level_13_map.get(char, "")

    def _build_tree_structure(self):
        """Build tree structure from parsed data."""
        self.tree_structure = {}

        if not os.path.exists(self.map_code_file):
            return

        try:
            with open(self.map_code_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            current_path = []  # Track current position in tree

            for line in lines:
                line = line.strip()
                if not line or line.startswith('%'):
                    continue

                # Count dashes to determine level
                dash_count = 0
                for char in line:
                    if char == '-':
                        dash_count += 1
                    else:
                        break

                # Parse the content: -[X] Content or ----[X] Content
                if dash_count > 0 and '[' in line and ']' in line:
                    # Extract key and content
                    bracket_start = line.find('[')
                    bracket_end = line.find(']')
                    if bracket_start != -1 and bracket_end != -1:
                        key = line[bracket_start + 1:bracket_end]
                        content = line[bracket_end + 1:].strip()

                        # Determine level based on dash count
                        level = self._get_level_from_dash_count(dash_count)

                        # Update current path
                        if level == 1:  # Lớp
                            current_path = [key]
                        elif level == 2:  # Môn
                            if len(current_path) >= 1:
                                current_path = current_path[:1] + [key]
                        elif level == 3:  # Chương
                            if len(current_path) >= 2:
                                current_path = current_path[:2] + [key]
                        elif level == 4:  # Bài
                            if len(current_path) >= 3:
                                current_path = current_path[:3] + [key]
                        elif level == 5:  # Dạng
                            if len(current_path) >= 4:
                                current_path = current_path[:4] + [key]

                        # Store in tree structure
                        path_key = '->'.join(current_path)
                        if path_key not in self.tree_structure:
                            self.tree_structure[path_key] = {}

                        self.tree_structure[path_key]['content'] = content
                        self.tree_structure[path_key]['level'] = level
                        self.tree_structure[path_key]['key'] = key
                        self.tree_structure[path_key]['path'] = current_path.copy()

        except Exception as e:
            print(f"Error building tree structure: {e}")

    def _get_level_from_dash_count(self, dash_count: int) -> int:
        """Convert dash count to level number."""
        if dash_count == 1:
            return 1  # Lớp
        elif dash_count == 4:
            return 2  # Môn
        elif dash_count == 7:
            return 3  # Chương
        elif dash_count == 10:
            return 4  # Bài
        elif dash_count == 13:
            return 5  # Dạng
        else:
            return 0  # Unknown
