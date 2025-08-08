"""
LaTeX Question Parser Package

This package provides comprehensive LaTeX parsing functionality for extracting
question data from LaTeX files and converting them to structured formats.

Main Components:
- latex_parser: Main parser class for LaTeX question extraction
- bracket_parser: Bracket-aware parsing utilities
- content_extractor: Content cleaning and extraction
- answer_extractor: Answer and correctAnswer extraction
- question_code_parser: QuestionCode format parsing
"""

from .latex_parser import LaTeXQuestionParser
from .bracket_parser import BracketParser
from .content_extractor import ContentExtractor
from .answer_extractor import AnswerExtractor
from .question_code_parser import QuestionCodeParser

__all__ = [
    'LaTeXQuestionParser',
    'BracketParser', 
    'ContentExtractor',
    'AnswerExtractor',
    'QuestionCodeParser'
]

__version__ = '1.0.0'
__author__ = 'NyNus Question Parser Team'
