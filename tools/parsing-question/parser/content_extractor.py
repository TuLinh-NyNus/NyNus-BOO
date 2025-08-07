"""
Content Extractor

Implements the 7-step content cleaning process for LaTeX questions.
"""

import re
from typing import List, Tuple
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from parser.bracket_parser import BracketParser


class ContentExtractor:
    """
    Extracts and cleans question content from LaTeX following the 7-step process:
    1. Extract content from ex environment
    2. Remove metadata patterns
    3. Handle layout commands
    4. Remove image commands
    5. Remove answer commands
    6. Remove solution section
    7. Normalize whitespace
    """
    
    # Patterns for metadata removal
    METADATA_PATTERNS = [
        r'%\s*\[\s*[0-9A-Z]{5,6}(?:-[0-9A-Z])?\s*\]\s*%?',  # QuestionCode
        r'%\s*\[\s*Nguồn:?[^\]]+\s*\]\s*%?',                 # Source
        r'\[\s*[A-Z]{2}\.\d+\s*\]',                          # Subcount
    ]
    
    # Patterns for image environments
    IMAGE_PATTERNS = [
        r'\\begin\{center\}[\s\S]*?\\end\{center\}',
        r'\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}',
        r'\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}',
        r'\\begin\{figure\}[\s\S]*?\\end\{figure\}',
    ]
    
    # Patterns for answer commands
    ANSWER_PATTERNS = [
        r'\\choice(?:\[[0-9]\])?(?:\s*\{[^}]*\})*',
        r'\\choiceTF(?:\[[t12]\])?(?:\s*\{[^}]*\})*',
        r'\\choiceTFt(?:\s*\{[^}]*\})*',
        r'\\shortans(?:\[[a-z0-9]+\])?(?:\s*\{[^}]*\})*',
        r'\\matching(?:\s*\{[^}]*\})*',
    ]
    
    # Pattern for solution section
    SOLUTION_PATTERN = r'\\loigiai\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}'
    
    @classmethod
    def extract_from_ex_environment(cls, latex_content: str) -> str:
        """
        Step 1: Extract content from \begin{ex}...\end{ex} environment.
        
        Args:
            latex_content: Full LaTeX content
            
        Returns:
            Content inside ex environment
        """
        environments = BracketParser.extract_environment_content(latex_content, "ex")
        if environments:
            return environments[0]  # Return first ex environment
        return ""
    
    @classmethod
    def remove_metadata_patterns(cls, content: str) -> str:
        """
        Step 2: Remove metadata patterns (questionCode, source, subcount).
        
        Args:
            content: Content to clean
            
        Returns:
            Content with metadata removed
        """
        for pattern in cls.METADATA_PATTERNS:
            content = re.sub(pattern, '', content, flags=re.MULTILINE)
        return content
    
    @classmethod
    def handle_layout_commands(cls, content: str) -> str:
        """
        Step 3: Handle layout commands (immini).
        
        For 2-column layout with \immini[thm]{content1}{content2}, keep content1 only.
        
        Args:
            content: Content to process
            
        Returns:
            Content with layout commands processed
        """
        # Pattern for \immini[optional]{content1}{content2}
        immini_pattern = r'\\immini(?:\[[^\]]*\])?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}'
        
        def replace_immini(match):
            # Extract first argument (content1)
            first_arg = match.group(1)
            return first_arg
        
        content = re.sub(immini_pattern, replace_immini, content)
        return content
    
    @classmethod
    def remove_image_commands(cls, content: str) -> str:
        """
        Step 4: Remove image commands and environments.
        
        Args:
            content: Content to clean
            
        Returns:
            Content with images removed
        """
        for pattern in cls.IMAGE_PATTERNS:
            content = re.sub(pattern, '', content, flags=re.DOTALL)
        return content
    
    @classmethod
    def remove_answer_commands(cls, content: str) -> str:
        """
        Step 5: Remove answer commands.
        
        Args:
            content: Content to clean
            
        Returns:
            Content with answer commands removed
        """
        # Use bracket-aware parsing for better accuracy
        for pattern in cls.ANSWER_PATTERNS:
            content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # Additional cleanup for remaining answer fragments
        content = re.sub(r'\{\\True[^}]*\}', '', content)
        content = re.sub(r'\{[^}]*\}(?=\s*\{)', '', content)  # Remove isolated answer options
        
        return content
    
    @classmethod
    def remove_solution_section(cls, content: str) -> str:
        """
        Step 6: Remove solution section (\loigiai{...}).
        
        Args:
            content: Content to clean
            
        Returns:
            Content with solution removed
        """
        # Use bracket-aware parsing for nested braces
        loigiai_start = content.find('\\loigiai')
        if loigiai_start != -1:
            # Find the opening brace after \loigiai
            brace_start = content.find('{', loigiai_start)
            if brace_start != -1:
                # Extract content using bracket parser
                solution_content = BracketParser.extract_content_from_braces(content, brace_start)
                # Remove the entire \loigiai{...} block
                solution_end = brace_start + len(solution_content) + 2  # +2 for braces
                content = content[:loigiai_start] + content[solution_end:]
        
        return content
    
    @classmethod
    def normalize_whitespace(cls, content: str) -> str:
        """
        Step 7: Normalize whitespace.
        
        Args:
            content: Content to normalize
            
        Returns:
            Content with normalized whitespace
        """
        # Remove leading/trailing whitespace
        content = content.strip()
        
        # Replace multiple spaces with single space
        content = re.sub(r' +', ' ', content)
        
        # Remove empty lines but preserve paragraph breaks
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:  # Keep non-empty lines
                cleaned_lines.append(line)
            elif cleaned_lines and cleaned_lines[-1]:  # Add single empty line for paragraph break
                cleaned_lines.append('')
        
        # Remove trailing empty lines
        while cleaned_lines and not cleaned_lines[-1]:
            cleaned_lines.pop()
        
        return '\n'.join(cleaned_lines)
    
    @classmethod
    def extract_clean_content(cls, latex_content: str) -> Tuple[str, str]:
        """
        Apply all 7 steps to extract clean content.
        
        Args:
            latex_content: Full LaTeX content
            
        Returns:
            Tuple of (raw_content, clean_content)
        """
        # Step 1: Extract from ex environment
        raw_content = cls.extract_from_ex_environment(latex_content)
        
        if not raw_content:
            return "", ""
        
        # Apply cleaning steps
        content = raw_content
        
        # Step 2: Remove metadata patterns
        content = cls.remove_metadata_patterns(content)
        
        # Step 3: Handle layout commands
        content = cls.handle_layout_commands(content)
        
        # Step 4: Remove image commands
        content = cls.remove_image_commands(content)
        
        # Step 5: Remove answer commands
        content = cls.remove_answer_commands(content)
        
        # Step 6: Remove solution section
        content = cls.remove_solution_section(content)
        
        # Step 7: Normalize whitespace
        content = cls.normalize_whitespace(content)
        
        return raw_content, content
