"""
CSV Exporter

Exports parsed question data to CSV files.
"""

import csv
import os
from typing import List, Dict, Any
from datetime import datetime
import sys

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from models.question_tag import QuestionTag


class CSVExporter:
    """
    Exports question data to CSV files.
    
    Creates three separate CSV files:
    - questions.csv: Main question data
    - question_codes.csv: QuestionCode lookup table
    - question_tags.csv: Question tags (empty for now)
    """
    
    def __init__(self, output_dir: str = "tools/parsing-question"):
        """
        Initialize CSV exporter.
        
        Args:
            output_dir: Directory to save CSV files
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def export_all(
        self, 
        questions: List[Question], 
        question_codes: List[QuestionCode], 
        question_tags: List[QuestionTag] = None
    ) -> Dict[str, str]:
        """
        Export all data to CSV files.
        
        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects
            question_tags: List of QuestionTag objects (optional)
            
        Returns:
            Dictionary mapping file types to file paths
        """
        file_paths = {}
        
        # Export questions
        questions_path = self.export_questions(questions)
        file_paths['questions'] = questions_path
        
        # Export question codes
        codes_path = self.export_question_codes(question_codes)
        file_paths['question_codes'] = codes_path
        
        # Export question tags (empty for now)
        tags_path = self.export_question_tags(question_tags or [])
        file_paths['question_tags'] = tags_path
        
        return file_paths
    
    def export_questions(self, questions: List[Question]) -> str:
        """
        Export questions to CSV file.
        
        Args:
            questions: List of Question objects
            
        Returns:
            Path to the exported CSV file
        """
        file_path = os.path.join(self.output_dir, "questions.csv")
        
        if not questions:
            # Create empty file with headers
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(self._get_question_headers())
            return file_path
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self._get_question_headers())
            writer.writeheader()
            
            for question in questions:
                row_data = question.to_csv_dict()
                writer.writerow(row_data)
        
        return file_path
    
    def export_question_codes(self, question_codes: List[QuestionCode]) -> str:
        """
        Export question codes to CSV file.
        
        Args:
            question_codes: List of QuestionCode objects
            
        Returns:
            Path to the exported CSV file
        """
        file_path = os.path.join(self.output_dir, "question_codes.csv")
        
        if not question_codes:
            # Create empty file with headers
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(self._get_question_code_headers())
            return file_path
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self._get_question_code_headers())
            writer.writeheader()
            
            for question_code in question_codes:
                row_data = question_code.to_csv_dict()
                writer.writerow(row_data)
        
        return file_path
    
    def export_question_tags(self, question_tags: List[QuestionTag]) -> str:
        """
        Export question tags to CSV file.
        
        Args:
            question_tags: List of QuestionTag objects
            
        Returns:
            Path to the exported CSV file
        """
        file_path = os.path.join(self.output_dir, "question_tags.csv")
        
        # Create empty file with headers (tags will be implemented later)
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self._get_question_tag_headers())
            writer.writeheader()
            
            for question_tag in question_tags:
                row_data = question_tag.to_csv_dict()
                writer.writerow(row_data)
        
        return file_path
    
    def _get_question_headers(self) -> List[str]:
        """Get CSV headers for questions table."""
        return [
            'id',
            'rawContent',
            'content',
            'subcount',
            'type',
            'source',
            'answers',
            'correctAnswer',
            'solution',
            'tag',
            'usageCount',
            'creator',
            'status',
            'feedback',
            'difficulty',
            'created_at',
            'updated_at',
            'questionCodeId'
        ]
    
    def _get_question_code_headers(self) -> List[str]:
        """Get CSV headers for question_codes table."""
        return [
            'code',
            'format',
            'grade',
            'subject',
            'chapter',
            'lesson',
            'form',
            'level'
        ]
    
    def _get_question_tag_headers(self) -> List[str]:
        """Get CSV headers for question_tags table."""
        return [
            'id',
            'questionId',
            'tagName',
            'createdAt'
        ]
    
    def create_export_summary(
        self, 
        questions: List[Question], 
        question_codes: List[QuestionCode], 
        question_tags: List[QuestionTag],
        file_paths: Dict[str, str]
    ) -> str:
        """
        Create a summary file of the export operation.
        
        Args:
            questions: List of exported questions
            question_codes: List of exported question codes
            question_tags: List of exported question tags
            file_paths: Dictionary of exported file paths
            
        Returns:
            Path to the summary file
        """
        summary_path = os.path.join(self.output_dir, "export_summary.md")
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# CSV Export Summary\n\n")
            f.write(f"Export completed: {datetime.now().isoformat()}\n\n")
            
            # Statistics
            f.write("## Export Statistics\n\n")
            f.write(f"- Questions exported: {len(questions)}\n")
            f.write(f"- Question codes exported: {len(question_codes)}\n")
            f.write(f"- Question tags exported: {len(question_tags)}\n\n")
            
            # Question type breakdown
            if questions:
                type_counts = {}
                for question in questions:
                    type_counts[question.type] = type_counts.get(question.type, 0) + 1
                
                f.write("## Question Types\n\n")
                for question_type, count in type_counts.items():
                    f.write(f"- {question_type}: {count}\n")
                f.write("\n")
            
            # File information
            f.write("## Exported Files\n\n")
            for file_type, file_path in file_paths.items():
                file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                f.write(f"- **{file_type}.csv**: {file_path} ({file_size:,} bytes)\n")
            
            f.write("\n")
            
            # Sample data preview
            if questions:
                f.write("## Sample Question Data\n\n")
                sample_question = questions[0]
                f.write(f"- **ID**: {sample_question.id}\n")
                f.write(f"- **Type**: {sample_question.type}\n")
                f.write(f"- **Subcount**: {sample_question.subcount}\n")
                f.write(f"- **Question Code**: {sample_question.questionCodeId}\n")
                f.write(f"- **Content Preview**: {sample_question.content[:100]}...\n")
        
        return summary_path
    
    def get_export_info(self, file_paths: Dict[str, str]) -> Dict[str, Any]:
        """
        Get information about exported files.
        
        Args:
            file_paths: Dictionary of exported file paths
            
        Returns:
            Dictionary with file information
        """
        info = {}
        
        for file_type, file_path in file_paths.items():
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                
                # Count rows in CSV
                row_count = 0
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        reader = csv.reader(f)
                        row_count = sum(1 for row in reader) - 1  # Subtract header
                except:
                    row_count = 0
                
                info[file_type] = {
                    'file_path': file_path,
                    'file_size_bytes': file_size,
                    'file_size_kb': round(file_size / 1024, 2),
                    'row_count': row_count
                }
            else:
                info[file_type] = {
                    'file_path': file_path,
                    'exists': False
                }
        
        return info
