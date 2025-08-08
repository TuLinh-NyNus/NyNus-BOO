"""
Bracket-aware LaTeX Parser

Provides utilities for parsing LaTeX content with proper bracket handling,
avoiding the pitfalls of regex-based parsing for nested structures.
"""

from typing import List, Optional, Tuple
import re


class BracketParser:
    """
    Bracket-aware parser for LaTeX content.
    
    Handles nested brackets correctly and provides utilities for extracting
    content from LaTeX commands and environments.
    """
    
    @staticmethod
    def is_balanced_brackets(latex_string: str) -> bool:
        """
        Check if brackets are balanced in a LaTeX string.
        
        Args:
            latex_string: LaTeX content to check
            
        Returns:
            True if brackets are balanced, False otherwise
        """
        stack = []
        i = 0
        n = len(latex_string)
        
        while i < n:
            # Handle escaped characters
            if latex_string[i] == '\\':
                i += 2  # Skip escaped character
                continue
            
            # Handle comments - skip to end of line
            if latex_string[i] == '%':
                while i < n and latex_string[i] != '\n':
                    i += 1
                continue
            
            # Handle opening braces
            if latex_string[i] == '{':
                stack.append('{')
            
            # Handle closing braces
            elif latex_string[i] == '}':
                if not stack or stack[-1] != '{':
                    return False
                stack.pop()
            
            i += 1
        
        return len(stack) == 0
    
    @staticmethod
    def extract_content_from_braces(latex_string: str, start_pos: int) -> str:
        """
        Extract content from balanced braces starting at given position.
        
        Args:
            latex_string: LaTeX content
            start_pos: Position of opening brace
            
        Returns:
            Content inside the braces (without the braces themselves)
        """
        if start_pos >= len(latex_string) or latex_string[start_pos] != '{':
            return ""
        
        bracket_level = 1
        content = ""
        i = start_pos + 1  # Start after opening brace
        n = len(latex_string)
        
        while i < n and bracket_level > 0:
            # Handle escaped characters
            if latex_string[i] == '\\' and i + 1 < n:
                content += latex_string[i:i+2]
                i += 2
                continue
            
            # Handle comments
            if latex_string[i] == '%':
                line_end = latex_string.find('\n', i)
                if line_end == -1:
                    content += latex_string[i:]
                    i = n
                else:
                    content += latex_string[i:line_end+1]
                    i = line_end + 1
                continue
            
            # Track bracket levels
            if latex_string[i] == '{':
                bracket_level += 1
            elif latex_string[i] == '}':
                bracket_level -= 1
            
            # Add character if still inside braces
            if bracket_level > 0:
                content += latex_string[i]
            
            i += 1
        
        return content
    
    @staticmethod
    def extract_command_arguments(latex_string: str, command: str) -> List[str]:
        """
        Extract arguments from a LaTeX command.
        
        Args:
            latex_string: LaTeX content
            command: Command to find (e.g., "\\choice", "\\loigiai")
            
        Returns:
            List of argument strings
        """
        results = []
        i = 0
        n = len(latex_string)
        
        while i < n:
            # Find command
            command_index = latex_string.find(command, i)
            if command_index == -1:
                break
            
            # Move to after command
            i = command_index + len(command)
            
            # Skip whitespace
            while i < n and latex_string[i].isspace():
                i += 1
            
            # Extract optional parameters [...]
            optional_params = []
            while i < n and latex_string[i] == '[':
                bracket_level = 1
                param_content = ""
                i += 1  # Skip opening bracket
                
                while i < n and bracket_level > 0:
                    if latex_string[i] == '\\' and i + 1 < n:
                        param_content += latex_string[i:i+2]
                        i += 2
                        continue
                    
                    if latex_string[i] == '[':
                        bracket_level += 1
                    elif latex_string[i] == ']':
                        bracket_level -= 1
                    
                    if bracket_level > 0:
                        param_content += latex_string[i]
                    
                    i += 1
                
                optional_params.append(param_content)
                
                # Skip whitespace after optional parameter
                while i < n and latex_string[i].isspace():
                    i += 1
            
            # Extract required arguments {...}
            required_args = []
            while i < n and latex_string[i] == '{':
                arg_content = BracketParser.extract_content_from_braces(latex_string, i)
                required_args.append(arg_content)
                
                # Move past the closing brace
                bracket_level = 1
                i += 1  # Skip opening brace
                while i < n and bracket_level > 0:
                    if latex_string[i] == '\\' and i + 1 < n:
                        i += 2
                        continue
                    if latex_string[i] == '{':
                        bracket_level += 1
                    elif latex_string[i] == '}':
                        bracket_level -= 1
                    i += 1
                
                # Skip whitespace after argument
                while i < n and latex_string[i].isspace():
                    i += 1
            
            # Combine optional and required arguments
            all_args = optional_params + required_args
            if all_args:
                results.extend(all_args)
        
        return results
    
    @staticmethod
    def extract_environment_content(latex_string: str, env_name: str) -> List[str]:
        """
        Extract content from LaTeX environments.
        
        Args:
            latex_string: LaTeX content
            env_name: Environment name (e.g., "ex", "tikzpicture")
            
        Returns:
            List of environment contents
        """
        begin_pattern = f"\\begin{{{env_name}}}"
        end_pattern = f"\\end{{{env_name}}}"
        
        results = []
        i = 0
        
        while i < len(latex_string):
            # Find begin
            begin_match = latex_string.find(begin_pattern, i)
            if begin_match == -1:
                break
            
            # Find corresponding end
            env_level = 1
            search_pos = begin_match + len(begin_pattern)
            
            while search_pos < len(latex_string) and env_level > 0:
                next_begin = latex_string.find(begin_pattern, search_pos)
                next_end = latex_string.find(end_pattern, search_pos)
                
                if next_end == -1:
                    break
                
                if next_begin != -1 and next_begin < next_end:
                    env_level += 1
                    search_pos = next_begin + len(begin_pattern)
                else:
                    env_level -= 1
                    if env_level == 0:
                        # Extract content including begin and end tags
                        content_start = begin_match
                        content_end = next_end + len(end_pattern)
                        content = latex_string[content_start:content_end]
                        results.append(content)
                    search_pos = next_end + len(end_pattern)
            
            i = search_pos
        
        return results
