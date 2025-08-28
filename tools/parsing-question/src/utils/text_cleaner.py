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
        Clean text while preserving LaTeX math formatting and line breaks.

        Args:
            text: Text to clean
            preserve_paragraphs: Not used anymore, kept for compatibility

        Returns:
            Text with LaTeX math preserved and basic whitespace cleanup
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

        # Step 2: Basic whitespace cleanup (preserve line breaks)
        # Replace tabs with spaces
        cleaned_text = re.sub(r'\t', ' ', cleaned_text)
        cleaned_text = re.sub(r'\\t', ' ', cleaned_text)  # Handle escaped tabs

        # Replace multiple spaces with single space (but preserve line breaks)
        cleaned_text = re.sub(r'[ ]+', ' ', cleaned_text)

        # Step 3: Restore protected LaTeX math expressions
        for placeholder, original in protected_patterns:
            cleaned_text = cleaned_text.replace(placeholder, original)

        # Step 4: Final cleanup (preserve line breaks)
        cleaned_text = cleaned_text.strip()

        return cleaned_text

    @classmethod
    def convert_newlines_to_literal(cls, text: str) -> str:
        """
        Convert actual newlines to literal \\n for CSV storage.

        Double-escapes newlines to prevent Python csv module from interpreting them.

        Args:
            text: Text to convert

        Returns:
            Text with newlines converted to double-escaped \\\\n
        """
        if not text:
            return text

        # Convert actual newlines to literal \\n (2 characters: backslash + n)
        cleaned_text = text.replace('\r\n', '\\n')  # Windows CRLF
        cleaned_text = cleaned_text.replace('\r', '\\n')    # Mac CR
        cleaned_text = cleaned_text.replace('\n', '\\n')    # Unix LF

        return cleaned_text



    @classmethod
    def clean_csv_field(cls, text: str) -> str:
        """
        Clean text field for CSV export - remove newlines and basic cleaning.

        Args:
            text: Text to clean for CSV

        Returns:
            CSV-safe text with newlines removed and replaced with spaces
        """
        if not text:
            return ""

        # Remove actual newlines and replace with spaces
        cleaned = text.replace('\r\n', ' ')  # Windows CRLF
        cleaned = cleaned.replace('\r', ' ')  # Mac CR
        cleaned = cleaned.replace('\n', ' ')  # Unix LF

        # Remove literal \n strings and replace with spaces
        cleaned = cleaned.replace('\\n', ' ')

        # Remove multiple spaces and normalize
        cleaned = re.sub(r'\s+', ' ', cleaned)

        # Remove control characters except spaces and tabs
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', cleaned)

        # Trim whitespace
        cleaned = cleaned.strip()

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

        # Check for control characters (excluding newlines and carriage returns)
        if re.search(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', text):
            issues.append("Contains control characters")

        # Check for very long lines (potential issue)
        if len(text) > 100000:
            issues.append(f"Very long content ({len(text)} characters)")

        return len(issues) == 0, issues

    @classmethod
    def prepare_for_storage(cls, text: str) -> str:
        """
        Prepare text for storage in database/CSV - convert newlines to literal \\n.

        This is the canonical method for preparing content for storage.
        Used for rawContent and content fields in Question model.

        Args:
            text: Text to prepare for storage

        Returns:
            Text with actual newlines converted to literal \\n for safe storage
        """
        return cls.convert_newlines_to_literal(text)

    @classmethod
    def prepare_for_display(cls, text: str) -> str:
        """
        Prepare text for display in UI - convert literal \\n to actual newlines.

        This is the canonical method for preparing stored content for display.
        Used in Streamlit app and other UI components.

        Args:
            text: Text with literal \\n to convert for display

        Returns:
            Text with literal \\n converted to actual newlines for display
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

        # Step 2: Convert literal \\n to actual newlines for display
        cleaned_text = cleaned_text.replace('\\n', '\n')
        cleaned_text = cleaned_text.replace('\\t', '\t')
        cleaned_text = cleaned_text.replace('\\\\', '\n')  # LaTeX line breaks

        # Step 3: Restore protected LaTeX math expressions
        for placeholder, original in protected_patterns:
            cleaned_text = cleaned_text.replace(placeholder, original)

        # Step 4: Basic cleanup for display
        cleaned_text = re.sub(r' +', ' ', cleaned_text)  # Multiple spaces to single
        cleaned_text = cleaned_text.strip()

        return cleaned_text

    @classmethod
    def prepare_for_csv(cls, text: str) -> str:
        """
        Prepare text for CSV export - remove all newlines and normalize.

        This is the canonical method for preparing content for CSV export.
        Removes both actual newlines and literal \\n strings.

        Args:
            text: Text to prepare for CSV export

        Returns:
            Text with all newlines removed and replaced with spaces
        """
        return cls.clean_csv_field(text)
