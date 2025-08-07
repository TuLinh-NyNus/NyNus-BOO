"""
Question Data Models

Defines the data structures for questions and related components.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Union, Any
from datetime import datetime
import json


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
    - solution: Solution content from \loigiai{}
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
    
    def __post_init__(self):
        """Set timestamps if not provided."""
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
    
    def to_csv_dict(self) -> dict:
        """Convert to dictionary for CSV export."""
        return {
            'id': self.id,
            'rawContent': self.rawContent,
            'content': self.content,
            'subcount': self.subcount,
            'type': self.type,
            'source': self.source,
            'answers': json.dumps([ans.to_dict() for ans in self.answers] if self.answers else None),
            'correctAnswer': json.dumps(self.correctAnswer) if self.correctAnswer else None,
            'solution': self.solution,
            'tag': json.dumps(self.tag),
            'usageCount': self.usageCount,
            'creator': self.creator,
            'status': self.status,
            'feedback': self.feedback,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'questionCodeId': self.questionCodeId
        }
    
    def validate(self) -> List[str]:
        """Validate question data and return list of errors."""
        errors = []
        
        if not self.rawContent:
            errors.append("rawContent is required")
        
        if not self.content:
            errors.append("content is required")
        
        if self.type not in ['MC', 'TF', 'SA', 'ES']:
            errors.append(f"Invalid question type: {self.type}")
        
        # Type-specific validation
        if self.type == 'MC':
            if not self.answers or len(self.answers) < 2:
                errors.append("MC questions must have at least 2 answers")
            if not isinstance(self.correctAnswer, str):
                errors.append("MC questions must have string correctAnswer")
        
        elif self.type == 'TF':
            if not self.answers or len(self.answers) < 2:
                errors.append("TF questions must have at least 2 answers")
            if not isinstance(self.correctAnswer, list):
                errors.append("TF questions must have list correctAnswer")
        
        elif self.type == 'SA':
            if self.answers is not None:
                errors.append("SA questions should not have answers")
            if not isinstance(self.correctAnswer, str):
                errors.append("SA questions must have string correctAnswer")
        
        elif self.type == 'ES':
            if self.answers is not None:
                errors.append("ES questions should not have answers")
            if self.correctAnswer is not None:
                errors.append("ES questions should not have correctAnswer")
        
        return errors
