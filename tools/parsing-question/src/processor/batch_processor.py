"""
Batch Processor

Handles multiprocessing batch processing of question blocks.
"""

import multiprocessing as mp
from typing import List, Tuple, Callable, Any
from concurrent.futures import ProcessPoolExecutor, as_completed
import time
import sys
import os

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from parser.latex_parser import LaTeXQuestionParser
from parser.tag_generator import TagGenerator


class BatchProcessor:
    """
    Multiprocessing batch processor for LaTeX questions.
    
    Processes large numbers of questions efficiently using all available CPU cores.
    """
    
    def __init__(self, max_workers: int = None):
        """
        Initialize batch processor.
        
        Args:
            max_workers: Maximum number of worker processes (default: CPU count)
        """
        self.max_workers = max_workers or mp.cpu_count()
        self.processed_count = 0
        self.total_count = 0
        self.start_time = None
    
    def process_batches(
        self, 
        batches: List[List[str]], 
        progress_callback: Callable[[int, int, float], None] = None
    ) -> Tuple[List[Question], List[QuestionCode], List[str]]:
        """
        Process multiple batches of question blocks.
        
        Args:
            batches: List of batches, each containing question blocks
            progress_callback: Optional callback for progress updates (processed, total, elapsed_time)
            
        Returns:
            Tuple of (all_questions, all_question_codes, all_errors)
        """
        all_questions = []
        all_question_codes = []
        all_errors = []
        
        self.total_count = sum(len(batch) for batch in batches)
        self.processed_count = 0
        self.start_time = time.time()
        
        # Track unique question codes
        seen_codes = set()
        
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all batches for processing
            future_to_batch = {
                executor.submit(self._process_single_batch, batch, i): (batch, i) 
                for i, batch in enumerate(batches)
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_batch):
                batch, batch_index = future_to_batch[future]
                
                try:
                    batch_questions, batch_codes, batch_errors = future.result()
                    
                    # Assign sequential IDs across all batches
                    for question in batch_questions:
                        question.id = len(all_questions) + 1
                        all_questions.append(question)
                    
                    # Collect unique question codes
                    for code in batch_codes:
                        if code.code not in seen_codes:
                            all_question_codes.append(code)
                            seen_codes.add(code.code)
                    
                    all_errors.extend(batch_errors)
                    
                    # Update progress
                    self.processed_count += len(batch)
                    elapsed_time = time.time() - self.start_time
                    
                    if progress_callback:
                        progress_callback(self.processed_count, self.total_count, elapsed_time)
                    
                except Exception as e:
                    error_msg = f"Batch {batch_index} processing failed: {str(e)}"
                    all_errors.append(error_msg)
                    print(f"Error: {error_msg}")
        
        return all_questions, all_question_codes, all_errors
    
    @staticmethod
    def _process_single_batch(question_blocks: List[str], batch_index: int) -> Tuple[List[Question], List[QuestionCode], List[str]]:
        """
        Process a single batch of question blocks.
        
        Args:
            question_blocks: List of question block strings
            batch_index: Index of this batch
            
        Returns:
            Tuple of (questions, question_codes, errors)
        """
        questions = []
        question_codes = []
        errors = []
        seen_codes = set()
        
        for i, block in enumerate(question_blocks):
            try:
                question = LaTeXQuestionParser.parse_single_question(block)
                
                if question:
                    # Generate tags from QuestionCode
                    if question.questionCodeId:
                        try:
                            tag_generator = TagGenerator()
                            question.generate_tags_from_code(tag_generator)
                        except Exception as tag_error:
                            # Don't fail the whole question if tag generation fails
                            errors.append(f"Batch {batch_index}, Question {i+1}: Tag generation failed: {str(tag_error)}")

                    questions.append(question)

                    # Collect unique question codes
                    if question.questionCodeId and question.questionCodeId not in seen_codes:
                        from parser.question_code_parser import QuestionCodeParser
                        question_code = QuestionCodeParser.extract_question_code(block)
                        if question_code:
                            question_codes.append(question_code)
                            seen_codes.add(question_code.code)
                else:
                    errors.append(f"Batch {batch_index}, Question {i+1}: Failed to parse")
                    
            except Exception as e:
                error_msg = f"Batch {batch_index}, Question {i+1}: {str(e)}"
                errors.append(error_msg)
        
        return questions, question_codes, errors
    
    def get_processing_stats(self) -> dict:
        """
        Get current processing statistics.
        
        Returns:
            Dictionary with processing stats
        """
        elapsed_time = time.time() - self.start_time if self.start_time else 0
        
        return {
            'processed_count': self.processed_count,
            'total_count': self.total_count,
            'progress_percentage': (self.processed_count / self.total_count * 100) if self.total_count > 0 else 0,
            'elapsed_time_seconds': elapsed_time,
            'questions_per_second': self.processed_count / elapsed_time if elapsed_time > 0 else 0,
            'estimated_remaining_seconds': ((self.total_count - self.processed_count) / (self.processed_count / elapsed_time)) if self.processed_count > 0 and elapsed_time > 0 else 0,
            'max_workers': self.max_workers
        }
    
    def estimate_processing_time(self, total_questions: int, sample_size: int = 100) -> dict:
        """
        Estimate total processing time based on a sample.
        
        Args:
            total_questions: Total number of questions to process
            sample_size: Number of questions to use for estimation
            
        Returns:
            Dictionary with time estimates
        """
        # This would be called with a small sample to estimate total time
        # For now, return rough estimates based on typical performance
        questions_per_second = 50  # Rough estimate
        
        total_seconds = total_questions / questions_per_second
        
        return {
            'estimated_total_seconds': total_seconds,
            'estimated_total_minutes': total_seconds / 60,
            'estimated_total_hours': total_seconds / 3600,
            'questions_per_second_estimate': questions_per_second,
            'sample_size': sample_size
        }
