"""
Main LaTeX Question Parser

Combines all parsing components to extract complete question data from LaTeX content.
"""

import re
from typing import List, Optional, Tuple
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from parser.bracket_parser import BracketParser
from parser.content_extractor import ContentExtractor
from parser.answer_extractor import AnswerExtractor
from parser.question_code_parser import QuestionCodeParser


class LaTeXQuestionParser:
    """
    Main parser class that orchestrates the complete parsing process.
    
    Extracts questions from LaTeX content and converts them to structured Question objects.
    """
    
    @classmethod
    def extract_questions_from_content(cls, latex_content: str) -> List[str]:
        """
        Extract individual question blocks from LaTeX content.
        
        Args:
            latex_content: Full LaTeX file content
            
        Returns:
            List of question blocks (each containing one \\begin{ex}...\\end{ex})
        """
        # Find all \begin{ex}...\end{ex} blocks
        question_blocks = []
        
        # Use environment extraction from BracketParser
        ex_environments = BracketParser.extract_environment_content(latex_content, "ex")

        if not ex_environments:
            return []

        # Simple approach: find complete ex environments with regex
        pattern = r'((?:%.*?\n)*?)\\\\begin\\{ex\\}(.*?)\\\\end\\{ex\\}'
        matches = re.finditer(pattern, latex_content, re.DOTALL)

        for match in matches:
            metadata = match.group(1) if match.group(1) else ""
            ex_content = match.group(2)

            # Combine metadata + ex environment
            question_block = metadata + "\\\\begin{ex}" + ex_content + "\\\\end{ex}"
            question_blocks.append(question_block.strip())
        
        return question_blocks
    
    @classmethod
    def parse_single_question(cls, question_block: str) -> Optional[Question]:
        """
        Parse a single question block into a Question object.
        
        Args:
            question_block: LaTeX content for one question
            
        Returns:
            Question object or None if parsing fails
        """
        try:
            # Step 1: Extract metadata
            question_code, subcount, source = QuestionCodeParser.parse_metadata(question_block)
            
            # Step 2: Extract and clean content
            raw_content, clean_content = ContentExtractor.extract_clean_content(question_block)
            
            if not raw_content:
                return None
            
            # Step 3: Identify question type
            question_type = AnswerExtractor.identify_question_type(raw_content)
            
            # Skip MA (Matching) questions as requested
            if question_type == "MA":
                return None
            
            # Step 4: Extract answers and correctAnswer
            answers, correct_answer = AnswerExtractor.extract_answers_and_correct(raw_content, question_type)
            
            # Step 5: Extract solution
            solution = AnswerExtractor.extract_solution(raw_content)
            
            # Step 6: Create Question object
            question = Question(
                rawContent=raw_content.strip(),  # Chỉ lưu nội dung từ ex environment, không bao gồm source bên ngoài
                content=clean_content,
                type=question_type,
                subcount=subcount,
                source=source,
                answers=answers,
                correctAnswer=correct_answer,
                solution=solution,
                questionCodeId=question_code.code if question_code else None
            )
            
            return question
            
        except Exception as e:
            # Log error but don't crash the entire process
            print(f"Error parsing question: {str(e)}")
            return None
    
    @classmethod
    def parse_latex_file(cls, latex_content: str) -> Tuple[List[Question], List[QuestionCode], List[str]]:
        """
        Parse complete LaTeX file and extract all questions.
        
        Args:
            latex_content: Full LaTeX file content
            
        Returns:
            Tuple of (questions, question_codes, errors)
        """
        questions = []
        question_codes = []
        errors = []
        
        # Extract question blocks
        question_blocks = cls.extract_questions_from_content(latex_content)
        
        # Track unique question codes
        seen_codes = set()
        
        for i, block in enumerate(question_blocks):
            try:
                question = cls.parse_single_question(block)
                
                if question:
                    # Assign sequential ID
                    question.id = len(questions) + 1
                    questions.append(question)
                    
                    # Collect unique question codes
                    if question.questionCodeId and question.questionCodeId not in seen_codes:
                        question_code = QuestionCodeParser.extract_question_code(block)
                        if question_code:
                            question_codes.append(question_code)
                            seen_codes.add(question_code.code)
                
                else:
                    errors.append(f"Question block {i+1}: Failed to parse")
                    
            except Exception as e:
                error_msg = f"Question block {i+1}: {str(e)}"
                errors.append(error_msg)
                print(f"Error: {error_msg}")
        
        return questions, question_codes, errors
    
    @classmethod
    def validate_question(cls, question: Question) -> List[str]:
        """
        Validate a parsed question.
        
        Args:
            question: Question to validate
            
        Returns:
            List of validation errors
        """
        return question.validate()
    
    @classmethod
    def get_parsing_statistics(cls, questions: List[Question], errors: List[str]) -> dict:
        """
        Generate parsing statistics.
        
        Args:
            questions: List of parsed questions
            errors: List of parsing errors
            
        Returns:
            Dictionary with statistics
        """
        total_questions = len(questions) + len(errors)
        
        # Count by type
        type_counts = {}
        for question in questions:
            type_counts[question.type] = type_counts.get(question.type, 0) + 1
        
        # Count questions with answers
        questions_with_answers = sum(1 for q in questions if q.answers)
        questions_with_solutions = sum(1 for q in questions if q.solution)
        
        return {
            'total_blocks_processed': total_questions,
            'successful_parses': len(questions),
            'failed_parses': len(errors),
            'success_rate': len(questions) / total_questions * 100 if total_questions > 0 else 0,
            'question_types': type_counts,
            'questions_with_answers': questions_with_answers,
            'questions_with_solutions': questions_with_solutions,
            'unique_question_codes': len(set(q.questionCodeId for q in questions if q.questionCodeId))
        }
