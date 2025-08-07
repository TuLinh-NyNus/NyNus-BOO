"""
Answer Extractor

Extracts answers and correctAnswer from LaTeX content based on question type.
"""

import re
from typing import List, Optional, Union, Tuple
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import QuestionAnswer
from parser.bracket_parser import BracketParser


class AnswerExtractor:
    """
    Extracts answers and correctAnswer from LaTeX content.
    
    Handles different question types:
    - MC: answers array + correctAnswer string
    - TF: answers array + correctAnswer string array
    - SA: answers null + correctAnswer string
    - ES: answers null + correctAnswer null
    """
    
    # Patterns for question type detection
    CHOICE_PATTERNS = [
        r'\\choice(?:\[[0-9]\])?',
        r'\\choice(?:\s|$)'
    ]
    
    CHOICE_TF_PATTERNS = [
        r'\\choiceTF(?:\[[t12]\])?',
        r'\\choiceTFt',
        r'\\choiceTF(?:\s|$)'
    ]
    
    SHORT_ANS_PATTERNS = [
        r'\\shortans(?:\[[a-z0-9]+\])?',
        r'\\shortans(?:\s|$)'
    ]
    
    MATCHING_PATTERNS = [
        r'\\matching(?:\s|$)',
        r'\\matching(?:\{.*?\})?'
    ]
    
    TRUE_PATTERN = r'\\True'
    SOLUTION_PATTERN = r'\\loigiai\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}'
    
    @classmethod
    def identify_question_type(cls, content: str) -> str:
        """
        Identify question type based on LaTeX commands.
        
        Priority order:
        1. choiceTF → TF
        2. choice (not choiceTF) → MC
        3. shortans → SA
        4. matching → MA (skip)
        5. default → ES
        
        Args:
            content: LaTeX content to analyze
            
        Returns:
            Question type: MC, TF, SA, ES
        """
        # Remove solution section for analysis
        content_without_solution = cls._remove_solution_for_analysis(content)
        
        # Check for TF (highest priority)
        for pattern in cls.CHOICE_TF_PATTERNS:
            if re.search(pattern, content_without_solution):
                return "TF"
        
        # Check for SA
        for pattern in cls.SHORT_ANS_PATTERNS:
            if re.search(pattern, content_without_solution):
                return "SA"
        
        # Check for MA (skip - not implemented)
        for pattern in cls.MATCHING_PATTERNS:
            if re.search(pattern, content_without_solution):
                return "ES"  # Treat as essay for now
        
        # Check for MC (must not be choiceTF)
        for pattern in cls.CHOICE_PATTERNS:
            if re.search(pattern, content_without_solution):
                if not any(re.search(tf_pattern, content_without_solution) for tf_pattern in cls.CHOICE_TF_PATTERNS):
                    return "MC"
        
        # Default to essay
        return "ES"
    
    @classmethod
    def extract_mc_answers(cls, content: str) -> Tuple[List[QuestionAnswer], Optional[str]]:
        """
        Extract answers for Multiple Choice questions.
        
        Args:
            content: LaTeX content
            
        Returns:
            Tuple of (answers_list, correct_answer_content)
        """
        answers = []
        correct_answer = None
        
        # Find \choice command
        choice_match = None
        for pattern in cls.CHOICE_PATTERNS:
            match = re.search(pattern, content)
            if match and not re.search(r'choiceTF', match.group(0)):
                choice_match = match
                break
        
        if not choice_match:
            return [], None
        
        # Extract answers after \choice
        start_pos = choice_match.end()
        answer_index = 0
        
        while start_pos < len(content):
            # Skip whitespace
            while start_pos < len(content) and content[start_pos].isspace():
                start_pos += 1
            
            if start_pos >= len(content) or content[start_pos] != '{':
                break
            
            # Extract answer content
            answer_content = BracketParser.extract_content_from_braces(content, start_pos)
            
            # Check if this is the correct answer
            is_correct = answer_content.startswith('\\True ')
            if is_correct:
                answer_content = answer_content[6:].strip()  # Remove \True prefix
                correct_answer = answer_content
            
            answers.append(QuestionAnswer(
                id=answer_index,
                content=answer_content,
                isCorrect=is_correct
            ))
            
            # Move past this answer
            start_pos = cls._find_closing_brace(content, start_pos) + 1
            answer_index += 1
        
        return answers, correct_answer
    
    @classmethod
    def extract_tf_answers(cls, content: str) -> Tuple[List[QuestionAnswer], Optional[List[str]]]:
        """
        Extract answers for True/False questions.
        
        Args:
            content: LaTeX content
            
        Returns:
            Tuple of (answers_list, correct_answers_list)
        """
        answers = []
        correct_answers = []
        
        # Find \choiceTF command
        choice_tf_match = None
        for pattern in cls.CHOICE_TF_PATTERNS:
            match = re.search(pattern, content)
            if match:
                choice_tf_match = match
                break
        
        if not choice_tf_match:
            return [], None
        
        # Extract answers after \choiceTF
        start_pos = choice_tf_match.end()
        answer_index = 0
        
        while start_pos < len(content):
            # Skip whitespace
            while start_pos < len(content) and content[start_pos].isspace():
                start_pos += 1
            
            if start_pos >= len(content) or content[start_pos] != '{':
                break
            
            # Extract answer content
            answer_content = BracketParser.extract_content_from_braces(content, start_pos)
            
            # Check if this is a correct answer
            is_correct = answer_content.startswith('\\True ')
            if is_correct:
                answer_content = answer_content[6:].strip()  # Remove \True prefix
                correct_answers.append(answer_content)
            
            answers.append(QuestionAnswer(
                id=answer_index,
                content=answer_content,
                isCorrect=is_correct
            ))
            
            # Move past this answer
            start_pos = cls._find_closing_brace(content, start_pos) + 1
            answer_index += 1
        
        return answers, correct_answers if correct_answers else None
    
    @classmethod
    def extract_sa_answer(cls, content: str) -> Optional[str]:
        """
        Extract answer for Short Answer questions.
        
        Args:
            content: LaTeX content
            
        Returns:
            Correct answer string or None
        """
        # Find \shortans command
        for pattern in cls.SHORT_ANS_PATTERNS:
            match = re.search(pattern, content)
            if match:
                # Look for the answer in braces after \shortans
                start_pos = match.end()
                
                # Skip optional parameters [...]
                while start_pos < len(content) and content[start_pos].isspace():
                    start_pos += 1
                
                if start_pos < len(content) and content[start_pos] == '[':
                    # Skip optional parameter
                    bracket_level = 1
                    start_pos += 1
                    while start_pos < len(content) and bracket_level > 0:
                        if content[start_pos] == '[':
                            bracket_level += 1
                        elif content[start_pos] == ']':
                            bracket_level -= 1
                        start_pos += 1
                
                # Skip whitespace again
                while start_pos < len(content) and content[start_pos].isspace():
                    start_pos += 1
                
                # Extract answer from braces
                if start_pos < len(content) and content[start_pos] == '{':
                    answer = BracketParser.extract_content_from_braces(content, start_pos)
                    # Remove quotes if present
                    answer = answer.strip('\'"')
                    return answer
        
        return None
    
    @classmethod
    def extract_solution(cls, content: str) -> Optional[str]:
        """
        Extract solution from \loigiai{...} command.
        
        Args:
            content: LaTeX content
            
        Returns:
            Solution content or None
        """
        loigiai_start = content.find('\\loigiai')
        if loigiai_start != -1:
            # Find the opening brace after \loigiai
            brace_start = content.find('{', loigiai_start)
            if brace_start != -1:
                solution = BracketParser.extract_content_from_braces(content, brace_start)
                return solution.strip()
        
        return None
    
    @classmethod
    def extract_answers_and_correct(cls, content: str, question_type: str) -> Tuple[Optional[List[QuestionAnswer]], Optional[Union[str, List[str]]]]:
        """
        Extract answers and correctAnswer based on question type.
        
        Args:
            content: LaTeX content
            question_type: Question type (MC, TF, SA, ES)
            
        Returns:
            Tuple of (answers, correctAnswer)
        """
        if question_type == "MC":
            answers, correct_answer = cls.extract_mc_answers(content)
            return answers, correct_answer
        
        elif question_type == "TF":
            answers, correct_answers = cls.extract_tf_answers(content)
            return answers, correct_answers
        
        elif question_type == "SA":
            correct_answer = cls.extract_sa_answer(content)
            return None, correct_answer
        
        elif question_type == "ES":
            return None, None
        
        else:
            return None, None
    
    @classmethod
    def _remove_solution_for_analysis(cls, content: str) -> str:
        """Remove solution section for type analysis."""
        match = re.search(cls.SOLUTION_PATTERN, content)
        if match:
            return content[:match.start()]
        return content
    
    @classmethod
    def _find_closing_brace(cls, content: str, start_pos: int) -> int:
        """Find the position of the closing brace."""
        if start_pos >= len(content) or content[start_pos] != '{':
            return start_pos
        
        bracket_level = 1
        pos = start_pos + 1
        
        while pos < len(content) and bracket_level > 0:
            if content[pos] == '\\' and pos + 1 < len(content):
                pos += 2
                continue
            if content[pos] == '{':
                bracket_level += 1
            elif content[pos] == '}':
                bracket_level -= 1
            pos += 1
        
        return pos - 1  # Position of closing brace
