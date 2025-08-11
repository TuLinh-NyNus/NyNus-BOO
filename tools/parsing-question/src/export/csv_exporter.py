"""
CSV Exporter

Exports parsed question data to CSV files.
"""

import csv
import os
from typing import List, Dict, Any
from datetime import datetime
import sys
import uuid

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from models.question_tag import QuestionTag
from utils.text_cleaner import TextCleaner


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

        # Generate QuestionTag records from generatedTags
        generated_question_tags = self.generate_question_tags_from_questions(questions)

        # Export merged questions with question codes and tags
        merged_path = self.export_questions_with_codes_and_tags(questions, question_codes, generated_question_tags)
        file_paths['questions'] = merged_path

        # Generate QuestionTag records from generatedTags
        generated_question_tags = self.generate_question_tags_from_questions(questions)

        # Export question tags
        tags_path = self.export_question_tags(generated_question_tags)
        file_paths['question_tags'] = tags_path

        return file_paths

    def export_questions_with_codes(
        self,
        questions: List[Question],
        question_codes: List[QuestionCode]
    ) -> str:
        """
        Export questions merged with question codes to CSV file.

        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects

        Returns:
            Path to the exported CSV file
        """
        file_path = os.path.join(self.output_dir, "questions.csv")

        # Create lookup dictionary for question codes
        codes_lookup = {code.code: code for code in question_codes}

        if not questions:
            # Create empty file with headers
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(self._get_merged_headers())
            return file_path

        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self._get_merged_headers())
            writer.writeheader()

            for question in questions:
                row_data = question.to_csv_dict()

                # Validate CSV content for line breaks
                self._validate_row_data(row_data, question.id)

                # Add question code data if available
                if question.questionCodeId and question.questionCodeId in codes_lookup:
                    code = codes_lookup[question.questionCodeId]
                    row_data.update({
                        'code': code.code,
                        'format': code.format,
                        'grade': code.grade,
                        'subject': code.subject,
                        'chapter': code.chapter,
                        'lesson': code.lesson,
                        'level': code.level,
                        'form': code.form
                    })
                else:
                    # Add empty code fields
                    row_data.update({
                        'code': '',
                        'format': '',
                        'grade': '',
                        'subject': '',
                        'chapter': '',
                        'lesson': '',
                        'level': '',
                        'form': ''
                    })

                writer.writerow(row_data)

        return file_path

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
                # Validate CSV content for line breaks
                self._validate_row_data(row_data, question.id)
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

    def generate_question_tags_from_questions(self, questions: List[Question]) -> List[QuestionTag]:
        """
        Generate QuestionTag records from Question.generatedTags field.

        Args:
            questions: List of Question objects with generatedTags

        Returns:
            List of QuestionTag objects
        """
        question_tags = []

        for question in questions:
            if not question.generatedTags:
                continue

            # Split generatedTags by semicolon
            tag_names = [tag.strip() for tag in question.generatedTags.split(';') if tag.strip()]

            for tag_name in tag_names:
                # Create QuestionTag record
                question_tag = QuestionTag(
                    questionId=question.id,
                    tagName=tag_name,
                    id=str(uuid.uuid4()),
                    createdAt=datetime.now()
                )
                question_tags.append(question_tag)

        return question_tags

    def export_questions_with_codes_and_tags(
        self,
        questions: List[Question],
        question_codes: List[QuestionCode],
        question_tags: List[QuestionTag]
    ) -> str:
        """
        Export questions merged with question codes and tags to CSV file.

        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects
            question_tags: List of QuestionTag objects

        Returns:
            Path to the exported CSV file
        """
        file_path = os.path.join(self.output_dir, "questions.csv")

        # Create lookup dictionaries
        codes_lookup = {code.code: code for code in question_codes}

        # Create tags lookup: questionId -> list of tag names
        tags_lookup = {}
        for tag in question_tags:
            if tag.questionId not in tags_lookup:
                tags_lookup[tag.questionId] = []
            tags_lookup[tag.questionId].append(tag.tagName)

        if not questions:
            # Create empty file with headers
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(self._get_merged_with_tags_headers())
            return file_path

        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=self._get_merged_with_tags_headers())
            writer.writeheader()

            for question in questions:
                row_data = question.to_csv_dict()

                # Validate CSV content for line breaks
                self._validate_row_data(row_data, question.id)

                # Add question code data if available
                if question.questionCodeId and question.questionCodeId in codes_lookup:
                    code = codes_lookup[question.questionCodeId]
                    row_data.update({
                        'code': code.code,
                        'format': code.format,
                        'grade': code.grade,
                        'subject': code.subject,
                        'chapter': code.chapter,
                        'lesson': code.lesson,
                        'level': code.level,
                        'form': code.form
                    })
                else:
                    # Add empty code fields
                    row_data.update({
                        'code': '',
                        'format': '',
                        'grade': '',
                        'subject': '',
                        'chapter': '',
                        'lesson': '',
                        'level': '',
                        'form': ''
                    })

                # Add tags data
                question_tag_names = tags_lookup.get(question.id, [])
                row_data['questionTags'] = '; '.join(question_tag_names)
                row_data['tagCount'] = len(question_tag_names)

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
            'questionCodeId',
            'generatedTags'
        ]

    def _get_merged_headers(self) -> List[str]:
        """Get CSV headers for merged questions and question codes table."""
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
            'questionCodeId',
            'generatedTags',
            # Question code fields
            'code',
            'format',
            'grade',
            'subject',
            'chapter',
            'lesson',
            'level',
            'form'
        ]

    def _get_merged_with_tags_headers(self) -> List[str]:
        """Get CSV headers for merged questions, question codes, and tags table."""
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
            'questionCodeId',
            'generatedTags',
            # Question code fields
            'code',
            'format',
            'grade',
            'subject',
            'chapter',
            'lesson',
            'level',
            'form',
            # QuestionTag fields
            'questionTags',
            'tagCount'
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

    def _validate_row_data(self, row_data: Dict[str, Any], question_id: int = None) -> None:
        """
        Validate row data for CSV export.

        Args:
            row_data: Dictionary of row data
            question_id: Question ID for logging purposes
        """
        text_fields = ['rawContent', 'content', 'source', 'answers', 'solution', 'generatedTags']

        for field_name in text_fields:
            if field_name in row_data and row_data[field_name]:
                field_value = str(row_data[field_name])
                is_valid, issues = TextCleaner.validate_csv_content(field_value)

                if not is_valid:
                    print(f"Warning: Question {question_id} field '{field_name}' has issues: {', '.join(issues)}")
                    # Basic cleaning for control characters only
                    if "Contains control characters" in issues:
                        row_data[field_name] = TextCleaner.clean_csv_field(field_value)
                        print(f"  -> Auto-cleaned field '{field_name}' for question {question_id}")
