"""
Text Cleaner Utilities

Provides utilities for cleaning text content while preserving LaTeX formatting.
"""

import re
from typing import List, Tuple


class TextCleaner:
    """
    Utilities for cleaning text content while preserving important formatting.
    """
    
    # LaTeX math patterns to protect
    MATH_PATTERNS = [
        (r'\$[^$]*\$', '__INLINE_MATH_{}__'),           # $...$
        (r'\\\([^)]*\\\)', '__PAREN_MATH_{}__'),        # \(...\)
        (r'\\\[[^\]]*\\\]', '__BRACKET_MATH_{}__'),     # \[...\]
        (r'\\begin\{equation\}.*?\\end\{equation\}', '__EQUATION_{}__'),
        (r'\\begin\{align\}.*?\\end\{align\}', '__ALIGN_{}__'),
        (r'\\begin\{gather\}.*?\\end\{gather\}', '__GATHER_{}__'),
        (r'\\dfrac\{[^}]*\}\{[^}]*\}', '__DFRAC_{}__'),
        (r'\\frac\{[^}]*\}\{[^}]*\}', '__FRAC_{}__'),
        (r'\\sqrt\{[^}]*\}', '__SQRT_{}__'),
        (r'\\sum\{[^}]*\}', '__SUM_{}__'),
        (r'\\int\{[^}]*\}', '__INT_{}__'),
    ]
    
    @classmethod
    def clean_line_breaks(cls, text: str, preserve_paragraphs: bool = False) -> str:
        """
        Clean line breaks from text while preserving LaTeX math formatting.
        
        Args:
            text: Text to clean
            preserve_paragraphs: If True, preserve double line breaks as paragraph separators
            
        Returns:
            Text with line breaks cleaned but LaTeX math preserved
        """
        if not text:
            return text
            
        # Step 1: Protect LaTeX math expressions
        protected_patterns = []
        cleaned_text = text
        
        for pattern, placeholder_template in cls.MATH_PATTERNS:
            matches = re.findall(pattern, cleaned_text, re.DOTALL)
            for i, match in enumerate(matches):
                placeholder = placeholder_template.format(i)
                cleaned_text = cleaned_text.replace(match, placeholder, 1)
                protected_patterns.append((placeholder, match))
        
        # Step 2: Handle line breaks (both actual and literal escaped strings)
        if preserve_paragraphs:
            # Replace double line breaks with paragraph marker
            cleaned_text = re.sub(r'\n\s*\n', '__PARAGRAPH__', cleaned_text)
            cleaned_text = re.sub(r'\\n\s*\\n', '__PARAGRAPH__', cleaned_text)
            # Replace single line breaks with space
            cleaned_text = re.sub(r'\n', ' ', cleaned_text)
            cleaned_text = re.sub(r'\\n', ' ', cleaned_text)
            # Restore paragraph breaks
            cleaned_text = cleaned_text.replace('__PARAGRAPH__', ' ')
        else:
            # Replace all line breaks with space (both actual and literal escaped strings)
            cleaned_text = re.sub(r'[\r\n]+', ' ', cleaned_text)
            cleaned_text = re.sub(r'\\n', ' ', cleaned_text)  # Handle literal \n
            cleaned_text = re.sub(r'\\r', ' ', cleaned_text)  # Handle literal \r
            cleaned_text = re.sub(r'\\\\n', ' ', cleaned_text)  # Handle double-escaped \\n
            cleaned_text = re.sub(r'\\\\r', ' ', cleaned_text)  # Handle double-escaped \\r
        
        # Step 3: Clean up whitespace
        # Replace tabs with spaces
        cleaned_text = re.sub(r'\t', ' ', cleaned_text)
        cleaned_text = re.sub(r'\\t', ' ', cleaned_text)  # Handle escaped tabs

        # Replace multiple spaces with single space
        cleaned_text = re.sub(r' +', ' ', cleaned_text)
        
        # Step 4: Restore protected LaTeX math expressions
        for placeholder, original in protected_patterns:
            cleaned_text = cleaned_text.replace(placeholder, original)
        
        # Step 5: Final cleanup
        cleaned_text = cleaned_text.strip()
        
        return cleaned_text
    
    @classmethod
    def clean_csv_field(cls, text: str) -> str:
        """
        Clean text field for CSV export - removes all line breaks and normalizes whitespace.
        
        Args:
            text: Text to clean for CSV
            
        Returns:
            CSV-safe text without line breaks
        """
        if not text:
            return ""
            
        # Use clean_line_breaks without paragraph preservation
        cleaned = cls.clean_line_breaks(text, preserve_paragraphs=False)
        
        # Additional CSV-specific cleaning
        # Remove any remaining control characters except space
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', cleaned)
        
        # Normalize quotes for CSV safety (optional - CSV writer handles this)
        # cleaned = cleaned.replace('"', '""')
        
        return cleaned
    
    @classmethod
    def clean_answer_list(cls, answers_text: str) -> str:
        """
        Clean answer list text for CSV export.
        
        Args:
            answers_text: Semicolon-separated answers text
            
        Returns:
            Cleaned answers text
        """
        if not answers_text:
            return ""
            
        # Split by semicolon, clean each answer, then rejoin
        answers = answers_text.split(';')
        cleaned_answers = []
        
        for answer in answers:
            cleaned_answer = cls.clean_csv_field(answer.strip())
            if cleaned_answer:  # Only add non-empty answers
                cleaned_answers.append(cleaned_answer)
        
        return '; '.join(cleaned_answers)
    
    @classmethod
    def validate_csv_content(cls, text: str) -> Tuple[bool, List[str]]:
        """
        Validate that text is safe for CSV export.
        
        Args:
            text: Text to validate
            
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        if not text:
            return True, issues
            
        # Check for line breaks
        if '\n' in text or '\r' in text:
            issues.append("Contains line breaks")
            
        # Check for control characters
        if re.search(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', text):
            issues.append("Contains control characters")
            
        # Check for very long lines (potential issue)
        if len(text) > 10000:
            issues.append(f"Very long content ({len(text)} characters)")
            
        return len(issues) == 0, issues
