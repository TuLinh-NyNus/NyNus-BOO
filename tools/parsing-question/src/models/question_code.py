"""
QuestionCode Data Model

Defines the QuestionCode structure for question classification.
"""

from dataclasses import dataclass
from typing import Optional, List
import re


@dataclass
class QuestionCode:
    """
    QuestionCode data model matching the database schema.
    
    Represents the hierarchical classification of questions:
    - code: Primary key (e.g., "200N0-0")
    - format: ID5 or ID6 format
    - grade: Grade level (0-9, A, B, C)
    - subject: Subject code (P=Math, L=Physics, H=Chemistry, etc.)
    - chapter: Chapter number (1-9)
    - lesson: Lesson identifier (1-9, A-Z)
    - form: Form/type identifier (1-9, only for ID6)
    - level: Difficulty level (N,H,V,C,T,M)
    """
    
    code: str  # Primary key
    format: str  # "ID5" or "ID6"
    grade: str  # Single character
    subject: str  # Single character
    chapter: str  # Single character
    lesson: str  # Single character
    level: str  # Single character
    form: Optional[str] = None  # Single character, only for ID6
    
    @classmethod
    def from_code_string(cls, code_string: str) -> Optional['QuestionCode']:
        """
        Parse a QuestionCode from string format.
        
        Args:
            code_string: Code in format like "200N0-0" or "1P1V1"
            
        Returns:
            QuestionCode instance or None if parsing fails
        """
        if not code_string:
            return None
        
        # Remove brackets if present
        code_string = code_string.strip('[]')
        
        # Determine format based on presence of dash
        if '-' in code_string:
            # ID6 format: XXXXX-X
            if not re.match(r'^[0-9A-Z]{5}-[0-9A-Z]$', code_string):
                return None
            
            main_part, form_part = code_string.split('-')
            format_type = "ID6"
            form = form_part
        else:
            # ID5 format: XXXXX
            if not re.match(r'^[0-9A-Z]{5}$', code_string):
                return None
            
            main_part = code_string
            format_type = "ID5"
            form = None
        
        # Parse main part: GLCLL (Grade, Subject, Chapter, Level, Lesson)
        if len(main_part) != 5:
            return None

        grade = main_part[0]
        subject = main_part[1]
        chapter = main_part[2]
        raw_level = main_part[3]
        lesson = main_part[4]

        # Validate raw level before mapping
        allowed_raw_levels = ['N', 'H', 'V', 'C', 'T', 'M', 'Y', 'B', 'K', 'G']
        if raw_level not in allowed_raw_levels:
            return None  # Invalid level, cannot parse

        # Apply level mapping for new level types
        level = cls._map_level(raw_level)
        
        return cls(
            code=code_string,
            format=format_type,
            grade=grade,
            subject=subject,
            chapter=chapter,
            lesson=lesson,
            level=level,
            form=form
        )

    @classmethod
    def _map_level(cls, raw_level: str) -> str:
        """
        Map level characters to standard levels.

        Standard levels: N, H, V, C, T, N
        New level mappings:
        - Y → N (Nhận biết)
        - B → H (Hiểu)
        - K → V (Vận dụng)
        - G → C (Vận dụng cao)

        Args:
            raw_level: Original level character

        Returns:
            Mapped level character
        """
        level_mapping = {
            'Y': 'N',  # Y → N (Nhận biết)
            'B': 'H',  # B → H (Hiểu)
            'K': 'V',  # K → V (Vận dụng)
            'G': 'C',  # G → C (Vận dụng cao)
        }

        return level_mapping.get(raw_level, raw_level)
    
    def to_csv_dict(self) -> dict:
        """Convert to dictionary for CSV export."""
        return {
            'code': self.code,
            'format': self.format,
            'grade': self.grade,
            'subject': self.subject,
            'chapter': self.chapter,
            'lesson': self.lesson,
            'form': self.form,
            'level': self.level
        }
    
    def validate(self) -> List[str]:
        """Validate QuestionCode data and return list of errors."""
        errors = []
        
        if not self.code:
            errors.append("code is required")
        
        if self.format not in ['ID5', 'ID6']:
            errors.append(f"Invalid format: {self.format}")
        
        if self.format == 'ID6' and not self.form:
            errors.append("ID6 format requires form field")
        
        if self.format == 'ID5' and self.form:
            errors.append("ID5 format should not have form field")
        
        # Validate single character fields
        single_char_fields = ['grade', 'subject', 'chapter', 'lesson', 'level']
        if self.form:
            single_char_fields.append('form')
        
        for field_name in single_char_fields:
            field_value = getattr(self, field_name)
            if not field_value or len(field_value) != 1:
                errors.append(f"{field_name} must be a single character")
        
        # Validate level is one of the standard values (after mapping)
        standard_levels = ['N', 'H', 'V', 'C', 'T', 'M']
        if self.level not in standard_levels:
            errors.append(f"Invalid level: {self.level}. Must be one of {','.join(standard_levels)}")
        
        return errors
    
    def __str__(self) -> str:
        """String representation of the QuestionCode."""
        return self.code
