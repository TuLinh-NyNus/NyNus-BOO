"""
QuestionCode Parser

Handles parsing of QuestionCode patterns from LaTeX content.
"""

import re
from typing import Optional, Tuple
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question_code import QuestionCode


class QuestionCodeParser:
    """
    Parser for extracting and processing QuestionCode information from LaTeX content.
    """
    
    # Patterns for QuestionCode extraction
    ID_PATTERNS = [
        r'%\s*\[\s*([0-9A-Z]{5,6}(?:-[0-9A-Z])?)\s*\]\s*%?',  # %[200N0-0]%
        r'\[\s*([0-9A-Z]{5,6}(?:-[0-9A-Z])?)\s*\]',           # [200N0-0]
    ]
    
    # Patterns for Subcount extraction
    SUBCOUNT_PATTERNS = [
        r'%\s*\[\s*([A-Z]{2})\.(\d+)\s*\]\s*%?',  # %[TL.103528]%
        r'\[\s*([A-Z]{2})\.(\d+)\s*\]',           # [TL.103528]
        r'\{Subcount:\s*([A-Z]{2})\.(\d+)\s*\}',  # {Subcount: TL.103528}
        r'Subcnt:\s*([A-Z]{2})\.(\d+)',           # Subcnt: TL.103528
    ]
    
    # Pattern for Source extraction
    SOURCE_PATTERN = r'%\s*\[\s*Nguồn:?\s*([^\]]+)\s*\]\s*%?'
    
    @classmethod
    def extract_question_code(cls, latex_content: str) -> Optional[QuestionCode]:
        """
        Extract QuestionCode from LaTeX content.
        
        Args:
            latex_content: LaTeX content to parse
            
        Returns:
            QuestionCode instance or None if not found
        """
        for pattern in cls.ID_PATTERNS:
            match = re.search(pattern, latex_content)
            if match:
                code_string = match.group(1)
                return QuestionCode.from_code_string(code_string)
        
        return None
    
    @classmethod
    def extract_subcount(cls, latex_content: str) -> Optional[str]:
        """
        Extract subcount from LaTeX content.
        
        Args:
            latex_content: LaTeX content to parse
            
        Returns:
            Subcount string (e.g., "TL.103528") or None if not found
        """
        for pattern in cls.SUBCOUNT_PATTERNS:
            match = re.search(pattern, latex_content)
            if match:
                prefix = match.group(1)
                number = match.group(2)
                return f"{prefix}.{number}"
        
        return None
    
    @classmethod
    def extract_source(cls, latex_content: str) -> Optional[str]:
        """
        Extract source information from LaTeX content.
        
        Args:
            latex_content: LaTeX content to parse
            
        Returns:
            Source string or None if not found
        """
        match = re.search(cls.SOURCE_PATTERN, latex_content)
        if match:
            return match.group(1).strip()
        
        return None
    
    @classmethod
    def parse_metadata(cls, latex_content: str) -> Tuple[Optional[QuestionCode], Optional[str], Optional[str]]:
        """
        Extract all metadata from LaTeX content.
        
        Args:
            latex_content: LaTeX content to parse
            
        Returns:
            Tuple of (QuestionCode, subcount, source)
        """
        question_code = cls.extract_question_code(latex_content)
        subcount = cls.extract_subcount(latex_content)
        source = cls.extract_source(latex_content)
        
        return question_code, subcount, source
    
    @classmethod
    def validate_question_code_format(cls, code_string: str) -> bool:
        """
        Validate QuestionCode format.
        
        Args:
            code_string: Code string to validate
            
        Returns:
            True if format is valid, False otherwise
        """
        if not code_string:
            return False
        
        # Remove brackets if present
        code_string = code_string.strip('[]')
        
        # Check ID5 format (5 characters)
        if re.match(r'^[0-9A-Z]{5}$', code_string):
            return True
        
        # Check ID6 format (5 characters + dash + 1 character)
        if re.match(r'^[0-9A-Z]{5}-[0-9A-Z]$', code_string):
            return True
        
        return False
    
    @classmethod
    def validate_subcount_format(cls, subcount: str) -> bool:
        """
        Validate subcount format.
        
        Args:
            subcount: Subcount string to validate
            
        Returns:
            True if format is valid, False otherwise
        """
        if not subcount:
            return False
        
        # Check format: XX.NNNNN (2 uppercase letters, dot, numbers)
        return bool(re.match(r'^[A-Z]{2}\.\d+$', subcount))
