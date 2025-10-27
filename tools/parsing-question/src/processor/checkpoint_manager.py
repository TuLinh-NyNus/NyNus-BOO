"""
Checkpoint Manager

Manages checkpoints for resumable processing.
"""

import os
import json
import pickle
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path


class CheckpointData:
    """
    Checkpoint data structure.
    """
    def __init__(
        self,
        session_id: str,
        total_files: int,
        processed_files: int,
        successful_files: int,
        failed_files: int,
        total_questions: int,
        start_time: str,
        last_update: str,
        file_results: List[Dict[str, Any]] = None,
        partial_results_dir: str = None
    ):
        self.session_id = session_id
        self.total_files = total_files
        self.processed_files = processed_files
        self.successful_files = successful_files
        self.failed_files = failed_files
        self.total_questions = total_questions
        self.start_time = start_time
        self.last_update = last_update
        self.file_results = file_results or []
        self.partial_results_dir = partial_results_dir
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'session_id': self.session_id,
            'total_files': self.total_files,
            'processed_files': self.processed_files,
            'successful_files': self.successful_files,
            'failed_files': self.failed_files,
            'total_questions': self.total_questions,
            'start_time': self.start_time,
            'last_update': self.last_update,
            'file_results': self.file_results,
            'partial_results_dir': self.partial_results_dir
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CheckpointData':
        """Create from dictionary."""
        return cls(
            session_id=data['session_id'],
            total_files=data['total_files'],
            processed_files=data['processed_files'],
            successful_files=data['successful_files'],
            failed_files=data['failed_files'],
            total_questions=data['total_questions'],
            start_time=data['start_time'],
            last_update=data['last_update'],
            file_results=data.get('file_results', []),
            partial_results_dir=data.get('partial_results_dir')
        )


