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
from utils.text_cleaner import TextCleaner


class ContentExtractor:
    """
    Extracts and cleans question content from LaTeX following the 6-step process:
    1. Extract content from ex environment
    2. Remove metadata patterns
    3. Remove image commands
    4. Remove answer commands and their content completely
    5. Remove solution section
    6. Normalize whitespace
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
    
    # Pattern for solution section - improved for nested braces
    SOLUTION_PATTERN = r'\\loigiai\s*\{.*?\}'
    
    @classmethod
    def extract_from_ex_environment(cls, latex_content: str) -> str:
        """
        Step 1: Extract content from \\begin{ex}...\\end{ex} environment.
        
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
        
        For 2-column layout with \\immini[thm]{content1}{content2}, keep content1 only.
        
        Args:
            content: Content to process
            
        Returns:
            Content with layout commands processed
        """
        # Handle \immini[optional]{content1}{content2} commands
        # Extract only the first argument (content1) and discard the second (usually image)

        # Multiple passes to handle all \immini commands
        max_iterations = 10
        iteration = 0

        while '\\immini' in content and iteration < max_iterations:
            iteration += 1

            # Use regex first for simple cases
            immini_pattern = r'\\immini(?:\[[^\]]*\])?\s*\{([^{}]*)\}\s*\{[^{}]*\}'

            def replace_simple_immini(match):
                return match.group(1).strip()

            # Apply simple regex replacement
            new_content = re.sub(immini_pattern, replace_simple_immini, content)

            # If regex worked, use the result
            if new_content != content:
                content = new_content
                continue

        # Handle nested cases with a simpler approach if regex fails
        while '\\immini' in content:
            start_pos = content.find('\\immini')
            if start_pos == -1:
                break

            # Find the start of the first brace
            first_brace = content.find('{', start_pos)
            if first_brace == -1:
                break

            # Count braces to find the end of first argument
            brace_count = 1
            pos = first_brace + 1
            first_arg_end = -1

            while pos < len(content) and brace_count > 0:
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        first_arg_end = pos
                        break
                pos += 1

            if first_arg_end == -1:
                break

            # Extract first argument
            first_arg = content[first_brace + 1:first_arg_end]

            # Find second argument start
            second_brace = content.find('{', first_arg_end + 1)
            if second_brace == -1:
                # No second argument, just replace with first
                content = content[:start_pos] + first_arg + content[first_arg_end + 1:]
                continue

            # Count braces to find end of second argument
            brace_count = 1
            pos = second_brace + 1
            second_arg_end = -1

            while pos < len(content) and brace_count > 0:
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        second_arg_end = pos
                        break
                pos += 1

            if second_arg_end == -1:
                break

            # Replace entire \immini command with just the first argument
            content = content[:start_pos] + first_arg + content[second_arg_end + 1:]
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
        Step 4: Remove answer commands and their content completely.

        Loại bỏ hoàn toàn các lệnh đáp án và nội dung của chúng để chỉ giữ lại câu hỏi thuần túy.

        Args:
            content: Content to clean

        Returns:
            Content with answer commands and their content completely removed
        """
        # Bảo vệ LaTeX math expressions trước khi xử lý
        protected_patterns = []

        # Protect \dfrac{}{} patterns
        dfrac_pattern = r'\\dfrac\{([^}]*)\}\{([^}]*)\}'
        dfrac_matches = re.findall(dfrac_pattern, content)
        for i, (num, den) in enumerate(dfrac_matches):
            placeholder = f"__DFRAC_{i}__"
            content = content.replace(f'\\dfrac{{{num}}}{{{den}}}', placeholder, 1)
            protected_patterns.append((placeholder, f'\\dfrac{{{num}}}{{{den}}}'))

        # Protect \frac{}{} patterns
        frac_pattern = r'\\frac\{([^}]*)\}\{([^}]*)\}'
        frac_matches = re.findall(frac_pattern, content)
        for i, (num, den) in enumerate(frac_matches):
            placeholder = f"__FRAC_{i}__"
            content = content.replace(f'\\frac{{{num}}}{{{den}}}', placeholder, 1)
            protected_patterns.append((placeholder, f'\\frac{{{num}}}{{{den}}}'))

        # Protect other math commands
        math_patterns = [
            (r'\\sqrt\{([^}]*)\}', '__SQRT_{}__'),
            (r'\\sum\{([^}]*)\}', '__SUM_{}__'),
            (r'\\int\{([^}]*)\}', '__INT_{}__'),
        ]

        for pattern, placeholder_template in math_patterns:
            matches = re.findall(pattern, content)
            for i, match in enumerate(matches):
                placeholder = placeholder_template.format(i)
                content = content.replace(f'\\{pattern.split("{")[0][2:]}{{{match}}}', placeholder, 1)
                protected_patterns.append((placeholder, f'\\{pattern.split("{")[0][2:]}{{{match}}}'))

        # STRATEGY: Chỉ giữ lại phần từ đầu đến trước khi gặp answer commands
        # Tìm vị trí đầu tiên của answer commands và cắt tại đó

        # Tìm vị trí của các answer commands
        answer_positions = []

        # Tìm \choiceTF
        choicetf_match = re.search(r'\\choiceTF(?:\[[t12]\])?', content)
        if choicetf_match:
            answer_positions.append(choicetf_match.start())

        # Tìm \choice
        choice_match = re.search(r'\\choice(?:\[[0-9]\])?', content)
        if choice_match:
            answer_positions.append(choice_match.start())

        # Tìm \shortans
        shortans_match = re.search(r'\\shortans(?:\[[^\]]*\])?', content)
        if shortans_match:
            answer_positions.append(shortans_match.start())

        # Nếu tìm thấy answer commands, cắt content tại vị trí đầu tiên
        if answer_positions:
            cut_position = min(answer_positions)
            content = content[:cut_position]

        # Loại bỏ các fragments còn sót lại
        content = re.sub(r'\{\\True\s+[^}]*\}', '', content, flags=re.DOTALL)
        content = re.sub(r'\{\\False\s+[^}]*\}', '', content, flags=re.DOTALL)

        # Clean up remaining markers
        content = re.sub(r'\\True\s*', '', content)
        content = re.sub(r'\\False\s*', '', content)

        # Restore protected LaTeX math patterns
        for placeholder, original in protected_patterns:
            content = content.replace(placeholder, original)

        return content
    
    @classmethod
    def remove_solution_section(cls, content: str) -> str:
        """
        Step 6: Remove solution section (\\loigiai{...}).

        Args:
            content: Content to clean

        Returns:
            Content with solution removed
        """
        # Use improved approach to handle nested braces
        while True:
            loigiai_start = content.find('\\loigiai')
            if loigiai_start == -1:
                break

            # Find the opening brace after \loigiai
            brace_start = content.find('{', loigiai_start)
            if brace_start == -1:
                break

            # Count braces to find the matching closing brace
            brace_count = 0
            pos = brace_start

            while pos < len(content):
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # Found matching closing brace
                        solution_end = pos + 1
                        content = content[:loigiai_start] + content[solution_end:]
                        break
                pos += 1
            else:
                # No matching brace found, remove from loigiai to end
                content = content[:loigiai_start]
                break

        return content
    
    @classmethod
    def normalize_whitespace(cls, content: str) -> str:
        """
        Step 7: Normalize whitespace and convert newlines to literal for CSV export.

        Args:
            content: Content to normalize

        Returns:
            Content with normalized whitespace and newlines converted to literal \n
        """
        # Convert actual newlines to literal \n for CSV safety
        content = TextCleaner.convert_newlines_to_literal(content)

        # Basic whitespace normalization
        content = content.strip()

        # Replace multiple spaces with single space
        content = re.sub(r'[ ]+', ' ', content)

        return content
    
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

        # Step 2: Remove \begin{ex} and \end{ex} tags from clean content
        content = re.sub(r'\\begin\{ex\}', '', content)
        content = re.sub(r'\\end\{ex\}', '', content)

        # Step 3: Remove metadata patterns
        content = cls.remove_metadata_patterns(content)

        # Step 3: Remove image commands (bỏ bước handle_layout_commands)
        content = cls.remove_image_commands(content)

        # Step 4: Remove answer commands and their content completely
        content = cls.remove_answer_commands(content)

        # Step 5: Remove solution section
        content = cls.remove_solution_section(content)

        # Step 6: Normalize whitespace
        content = cls.normalize_whitespace(content)
        
        return raw_content, content
