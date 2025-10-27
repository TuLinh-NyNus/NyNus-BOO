"""
Multi-File Processor

Handles concurrent processing of multiple LaTeX files with worker pool.
"""

import multiprocessing as mp
from typing import List, Dict, Tuple, Callable, Any, Optional
from concurrent.futures import ProcessPoolExecutor, as_completed
import time
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from processor.file_reader import FileReader
from processor.batch_processor import BatchProcessor
from processor.error_handler import ErrorHandler
from processor.checkpoint_manager import CheckpointManager
import uuid


class FileProcessingResult:
    """
    Result of processing a single file.
    """
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.file_name = os.path.basename(file_path)
        self.status = 'pending'  # pending, processing, success, failed
        self.questions = []
        self.question_codes = []
        self.errors = []
        self.processing_time = 0.0
        self.question_count = 0
        self.error_message = None
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'file_path': self.file_path,
            'file_name': self.file_name,
            'status': self.status,
            'question_count': self.question_count,
            'error_count': len(self.errors),
            'processing_time': self.processing_time,
            'error_message': self.error_message
        }


class MultiFileProcessor:
    """
    Processes multiple LaTeX files concurrently using worker pool.
    
    Features:
    - Concurrent file processing with configurable workers
    - Progress tracking for multiple files
    - Error aggregation across files
    - File-level retry mechanism
    """
    
    def __init__(self, max_workers: int = None, batch_size: int = 250, enable_checkpoint: bool = True):
        """
        Initialize multi-file processor.

        Args:
            max_workers: Maximum number of worker processes (default: CPU count)
            batch_size: Batch size for question processing within each file
            enable_checkpoint: Enable checkpoint/resume functionality
        """
        if max_workers is None:
            # Use CPU count for file-level parallelization
            cpu_count = mp.cpu_count()
            self.max_workers = min(4, cpu_count)  # Cap at 4 to avoid overhead
        else:
            self.max_workers = max_workers

        self.batch_size = batch_size
        self.processed_files = 0
        self.total_files = 0
        self.start_time = None
        self.file_results = []
        self.enable_checkpoint = enable_checkpoint
        self.checkpoint_manager = CheckpointManager() if enable_checkpoint else None
        self.session_id = None
        
    def process_files(
        self,
        file_paths: List[str],
        output_dir: str = "output",
        progress_callback: Callable[[int, int, float, Dict], None] = None,
        resume_session_id: str = None
    ) -> Dict[str, Any]:
        """
        Process multiple files concurrently with checkpoint support.

        Args:
            file_paths: List of file paths to process
            output_dir: Output directory for results
            progress_callback: Callback for progress updates
                               (processed_files, total_files, elapsed_time, current_file_result)
            resume_session_id: Session ID to resume from (optional)
        
        Returns:
            Dictionary with processing results:
            {
                'successful_files': List[FileProcessingResult],
                'failed_files': List[FileProcessingResult],
                'total_questions': int,
                'total_errors': int,
                'processing_time': float,
                'files_per_second': float
            }
        """
        # Initialize or resume session
        if resume_session_id and self.enable_checkpoint:
            # Resume from checkpoint
            checkpoint = self.checkpoint_manager.load_checkpoint(resume_session_id)
            if checkpoint:
                self.session_id = resume_session_id
                self.total_files = checkpoint.total_files
                self.processed_files = checkpoint.processed_files
                self.start_time = time.time()  # Reset start time for current run

                # Load partial results
                partial_results = self.checkpoint_manager.load_partial_results()

                # Reconstruct file_results from checkpoint
                self.file_results = checkpoint.file_results

                # Filter out already processed files
                processed_paths = set(r['file_path'] for r in checkpoint.file_results if r['status'] in ['success', 'failed'])
                file_paths = [fp for fp in file_paths if fp not in processed_paths]

                print(f"📂 Resuming session {resume_session_id}: {len(file_paths)} files remaining")
            else:
                print(f"⚠️ Checkpoint {resume_session_id} not found, starting new session")
                resume_session_id = None

        if not resume_session_id:
            # New session
            self.session_id = str(uuid.uuid4())
            self.total_files = len(file_paths)
            self.processed_files = 0
            self.start_time = time.time()
            self.file_results = []

            # Create checkpoint session
            if self.enable_checkpoint:
                self.checkpoint_manager.create_session(self.session_id, self.total_files)

        successful_files = []
        failed_files = []
        total_questions = 0
        total_errors = 0

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Process files concurrently
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all files for processing
            future_to_file = {
                executor.submit(
                    self._process_single_file,
                    file_path,
                    self.batch_size
                ): file_path
                for file_path in file_paths
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                
                try:
                    result = future.result()
                    self.file_results.append(result)

                    if result.status == 'success':
                        successful_files.append(result)
                        total_questions += result.question_count

                        # Save partial result if checkpoint enabled
                        if self.enable_checkpoint:
                            self.checkpoint_manager.save_partial_result(
                                result.file_path,
                                result.questions,
                                result.question_codes
                            )
                    else:
                        failed_files.append(result)

                    total_errors += len(result.errors)

                    # Update progress
                    self.processed_files += 1
                    elapsed_time = time.time() - self.start_time

                    # Update checkpoint
                    if self.enable_checkpoint:
                        self.checkpoint_manager.update_checkpoint(
                            processed_files=self.processed_files,
                            successful_files=len(successful_files),
                            failed_files=len(failed_files),
                            total_questions=total_questions,
                            file_result=result.to_dict()
                        )

                    if progress_callback:
                        progress_callback(
                            self.processed_files,
                            self.total_files,
                            elapsed_time,
                            result.to_dict()
                        )

                except Exception as e:
                    # Handle unexpected errors
                    error_result = FileProcessingResult(file_path)
                    error_result.status = 'failed'
                    error_result.error_message = f"Unexpected error: {str(e)}"
                    failed_files.append(error_result)
                    self.file_results.append(error_result)

                    self.processed_files += 1

                    # Update checkpoint for failed file
                    if self.enable_checkpoint:
                        self.checkpoint_manager.update_checkpoint(
                            processed_files=self.processed_files,
                            successful_files=len(successful_files),
                            failed_files=len(failed_files),
                            total_questions=total_questions,
                            file_result=error_result.to_dict()
                        )
        
        # Calculate final statistics
        processing_time = time.time() - self.start_time
        files_per_second = self.total_files / processing_time if processing_time > 0 else 0

        # Final checkpoint save
        if self.enable_checkpoint:
            self.checkpoint_manager.save_checkpoint(self.checkpoint_manager.current_checkpoint)

            # Cleanup checkpoint if all files processed successfully
            if len(failed_files) == 0:
                print(f"✅ All files processed successfully, cleaning up checkpoint {self.session_id}")
                self.checkpoint_manager.cleanup_checkpoint(self.session_id)

        return {
            'successful_files': successful_files,
            'failed_files': failed_files,
            'total_files': self.total_files,
            'successful_count': len(successful_files),
            'failed_count': len(failed_files),
            'total_questions': total_questions,
            'total_errors': total_errors,
            'processing_time': processing_time,
            'files_per_second': files_per_second,
            'file_results': self.file_results,
            'session_id': self.session_id
        }
    
    @staticmethod
    def _process_single_file(file_path: str, batch_size: int) -> FileProcessingResult:
        """
        Process a single file (static method for multiprocessing).
        
        Args:
            file_path: Path to the file to process
            batch_size: Batch size for question processing
            
        Returns:
            FileProcessingResult object
        """
        result = FileProcessingResult(file_path)
        result.status = 'processing'
        start_time = time.time()
        
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                result.status = 'failed'
                result.error_message = f"File not found: {file_path}"
                return result
            
            # Read file
            file_reader = FileReader(file_path)
            
            # Count questions
            question_count = file_reader.count_questions()
            if question_count == 0:
                result.status = 'failed'
                result.error_message = "No questions found in file"
                return result
            
            # Split into batches
            batches = file_reader.split_into_batches(batch_size)
            
            # Process batches with single worker (file-level parallelization already happening)
            batch_processor = BatchProcessor(max_workers=1)
            questions, question_codes, errors = batch_processor.process_batches(batches)
            
            # Update result
            result.questions = questions
            result.question_codes = question_codes
            result.errors = errors
            result.question_count = len(questions)
            result.status = 'success'
            
        except Exception as e:
            result.status = 'failed'
            result.error_message = str(e)
            result.errors.append(f"File processing error: {str(e)}")
        
        finally:
            result.processing_time = time.time() - start_time
        
        return result
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """
        Get current processing statistics.

        Returns:
            Dictionary with processing stats
        """
        elapsed_time = time.time() - self.start_time if self.start_time else 0

        return {
            'processed_files': self.processed_files,
            'total_files': self.total_files,
            'progress_percentage': (self.processed_files / self.total_files * 100) if self.total_files > 0 else 0,
            'elapsed_time_seconds': elapsed_time,
            'files_per_second': self.processed_files / elapsed_time if elapsed_time > 0 else 0,
            'estimated_remaining_seconds': ((self.total_files - self.processed_files) / (self.processed_files / elapsed_time)) if self.processed_files > 0 and elapsed_time > 0 else 0,
            'max_workers': self.max_workers,
            'session_id': self.session_id,
            'checkpoint_enabled': self.enable_checkpoint
        }

    def list_resumable_sessions(self) -> List[Dict[str, Any]]:
        """
        List all resumable checkpoint sessions.

        Returns:
            List of checkpoint summaries
        """
        if not self.enable_checkpoint:
            return []

        return self.checkpoint_manager.list_checkpoints()

    def get_checkpoint_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a checkpoint.

        Args:
            session_id: Session ID to query

        Returns:
            Checkpoint information or None
        """
        if not self.enable_checkpoint:
            return None

        checkpoint = self.checkpoint_manager.load_checkpoint(session_id)
        if checkpoint:
            return checkpoint.to_dict()
        return None

