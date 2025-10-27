"""
Error Handler

Handles error logging and malformed question tracking.
"""

import os
from datetime import datetime
from typing import List, Dict, Any
import json


class ErrorHandler:
    """
    Handles error logging and creates error.md file for malformed questions.
    """
    
    def __init__(self, output_dir: str = "tools/parsing-question"):
        """
        Initialize error handler.

        Args:
            output_dir: Directory to save error files
        """
        self.output_dir = output_dir
        self.errors = []
        self.malformed_questions = []
        self.failed_files = []  # Track failed files
        self.file_errors = {}  # Track errors per file: {file_path: [errors]}
        self.statistics = {
            'total_errors': 0,
            'parsing_errors': 0,
            'validation_errors': 0,
            'malformed_questions': 0,
            'processing_start_time': None,
            'processing_end_time': None,
            'total_files_processed': 0,
            'successful_files': 0,
            'failed_files': 0
        }

    def clear_errors(self):
        """Clear all errors and reset statistics for fresh processing."""
        self.errors = []
        self.malformed_questions = []
        self.failed_files = []
        self.file_errors = {}
        self.statistics = {
            'total_errors': 0,
            'parsing_errors': 0,
            'validation_errors': 0,
            'malformed_questions': 0,
            'processing_start_time': None,
            'processing_end_time': None,
            'total_files_processed': 0,
            'successful_files': 0,
            'failed_files': 0
        }
    
    def add_error(self, error_type: str, message: str, question_block: str = None, context: Dict[str, Any] = None):
        """
        Add an error to the error log.
        
        Args:
            error_type: Type of error (parsing, validation, etc.)
            message: Error message
            question_block: The problematic question block (if applicable)
            context: Additional context information
        """
        error_entry = {
            'timestamp': datetime.now().isoformat(),
            'error_type': error_type,
            'message': message,
            'context': context or {}
        }
        
        if question_block:
            error_entry['question_block'] = question_block
            self.malformed_questions.append({
                'error': error_entry,
                'question_block': question_block
            })
            self.statistics['malformed_questions'] += 1
        
        self.errors.append(error_entry)
        self.statistics['total_errors'] += 1
        
        if error_type == 'parsing':
            self.statistics['parsing_errors'] += 1
        elif error_type == 'validation':
            self.statistics['validation_errors'] += 1
    
    def add_batch_errors(self, batch_errors: List[str], batch_index: int):
        """
        Add errors from a batch processing operation.

        Args:
            batch_errors: List of error messages from batch processing
            batch_index: Index of the batch that generated these errors
        """
        for error_msg in batch_errors:
            self.add_error(
                error_type='parsing',
                message=error_msg,
                context={'batch_index': batch_index}
            )

    def add_file_error(self, file_path: str, error_message: str, error_type: str = 'file_processing'):
        """
        Add a file-level error.

        Args:
            file_path: Path to the file that failed
            error_message: Error message
            error_type: Type of error
        """
        file_name = os.path.basename(file_path)

        error_entry = {
            'timestamp': datetime.now().isoformat(),
            'file_path': file_path,
            'file_name': file_name,
            'error_type': error_type,
            'message': error_message
        }

        # Add to failed files list if not already there
        if file_path not in [f['file_path'] for f in self.failed_files]:
            self.failed_files.append(error_entry)

        # Track errors per file
        if file_path not in self.file_errors:
            self.file_errors[file_path] = []
        self.file_errors[file_path].append(error_entry)

        # Update statistics
        self.statistics['failed_files'] = len(self.failed_files)

    def mark_file_success(self, file_path: str):
        """
        Mark a file as successfully processed.

        Args:
            file_path: Path to the file
        """
        self.statistics['total_files_processed'] += 1
        self.statistics['successful_files'] += 1
    
    def start_processing(self):
        """Mark the start of processing."""
        self.statistics['processing_start_time'] = datetime.now().isoformat()
    
    def end_processing(self):
        """Mark the end of processing."""
        self.statistics['processing_end_time'] = datetime.now().isoformat()
    
    def save_error_report(self) -> str:
        """
        Save error report to error.md file.
        
        Returns:
            Path to the saved error file
        """
        os.makedirs(self.output_dir, exist_ok=True)
        error_file_path = os.path.join(self.output_dir, "error.md")
        
        with open(error_file_path, 'w', encoding='utf-8') as f:
            f.write("# LaTeX Question Parsing Error Report\n\n")
            f.write(f"Generated: {datetime.now().isoformat()}\n\n")
            
            # Statistics section
            f.write("## Statistics\n\n")
            f.write(f"- Total Errors: {self.statistics['total_errors']}\n")
            f.write(f"- Parsing Errors: {self.statistics['parsing_errors']}\n")
            f.write(f"- Validation Errors: {self.statistics['validation_errors']}\n")
            f.write(f"- Malformed Questions: {self.statistics['malformed_questions']}\n")
            
            if self.statistics['processing_start_time']:
                f.write(f"- Processing Started: {self.statistics['processing_start_time']}\n")
            if self.statistics['processing_end_time']:
                f.write(f"- Processing Ended: {self.statistics['processing_end_time']}\n")
            
            f.write("\n")
            
            # Error summary
            if self.errors:
                f.write("## Error Summary\n\n")
                
                error_types = {}
                for error in self.errors:
                    error_type = error['error_type']
                    error_types[error_type] = error_types.get(error_type, 0) + 1
                
                for error_type, count in error_types.items():
                    f.write(f"- {error_type.title()} Errors: {count}\n")
                
                f.write("\n")
            
            # Malformed questions section
            if self.malformed_questions:
                f.write("## Malformed Questions\n\n")
                f.write("The following questions could not be parsed correctly:\n\n")
                
                for i, malformed in enumerate(self.malformed_questions, 1):
                    f.write(f"### Question {i}\n\n")
                    f.write(f"**Error**: {malformed['error']['message']}\n\n")
                    f.write(f"**Timestamp**: {malformed['error']['timestamp']}\n\n")
                    
                    if malformed['error'].get('context'):
                        f.write(f"**Context**: {json.dumps(malformed['error']['context'], indent=2)}\n\n")
                    
                    f.write("**Question Block**:\n\n")
                    f.write("```latex\n")
                    f.write(malformed['question_block'])
                    f.write("\n```\n\n")
                    f.write("---\n\n")
            
            # Detailed error log
            if self.errors:
                f.write("## Detailed Error Log\n\n")

                for i, error in enumerate(self.errors, 1):
                    f.write(f"### Error {i}\n\n")
                    f.write(f"- **Type**: {error['error_type']}\n")
                    f.write(f"- **Message**: {error['message']}\n")
                    f.write(f"- **Timestamp**: {error['timestamp']}\n")

                    if error.get('context'):
                        f.write(f"- **Context**: {json.dumps(error['context'], indent=2)}\n")

                    # Show question block if available
                    if error.get('question_block'):
                        f.write(f"\n**Question Raw Content**:\n\n")
                        f.write("```latex\n")
                        # Don't truncate - show full content with \begin{ex}...\end{ex}
                        content = error['question_block']
                        f.write(content)
                        f.write("\n```\n")

                    f.write("\n---\n\n")
        
        return error_file_path
    
    def save_error_json(self) -> str:
        """
        Save error data as JSON for programmatic access.
        
        Returns:
            Path to the saved JSON file
        """
        os.makedirs(self.output_dir, exist_ok=True)
        json_file_path = os.path.join(self.output_dir, "errors.json")
        
        error_data = {
            'statistics': self.statistics,
            'errors': self.errors,
            'malformed_questions': self.malformed_questions
        }
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(error_data, f, indent=2, ensure_ascii=False)
        
        return json_file_path
    
    def get_error_summary(self) -> Dict[str, Any]:
        """
        Get a summary of all errors.
        
        Returns:
            Dictionary with error summary
        """
        return {
            'total_errors': len(self.errors),
            'malformed_questions': len(self.malformed_questions),
            'error_types': self._count_error_types(),
            'statistics': self.statistics
        }
    
    def _count_error_types(self) -> Dict[str, int]:
        """Count errors by type."""
        error_types = {}
        for error in self.errors:
            error_type = error['error_type']
            error_types[error_type] = error_types.get(error_type, 0) + 1
        return error_types
    
    def save_failed_files_list(self) -> str:
        """
        Save list of failed files to failed_files.txt.

        Returns:
            Path to the saved file
        """
        os.makedirs(self.output_dir, exist_ok=True)
        failed_files_path = os.path.join(self.output_dir, "failed_files.txt")

        with open(failed_files_path, 'w', encoding='utf-8') as f:
            f.write("# Failed Files List\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n")
            f.write(f"# Total Failed Files: {len(self.failed_files)}\n\n")

            if self.failed_files:
                for failed_file in self.failed_files:
                    f.write(f"{failed_file['file_path']}\n")
                    f.write(f"  Error: {failed_file['message']}\n")
                    f.write(f"  Timestamp: {failed_file['timestamp']}\n\n")
            else:
                f.write("No failed files.\n")

        return failed_files_path

    def save_processing_summary(self) -> str:
        """
        Save processing summary to JSON file.

        Returns:
            Path to the saved file
        """
        os.makedirs(self.output_dir, exist_ok=True)
        summary_path = os.path.join(self.output_dir, "processing_summary.json")

        summary_data = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.statistics,
            'failed_files_count': len(self.failed_files),
            'failed_files': [
                {
                    'file_path': f['file_path'],
                    'file_name': f['file_name'],
                    'error_message': f['message'],
                    'timestamp': f['timestamp']
                }
                for f in self.failed_files
            ],
            'success_rate': (self.statistics['successful_files'] / self.statistics['total_files_processed'] * 100) if self.statistics['total_files_processed'] > 0 else 0
        }

        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)

        return summary_path

    def clear_errors(self):
        """Clear all stored errors."""
        self.errors.clear()
        self.malformed_questions.clear()
        self.failed_files.clear()
        self.file_errors.clear()
        self.statistics = {
            'total_errors': 0,
            'parsing_errors': 0,
            'validation_errors': 0,
            'malformed_questions': 0,
            'processing_start_time': None,
            'processing_end_time': None,
            'total_files_processed': 0,
            'successful_files': 0,
            'failed_files': 0
        }
