"""
Question Data Models

Defines the data structures for questions and related components.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Union, Any
from datetime import datetime
import json
import re
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from utils.text_cleaner import TextCleaner


@dataclass
class QuestionAnswer:
    """Represents a single answer option for a question."""
    id: Union[str, int]
    content: str
    isCorrect: bool
    
    def to_dict(self) -> dict:
        """Convert to dictionary for CSV export."""
        return {
            'id': self.id,
            'content': self.content,
            'isCorrect': self.isCorrect
        }


@dataclass
class Question:
    """
    Main Question data model matching the database schema.
    
    Fields correspond to the Question table structure:
    - id: Auto-generated sequential ID
    - rawContent: Original LaTeX content
    - content: Cleaned question content (preserving LaTeX math)
    - subcount: Subcount identifier (e.g., "TL.103528")
    - type: Question type (MC, TF, SA, ES)
    - source: Question source information
    - answers: JSON field containing answer options
    - correctAnswer: JSON field containing correct answer(s)
    - solution: Solution content from \\loigiai{}
    - tag: Array of tags (empty for now)
    - usageCount: Usage counter (default 0)
    - creator: Creator identifier (default "ADMIN")
    - status: Question status (default "ACTIVE")
    - feedback: Feedback score (default 0)
    - difficulty: Difficulty level (default "MEDIUM")
    - created_at: Creation timestamp
    - updated_at: Update timestamp
    """
    
    # Required fields
    rawContent: str
    content: str
    type: str  # MC, TF, SA, ES
    
    # Optional fields with defaults
    id: Optional[int] = None
    subcount: Optional[str] = None
    source: Optional[str] = None
    answers: Optional[List[QuestionAnswer]] = None
    correctAnswer: Optional[Union[str, List[str]]] = None
    solution: Optional[str] = None
    tag: List[str] = field(default_factory=list)
    usageCount: int = 0
    creator: str = "ADMIN"
    status: str = "ACTIVE"
    feedback: int = 0
    difficulty: str = "MEDIUM"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Foreign key reference
    questionCodeId: Optional[str] = None

    # Generated tags from QuestionCode
    generatedTags: Optional[str] = None
    
    def __post_init__(self):
        """Set timestamps if not provided."""
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()

    def _format_correct_answer_for_csv(self) -> Optional[str]:
        """
        Format correctAnswer for CSV export with line breaks cleaned.

        Returns:
            Plain text correctAnswer without JSON encoding and line breaks
        """
        if not self.correctAnswer:
            return None

        # Handle different types of correctAnswer
        if isinstance(self.correctAnswer, list):
            # For TF questions: join multiple correct answers
            answers_text = "; ".join(str(answer) for answer in self.correctAnswer)
            return TextCleaner.clean_csv_field(answers_text)
        else:
            # For MC/SA questions: return as plain string
            return TextCleaner.clean_csv_field(str(self.correctAnswer))

    def to_csv_dict(self) -> dict:
        """Convert to dictionary for CSV export with literal \\n preserved in content fields."""
        return {
            'id': self.id,
            # PRESERVE literal \n in content fields - only clean whitespace
            'rawContent': self._clean_content_preserve_newlines(self.rawContent or ""),
            'content': self._clean_content_preserve_newlines(self.content or ""),
            'subcount': self.subcount,
            'type': self.type,
            'source': TextCleaner.clean_csv_field(self.source or ""),
            'answers': self._format_answers_as_text(),
            'correctAnswer': self._format_correct_answer_for_csv(),
            # PRESERVE literal \n in solution - only clean whitespace
            'solution': self._clean_content_preserve_newlines(self.solution or ""),
            'tag': json.dumps(self.tag, ensure_ascii=False),
            'usageCount': self.usageCount,
            'creator': self.creator,
            'status': self.status,
            'feedback': self.feedback,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'questionCodeId': self.questionCodeId,
            'generatedTags': TextCleaner.clean_csv_field(self.generatedTags or "")
        }

    def _clean_content_preserve_newlines(self, text: str) -> str:
        """
        Clean content for CSV while converting newlines to literal \\n string.

        Double-escapes newlines to prevent Python csv module from interpreting them.
        """
        if not text:
            return ""

        # Convert actual newlines to literal \\n (2 characters: backslash + n)
        cleaned = text.replace('\r\n', '\\n')  # Windows CRLF → literal \n
        cleaned = cleaned.replace('\r', '\\n')  # Mac CR → literal \n
        cleaned = cleaned.replace('\n', '\\n')  # Unix LF → literal \n

        # Keep existing literal \\n as is (no double conversion)

        # Only clean excessive whitespace and control characters
        cleaned = re.sub(r'[ ]+', ' ', cleaned)  # Multiple spaces to single
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', cleaned)  # Control chars
        cleaned = cleaned.strip()

        return cleaned

    def _format_answers_as_text(self) -> str:
        """
        Format answers as semicolon-separated text with line breaks cleaned.

        Returns:
            Formatted answers string with line breaks removed for CSV safety
        """
        if not self.answers:
            return ""

        # Extract content from each answer and join with semicolons
        answer_texts = []
        for answer in self.answers:
            content = answer.content if hasattr(answer, 'content') else str(answer)
            # Clean line breaks while preserving LaTeX math
            cleaned_content = TextCleaner.clean_csv_field(content)
            answer_texts.append(cleaned_content)

        return "; ".join(answer_texts)

    def generate_tags_from_code(self, tag_generator=None) -> str:
        """
        Generate tags from questionCodeId using TagGenerator.

        Args:
            tag_generator: TagGenerator instance. If None, creates a new one.

        Returns:
            Semicolon-separated tag string
        """
        if not self.questionCodeId:
            return ""

        if tag_generator is None:
            # Import here to avoid circular imports
            from ..parser.tag_generator import TagGenerator
            tag_generator = TagGenerator()

        tags = tag_generator.generate_tags(self.questionCodeId)
        self.generatedTags = tags
        return tags

    def validate(self) -> List[str]:
        """Validate question data and return list of errors."""
        errors = []
        
        if not self.rawContent:
            errors.append("rawContent is required")
        
        if not self.content:
            errors.append("content is required")
        
        if self.type not in ['MC', 'TF', 'SA', 'ES']:
            errors.append(f"Invalid question type: {self.type}")
        
        # Type-specific validation with status setting
        if self.type == 'MC':
            if not self.answers or len(self.answers) < 2:
                errors.append("MC questions must have at least 2 answers")
            elif not isinstance(self.correctAnswer, str) or not self.correctAnswer:
                # MC without correct answer → PENDING (needs manual review)
                self.status = "PENDING"
            else:
                # MC with correct answer → ACTIVE
                self.status = "ACTIVE"

        elif self.type == 'TF':
            if not self.answers or len(self.answers) < 2:
                errors.append("TF questions must have at least 2 answers")
            elif self.correctAnswer is not None and not isinstance(self.correctAnswer, list):
                errors.append("TF questions must have list correctAnswer or None")
            else:
                # TF questions are always ACTIVE (can have None correctAnswer)
                self.status = "ACTIVE"

        elif self.type == 'SA':
            if self.answers is not None and len(self.answers) > 1:
                errors.append("SA questions should have at most 1 answer")
            elif not isinstance(self.correctAnswer, str) or not self.correctAnswer:
                # SA without correct answer → PENDING (needs manual review)
                self.status = "PENDING"
            else:
                # SA with correct answer → ACTIVE
                self.status = "ACTIVE"

        elif self.type == 'ES':
            if self.answers is not None:
                errors.append("ES questions should not have answers")
            elif self.correctAnswer is not None:
                errors.append("ES questions should not have correctAnswer")
            else:
                # ES questions are always ACTIVE (no answers expected)
                self.status = "ACTIVE"
        
        return errors