class CheckpointManager:
    """
    Manages checkpoints for resumable multi-file processing.
    
    Features:
    - Auto-save checkpoints at intervals
    - Save partial results per file
    - Resume from last checkpoint
    - Cleanup old checkpoints
    """
    
    def __init__(
        self,
        checkpoint_dir: str = "output/checkpoints",
        auto_save_interval: int = 5  # Save every 5 files
    ):
        """
        Initialize checkpoint manager.
        
        Args:
            checkpoint_dir: Directory to save checkpoints
            auto_save_interval: Number of files between auto-saves
        """
        self.checkpoint_dir = checkpoint_dir
        self.auto_save_interval = auto_save_interval
        self.current_checkpoint: Optional[CheckpointData] = None
        self.files_since_last_save = 0
        
        os.makedirs(checkpoint_dir, exist_ok=True)
    
    def create_session(self, session_id: str, total_files: int) -> CheckpointData:
        """
        Create a new processing session.
        
        Args:
            session_id: Unique session identifier
            total_files: Total number of files to process
            
        Returns:
            CheckpointData object
        """
        checkpoint = CheckpointData(
            session_id=session_id,
            total_files=total_files,
            processed_files=0,
            successful_files=0,
            failed_files=0,
            total_questions=0,
            start_time=datetime.now().isoformat(),
            last_update=datetime.now().isoformat(),
            partial_results_dir=os.path.join(self.checkpoint_dir, session_id, "partial_results")
        )
        
        # Create partial results directory
        os.makedirs(checkpoint.partial_results_dir, exist_ok=True)
        
        self.current_checkpoint = checkpoint
        self.save_checkpoint(checkpoint)
        
        return checkpoint
    
    def update_checkpoint(
        self,
        processed_files: int,
        successful_files: int,
        failed_files: int,
        total_questions: int,
        file_result: Dict[str, Any] = None
    ):
        """
        Update current checkpoint.
        
        Args:
            processed_files: Number of files processed
            successful_files: Number of successful files
            failed_files: Number of failed files
            total_questions: Total questions processed
            file_result: Latest file result to add
        """
        if not self.current_checkpoint:
            raise ValueError("No active checkpoint session")
        
        self.current_checkpoint.processed_files = processed_files
        self.current_checkpoint.successful_files = successful_files
        self.current_checkpoint.failed_files = failed_files
        self.current_checkpoint.total_questions = total_questions
        self.current_checkpoint.last_update = datetime.now().isoformat()
        
        if file_result:
            self.current_checkpoint.file_results.append(file_result)
        
        self.files_since_last_save += 1
        
        # Auto-save at intervals
        if self.files_since_last_save >= self.auto_save_interval:
            self.save_checkpoint(self.current_checkpoint)
            self.files_since_last_save = 0
    
    def save_checkpoint(self, checkpoint: CheckpointData):
        """
        Save checkpoint to disk.
        
        Args:
            checkpoint: CheckpointData to save
        """
        checkpoint_file = os.path.join(
            self.checkpoint_dir,
            f"{checkpoint.session_id}_checkpoint.json"
        )
        
        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump(checkpoint.to_dict(), f, indent=2, ensure_ascii=False)
    
    def load_checkpoint(self, session_id: str) -> Optional[CheckpointData]:
        """
        Load checkpoint from disk.
        
        Args:
            session_id: Session ID to load
            
        Returns:
            CheckpointData if found, None otherwise
        """
        checkpoint_file = os.path.join(
            self.checkpoint_dir,
            f"{session_id}_checkpoint.json"
        )
        
        if not os.path.exists(checkpoint_file):
            return None
        
        try:
            with open(checkpoint_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            checkpoint = CheckpointData.from_dict(data)
            self.current_checkpoint = checkpoint
            return checkpoint
            
        except Exception as e:
            print(f"Error loading checkpoint: {str(e)}")
            return None
    
    def save_partial_result(
        self,
        file_path: str,
        questions: List[Any],
        question_codes: List[Any]
    ):
        """
        Save partial result for a single file.
        
        Args:
            file_path: Path to the processed file
            questions: List of Question objects
            question_codes: List of QuestionCode objects
        """
        if not self.current_checkpoint:
            raise ValueError("No active checkpoint session")
        
        file_name = os.path.basename(file_path)
        result_file = os.path.join(
            self.current_checkpoint.partial_results_dir,
            f"{file_name}.pkl"
        )
        
        # Save using pickle for Python objects
        with open(result_file, 'wb') as f:
            pickle.dump({
                'file_path': file_path,
                'questions': questions,
                'question_codes': question_codes,
                'saved_at': datetime.now().isoformat()
            }, f)
    
    def load_partial_results(self) -> Dict[str, Any]:
        """
        Load all partial results from current session.
        
        Returns:
            Dictionary mapping file paths to results
        """
        if not self.current_checkpoint:
            raise ValueError("No active checkpoint session")
        
        results = {}
        partial_dir = self.current_checkpoint.partial_results_dir
        
        if not os.path.exists(partial_dir):
            return results
        
        for file_name in os.listdir(partial_dir):
            if file_name.endswith('.pkl'):
                result_file = os.path.join(partial_dir, file_name)
                
                try:
                    with open(result_file, 'rb') as f:
                        data = pickle.load(f)
                    results[data['file_path']] = data
                except Exception as e:
                    print(f"Error loading partial result {file_name}: {str(e)}")
        
        return results
    
    def list_checkpoints(self) -> List[Dict[str, Any]]:
        """
        List all available checkpoints.
        
        Returns:
            List of checkpoint summaries
        """
        checkpoints = []
        
        for file_name in os.listdir(self.checkpoint_dir):
            if file_name.endswith('_checkpoint.json'):
                checkpoint_file = os.path.join(self.checkpoint_dir, file_name)
                
                try:
                    with open(checkpoint_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    checkpoints.append({
                        'session_id': data['session_id'],
                        'total_files': data['total_files'],
                        'processed_files': data['processed_files'],
                        'progress_percentage': (data['processed_files'] / data['total_files'] * 100) if data['total_files'] > 0 else 0,
                        'last_update': data['last_update'],
                        'can_resume': data['processed_files'] < data['total_files']
                    })
                except Exception as e:
                    print(f"Error reading checkpoint {file_name}: {str(e)}")
        
        # Sort by last update (newest first)
        checkpoints.sort(key=lambda x: x['last_update'], reverse=True)
        
        return checkpoints
    
    def cleanup_checkpoint(self, session_id: str):
        """
        Clean up checkpoint and partial results.
        
        Args:
            session_id: Session ID to clean up
        """
        # Remove checkpoint file
        checkpoint_file = os.path.join(
            self.checkpoint_dir,
            f"{session_id}_checkpoint.json"
        )
        if os.path.exists(checkpoint_file):
            os.remove(checkpoint_file)
        
        # Remove partial results directory
        partial_dir = os.path.join(self.checkpoint_dir, session_id, "partial_results")
        if os.path.exists(partial_dir):
            import shutil
            shutil.rmtree(partial_dir, ignore_errors=True)

