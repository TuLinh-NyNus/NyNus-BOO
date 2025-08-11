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
from utils.text_cleaner import TextCleaner


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

        Logic phân loại:
        1. Có "\\choiceTF" → TF (Đúng/Sai)
        2. Có "\\choice" (không phải choiceTF) → MC (Nhiều lựa chọn)
        3. Có "\\shortans" → SA (Trả lời ngắn)
        4. Có "\\matching" → MA (Ghép đôi) - tạm thời skip
        5. Không có gì → ES (Tự luận)

        Args:
            content: LaTeX content to analyze

        Returns:
            Question type: MC, TF, SA, ES
        """
        # Remove solution section for analysis
        content_without_solution = cls._remove_solution_for_analysis(content)

        # 1. Check for choiceTF variants → TF (Đúng/Sai)
        # Includes: \choiceTF, \choiceTFt, \choiceTF[...], etc.
        if '\\choiceTF' in content_without_solution:
            return "TF"

        # 2. Check for choice (not choiceTF) → MC (Nhiều lựa chọn)
        if '\\choice' in content_without_solution:
            return "MC"

        # 3. Check for shortans → SA (Trả lời ngắn)
        if '\\shortans' in content_without_solution:
            return "SA"

        # 4. Check for matching → MA (Ghép đôi) - skip for now
        if '\\matching' in content_without_solution:
            return "ES"  # Treat as essay for now

        # 5. Default to essay
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
        
        # Find \choice command (but not \choiceTF)
        choice_pos = -1
        pos = 0
        while pos < len(content):
            pos = content.find('\\choice', pos)
            if pos == -1:
                break
            # Check if it's not choiceTF
            if not content[pos:pos+9] == '\\choiceTF':
                choice_pos = pos
                break
            pos += 1

        if choice_pos == -1:
            return [], None

        # Find the end of the choice command (after optional parameters)
        start_pos = choice_pos
        while start_pos < len(content) and content[start_pos] not in ['\n', '{']:
            start_pos += 1

        answer_index = 0
        
        while start_pos < len(content):
            # Skip whitespace
            while start_pos < len(content) and content[start_pos].isspace():
                start_pos += 1
            
            if start_pos >= len(content) or content[start_pos] != '{':
                break
            
            # Extract answer content
            answer_content = BracketParser.extract_content_from_braces(content, start_pos)

            # Trim leading/trailing whitespace for checking
            trimmed_content = answer_content.strip()

            # Check if this is the correct answer
            is_correct = False
            if trimmed_content.startswith('\\True '):
                is_correct = True
                answer_content = trimmed_content[6:].strip()  # Remove '\True ' (6 chars)
                # Convert newlines to literal for correct answer
                correct_answer = TextCleaner.convert_newlines_to_literal(answer_content)
            elif trimmed_content.startswith('\\True'):
                is_correct = True
                answer_content = trimmed_content[5:].strip()  # Remove '\True' (5 chars)
                # Convert newlines to literal for correct answer
                correct_answer = TextCleaner.convert_newlines_to_literal(answer_content)
            else:
                # Keep original content but trimmed
                answer_content = trimmed_content

            # Convert newlines to literal for CSV export
            answer_content = TextCleaner.convert_newlines_to_literal(answer_content)

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
        choice_tf_pos = content.find('\\choiceTF')
        if choice_tf_pos == -1:
            return [], None

        # Find the end of the choiceTF command (after optional parameters)
        start_pos = choice_tf_pos
        while start_pos < len(content) and content[start_pos] not in ['\n', '{']:
            start_pos += 1
        
        # Extract answers after \choiceTF
        answer_index = 0
        
        while start_pos < len(content):
            # Skip whitespace
            while start_pos < len(content) and content[start_pos].isspace():
                start_pos += 1
            
            if start_pos >= len(content) or content[start_pos] != '{':
                break
            
            # Extract answer content
            answer_content = BracketParser.extract_content_from_braces(content, start_pos)

            # Trim leading/trailing whitespace for checking
            trimmed_content = answer_content.strip()

            # Check if this is a correct answer
            is_correct = False
            if trimmed_content.startswith('\\True '):
                is_correct = True
                answer_content = trimmed_content[6:].strip()  # Remove '\True ' (6 chars)
                # Convert newlines to literal for correct answers
                correct_answer_literal = TextCleaner.convert_newlines_to_literal(answer_content)
                correct_answers.append(correct_answer_literal)
            elif trimmed_content.startswith('\\True'):
                is_correct = True
                answer_content = trimmed_content[5:].strip()  # Remove '\True' (5 chars)
                # Convert newlines to literal for correct answers
                correct_answer_literal = TextCleaner.convert_newlines_to_literal(answer_content)
                correct_answers.append(correct_answer_literal)
            else:
                # Keep original content but trimmed
                answer_content = trimmed_content

            # Convert newlines to literal for CSV export
            answer_content = TextCleaner.convert_newlines_to_literal(answer_content)
            
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

        Format: \\shortans{answer} hoặc \\shortans[param]{answer}

        Args:
            content: LaTeX content

        Returns:
            Correct answer string or None
        """
        # Find \shortans command
        shortans_pos = content.find('\\shortans')
        if shortans_pos == -1:
            return None

        # Start from after \shortans
        pos = shortans_pos + len('\\shortans')

        # Skip optional parameters [...]
        while pos < len(content) and content[pos].isspace():
            pos += 1

        if pos < len(content) and content[pos] == '[':
            # Skip optional parameter [...]
            bracket_level = 1
            pos += 1
            while pos < len(content) and bracket_level > 0:
                if content[pos] == '[':
                    bracket_level += 1
                elif content[pos] == ']':
                    bracket_level -= 1
                pos += 1

        # Skip whitespace again
        while pos < len(content) and content[pos].isspace():
            pos += 1

        # Extract answer from braces {...}
        if pos < len(content) and content[pos] == '{':
            answer = BracketParser.extract_content_from_braces(content, pos)
            if answer:
                # Clean up the answer
                answer = answer.strip()
                # Remove quotes if present
                answer = answer.strip('\'"')
                # Convert newlines to literal for CSV export
                answer = TextCleaner.convert_newlines_to_literal(answer)
                return answer

        return None
    
    @classmethod
    def extract_solution(cls, content: str) -> Optional[str]:
        """
        Extract solution from \\loigiai{...} command.

        Args:
            content: LaTeX content

        Returns:
            Solution content with newlines converted to literal \n
        """
        loigiai_start = content.find('\\loigiai')
        if loigiai_start != -1:
            # Find the opening brace after \loigiai
            brace_start = content.find('{', loigiai_start)
            if brace_start != -1:
                solution = BracketParser.extract_content_from_braces(content, brace_start)
                solution = solution.strip()
                # Convert newlines to literal for CSV export
                solution = TextCleaner.convert_newlines_to_literal(solution)
                return solution

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
            if correct_answer:
                # Create a single answer object for SA questions
                answer = QuestionAnswer(
                    id=0,
                    content=correct_answer,
                    isCorrect=True
                )
                return [answer], correct_answer
            return [], None
        
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
