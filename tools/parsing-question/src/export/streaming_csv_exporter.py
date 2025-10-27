"""
Streaming CSV Exporter

Exports data incrementally to CSV files to minimize memory usage.
"""

import os
import csv
from typing import List, TextIO, Optional
from models.question import Question
from models.question_code import QuestionCode


class StreamingCSVExporter:
    """
    Streaming CSV exporter for incremental data export.
    
    Features:
    - Incremental writing (no memory accumulation)
    - Constant memory usage regardless of file size
    - Support for large datasets (millions of questions)
    - Automatic file handle management
    """
    
    def __init__(self, output_dir: str = "output"):
        """
        Initialize streaming CSV exporter.
        
        Args:
            output_dir: Output directory for CSV files
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # File handles (will be opened when needed)
        self.questions_file: Optional[TextIO] = None
        self.codes_file: Optional[TextIO] = None
        self.tags_file: Optional[TextIO] = None
        
        # CSV writers
        self.questions_writer: Optional[csv.DictWriter] = None
        self.codes_writer: Optional[csv.DictWriter] = None
        self.tags_writer: Optional[csv.DictWriter] = None
        
        # Track if headers written
        self.headers_written = False
    
    def open_files(self):
        """Open CSV files for writing."""
        if self.questions_file is None:
            self.questions_file = open(
                os.path.join(self.output_dir, "questions.csv"),
                'w',
                newline='',
                encoding='utf-8'
            )
            
            self.codes_file = open(
                os.path.join(self.output_dir, "question_codes.csv"),
                'w',
                newline='',
                encoding='utf-8'
            )
            
            self.tags_file = open(
                os.path.join(self.output_dir, "tags.csv"),
                'w',
                newline='',
                encoding='utf-8'
            )
    
    def write_headers(self):
        """Write CSV headers."""
        if self.headers_written:
            return
        
        # Ensure files are open
        self.open_files()
        
        # Questions CSV headers
        questions_headers = [
            'id', 'type', 'content', 'answer', 'explanation',
            'difficulty', 'subject', 'topic', 'subtopic',
            'created_at', 'updated_at', 'status'
        ]
        
        self.questions_writer = csv.DictWriter(
            self.questions_file,
            fieldnames=questions_headers
        )
        self.questions_writer.writeheader()
        
        # Question codes CSV headers
        codes_headers = [
            'id', 'question_id', 'code', 'language',
            'description', 'created_at'
        ]
        
        self.codes_writer = csv.DictWriter(
            self.codes_file,
            fieldnames=codes_headers
        )
        self.codes_writer.writeheader()
        
        # Tags CSV headers
        tags_headers = ['id', 'question_id', 'tag', 'created_at']
        
        self.tags_writer = csv.DictWriter(
            self.tags_file,
            fieldnames=tags_headers
        )
        self.tags_writer.writeheader()
        
        self.headers_written = True
    
    def write_questions_batch(self, questions: List[Question]):
        """
        Write a batch of questions to CSV.
        
        Args:
            questions: List of Question objects
        """
        if not self.headers_written:
            self.write_headers()
        
        for question in questions:
            row = {
                'id': question.id,
                'type': question.type,
                'content': question.content,
                'answer': str(question.answer) if question.answer else '',
                'explanation': question.explanation or '',
                'difficulty': question.difficulty or '',
                'subject': question.subject or '',
                'topic': question.topic or '',
                'subtopic': question.subtopic or '',
                'created_at': question.created_at or '',
                'updated_at': question.updated_at or '',
                'status': question.status or 'active'
            }
            
            self.questions_writer.writerow(row)
        
        # Flush to disk immediately
        self.questions_file.flush()
    
    def write_codes_batch(self, question_codes: List[QuestionCode]):
        """
        Write a batch of question codes to CSV.
        
        Args:
            question_codes: List of QuestionCode objects
        """
        if not self.headers_written:
            self.write_headers()
        
        for code in question_codes:
            row = {
                'id': code.id,
                'question_id': code.question_id,
                'code': code.code,
                'language': code.language or 'python',
                'description': code.description or '',
                'created_at': code.created_at or ''
            }
            
            self.codes_writer.writerow(row)
        
        # Flush to disk immediately
        self.codes_file.flush()
    
    def write_tags_batch(self, tags: List[dict]):
        """
        Write a batch of tags to CSV.
        
        Args:
            tags: List of tag dictionaries
        """
        if not self.headers_written:
            self.write_headers()
        
        for tag in tags:
            self.tags_writer.writerow(tag)
        
        # Flush to disk immediately
        self.tags_file.flush()
    
    def close_files(self):
        """Close all CSV files."""
        if self.questions_file:
            self.questions_file.close()
            self.questions_file = None
        
        if self.codes_file:
            self.codes_file.close()
            self.codes_file = None
        
        if self.tags_file:
            self.tags_file.close()
            self.tags_file = None
        
        self.headers_written = False
    
    def __enter__(self):
        """Context manager entry."""
        self.open_files()
        self.write_headers()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close_files()
    
    def get_output_files(self) -> dict:
        """
        Get paths to output files.
        
        Returns:
            Dictionary with file paths
        """
        return {
            'questions': os.path.join(self.output_dir, "questions.csv"),
            'codes': os.path.join(self.output_dir, "question_codes.csv"),
            'tags': os.path.join(self.output_dir, "tags.csv")
        }


def export_streaming(
    questions: List[Question],
    question_codes: List[QuestionCode],
    tags: List[dict],
    output_dir: str = "output",
    batch_size: int = 1000
) -> dict:
    """
    Export data using streaming approach.
    
    Args:
        questions: List of questions
        question_codes: List of question codes
        tags: List of tags
        output_dir: Output directory
        batch_size: Batch size for writing
        
    Returns:
        Dictionary with output file paths
    """
    with StreamingCSVExporter(output_dir) as exporter:
        # Write questions in batches
        for i in range(0, len(questions), batch_size):
            batch = questions[i:i+batch_size]
            exporter.write_questions_batch(batch)
        
        # Write codes in batches
        for i in range(0, len(question_codes), batch_size):
            batch = question_codes[i:i+batch_size]
            exporter.write_codes_batch(batch)
        
        # Write tags in batches
        for i in range(0, len(tags), batch_size):
            batch = tags[i:i+batch_size]
            exporter.write_tags_batch(batch)
        
        return exporter.get_output_files()

