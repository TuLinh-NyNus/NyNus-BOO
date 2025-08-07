"""
Data Validator

Validates parsed question data before CSV export.
"""

from typing import List, Dict, Any, Tuple
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from models.question_tag import QuestionTag


class DataValidator:
    """
    Validates question data before export to ensure data integrity.
    """
    
    @classmethod
    def validate_questions(cls, questions: List[Question]) -> Tuple[List[Question], List[str]]:
        """
        Validate a list of questions.
        
        Args:
            questions: List of Question objects to validate
            
        Returns:
            Tuple of (valid_questions, validation_errors)
        """
        valid_questions = []
        validation_errors = []
        
        for i, question in enumerate(questions):
            errors = question.validate()
            
            if errors:
                error_msg = f"Question {i+1} (ID: {question.id}): {'; '.join(errors)}"
                validation_errors.append(error_msg)
            else:
                valid_questions.append(question)
        
        return valid_questions, validation_errors
    
    @classmethod
    def validate_question_codes(cls, question_codes: List[QuestionCode]) -> Tuple[List[QuestionCode], List[str]]:
        """
        Validate a list of question codes.
        
        Args:
            question_codes: List of QuestionCode objects to validate
            
        Returns:
            Tuple of (valid_question_codes, validation_errors)
        """
        valid_codes = []
        validation_errors = []
        seen_codes = set()
        
        for i, question_code in enumerate(question_codes):
            errors = question_code.validate()
            
            # Check for duplicates
            if question_code.code in seen_codes:
                errors.append(f"Duplicate question code: {question_code.code}")
            else:
                seen_codes.add(question_code.code)
            
            if errors:
                error_msg = f"QuestionCode {i+1} ({question_code.code}): {'; '.join(errors)}"
                validation_errors.append(error_msg)
            else:
                valid_codes.append(question_code)
        
        return valid_codes, validation_errors
    
    @classmethod
    def validate_question_tags(cls, question_tags: List[QuestionTag]) -> Tuple[List[QuestionTag], List[str]]:
        """
        Validate a list of question tags.
        
        Args:
            question_tags: List of QuestionTag objects to validate
            
        Returns:
            Tuple of (valid_question_tags, validation_errors)
        """
        valid_tags = []
        validation_errors = []
        
        for i, question_tag in enumerate(question_tags):
            errors = question_tag.validate()
            
            if errors:
                error_msg = f"QuestionTag {i+1}: {'; '.join(errors)}"
                validation_errors.append(error_msg)
            else:
                valid_tags.append(question_tag)
        
        return valid_tags, validation_errors
    
    @classmethod
    def validate_foreign_key_relationships(
        cls, 
        questions: List[Question], 
        question_codes: List[QuestionCode]
    ) -> List[str]:
        """
        Validate foreign key relationships between questions and question codes.
        
        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects
            
        Returns:
            List of validation errors
        """
        errors = []
        
        # Create set of valid question code IDs
        valid_code_ids = {code.code for code in question_codes}
        
        # Check each question's questionCodeId
        for question in questions:
            if question.questionCodeId and question.questionCodeId not in valid_code_ids:
                errors.append(
                    f"Question {question.id} references invalid questionCodeId: {question.questionCodeId}"
                )
        
        return errors
    
    @classmethod
    def validate_data_consistency(cls, questions: List[Question]) -> List[str]:
        """
        Validate data consistency within questions.
        
        Args:
            questions: List of Question objects
            
        Returns:
            List of consistency errors
        """
        errors = []
        
        for question in questions:
            # Check answer consistency
            if question.type == "MC":
                if question.answers:
                    correct_answers = [ans for ans in question.answers if ans.isCorrect]
                    if len(correct_answers) != 1:
                        errors.append(
                            f"Question {question.id}: MC questions must have exactly 1 correct answer, found {len(correct_answers)}"
                        )
                    
                    # Check if correctAnswer matches one of the answer contents
                    if question.correctAnswer:
                        answer_contents = [ans.content for ans in question.answers]
                        if question.correctAnswer not in answer_contents:
                            errors.append(
                                f"Question {question.id}: correctAnswer '{question.correctAnswer}' not found in answers"
                            )
            
            elif question.type == "TF":
                if question.answers and question.correctAnswer:
                    if isinstance(question.correctAnswer, list):
                        answer_contents = [ans.content for ans in question.answers]
                        for correct_ans in question.correctAnswer:
                            if correct_ans not in answer_contents:
                                errors.append(
                                    f"Question {question.id}: correctAnswer '{correct_ans}' not found in answers"
                                )
            
            # Check subcount format
            if question.subcount:
                import re
                if not re.match(r'^[A-Z]{2}\.\d+$', question.subcount):
                    errors.append(
                        f"Question {question.id}: Invalid subcount format '{question.subcount}'"
                    )
        
        return errors
    
    @classmethod
    def validate_all_data(
        cls, 
        questions: List[Question], 
        question_codes: List[QuestionCode], 
        question_tags: List[QuestionTag] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive validation of all data.
        
        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects
            question_tags: List of QuestionTag objects (optional)
            
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            'valid_questions': [],
            'valid_question_codes': [],
            'valid_question_tags': [],
            'errors': {
                'question_errors': [],
                'question_code_errors': [],
                'question_tag_errors': [],
                'foreign_key_errors': [],
                'consistency_errors': []
            },
            'statistics': {}
        }
        
        # Validate questions
        valid_questions, question_errors = cls.validate_questions(questions)
        validation_results['valid_questions'] = valid_questions
        validation_results['errors']['question_errors'] = question_errors
        
        # Validate question codes
        valid_codes, code_errors = cls.validate_question_codes(question_codes)
        validation_results['valid_question_codes'] = valid_codes
        validation_results['errors']['question_code_errors'] = code_errors
        
        # Validate question tags
        if question_tags:
            valid_tags, tag_errors = cls.validate_question_tags(question_tags)
            validation_results['valid_question_tags'] = valid_tags
            validation_results['errors']['question_tag_errors'] = tag_errors
        
        # Validate foreign key relationships
        fk_errors = cls.validate_foreign_key_relationships(valid_questions, valid_codes)
        validation_results['errors']['foreign_key_errors'] = fk_errors
        
        # Validate data consistency
        consistency_errors = cls.validate_data_consistency(valid_questions)
        validation_results['errors']['consistency_errors'] = consistency_errors
        
        # Calculate statistics
        total_errors = sum(len(error_list) for error_list in validation_results['errors'].values())
        
        validation_results['statistics'] = {
            'total_questions_input': len(questions),
            'valid_questions': len(valid_questions),
            'invalid_questions': len(questions) - len(valid_questions),
            'total_question_codes_input': len(question_codes),
            'valid_question_codes': len(valid_codes),
            'invalid_question_codes': len(question_codes) - len(valid_codes),
            'total_errors': total_errors,
            'validation_success_rate': (len(valid_questions) / len(questions) * 100) if questions else 0
        }
        
        return validation_results
    
    @classmethod
    def get_validation_summary(cls, validation_results: Dict[str, Any]) -> str:
        """
        Generate a human-readable validation summary.
        
        Args:
            validation_results: Results from validate_all_data
            
        Returns:
            Formatted validation summary string
        """
        stats = validation_results['statistics']
        errors = validation_results['errors']
        
        summary = f"""
Validation Summary:
==================
Questions: {stats['valid_questions']}/{stats['total_questions_input']} valid ({stats['validation_success_rate']:.1f}%)
Question Codes: {stats['valid_question_codes']}/{stats['total_question_codes_input']} valid
Total Errors: {stats['total_errors']}

Error Breakdown:
- Question validation errors: {len(errors['question_errors'])}
- Question code validation errors: {len(errors['question_code_errors'])}
- Foreign key errors: {len(errors['foreign_key_errors'])}
- Data consistency errors: {len(errors['consistency_errors'])}
"""
        
        return summary.strip()
