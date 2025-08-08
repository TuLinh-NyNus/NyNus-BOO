"""
QuestionTag Data Model

Defines the QuestionTag structure for question tagging system.
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime


@dataclass
class QuestionTag:
    """
    QuestionTag data model matching the database schema.
    
    Represents the many-to-many relationship between questions and tags:
    - id: Auto-generated sequential ID
    - questionId: Foreign key to Question.id
    - tagName: Tag name (max 100 characters)
    - createdAt: Creation timestamp
    """
    
    questionId: int
    tagName: str
    id: Optional[int] = None
    createdAt: Optional[datetime] = None
    
    def __post_init__(self):
        """Set timestamp if not provided."""
        if self.createdAt is None:
            self.createdAt = datetime.now()
    
    def to_csv_dict(self) -> dict:
        """Convert to dictionary for CSV export."""
        return {
            'id': self.id,
            'questionId': self.questionId,
            'tagName': self.tagName,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None
        }
    
    def validate(self) -> List[str]:
        """Validate QuestionTag data and return list of errors."""
        errors = []
        
        if not self.questionId:
            errors.append("questionId is required")
        
        if not self.tagName:
            errors.append("tagName is required")
        
        if len(self.tagName) > 100:
            errors.append("tagName must be 100 characters or less")
        
        return errors
    
    def __str__(self) -> str:
        """String representation of the QuestionTag."""
        return f"Tag({self.tagName}) -> Question({self.questionId})"
