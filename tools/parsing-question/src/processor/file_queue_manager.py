"""
File Queue Manager

Manages queue of files for processing with priority and retry support.
"""

import os
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import json


class FileStatus(Enum):
    """File processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    RETRY = "retry"


class FileQueueItem:
    """
    Represents a file in the processing queue.
    """
    def __init__(self, file_path: str, priority: int = 0):
        self.file_path = file_path
        self.file_name = os.path.basename(file_path)
        self.priority = priority  # Higher priority processed first
        self.status = FileStatus.PENDING
        self.retry_count = 0
        self.max_retries = 3
        self.error_message = None
        self.added_at = datetime.now().isoformat()
        self.started_at = None
        self.completed_at = None
        self.processing_time = 0.0
        self.question_count = 0
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'file_path': self.file_path,
            'file_name': self.file_name,
            'priority': self.priority,
            'status': self.status.value,
            'retry_count': self.retry_count,
            'max_retries': self.max_retries,
            'error_message': self.error_message,
            'added_at': self.added_at,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
            'processing_time': self.processing_time,
            'question_count': self.question_count
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'FileQueueItem':
        """Create from dictionary."""
        item = cls(data['file_path'], data.get('priority', 0))
        item.file_name = data.get('file_name', os.path.basename(data['file_path']))
        item.status = FileStatus(data.get('status', 'pending'))
        item.retry_count = data.get('retry_count', 0)
        item.max_retries = data.get('max_retries', 3)
        item.error_message = data.get('error_message')
        item.added_at = data.get('added_at', datetime.now().isoformat())
        item.started_at = data.get('started_at')
        item.completed_at = data.get('completed_at')
        item.processing_time = data.get('processing_time', 0.0)
        item.question_count = data.get('question_count', 0)
        return item


class FileQueueManager:
    """
    Manages queue of files for processing.
    
    Features:
    - Priority-based queue
    - Retry mechanism for failed files
    - Queue persistence (save/load)
    - Status tracking
    """
    
    def __init__(self, queue_file: str = "output/file_queue.json"):
        """
        Initialize file queue manager.
        
        Args:
            queue_file: Path to queue persistence file
        """
        self.queue_file = queue_file
        self.queue: List[FileQueueItem] = []
        self.completed: List[FileQueueItem] = []
        self.failed: List[FileQueueItem] = []
        
    def add_files(self, file_paths: List[str], priority: int = 0):
        """
        Add files to the queue.
        
        Args:
            file_paths: List of file paths to add
            priority: Priority level (higher = processed first)
        """
        for file_path in file_paths:
            # Check if file already in queue
            if not any(item.file_path == file_path for item in self.queue):
                item = FileQueueItem(file_path, priority)
                self.queue.append(item)
        
        # Sort by priority (descending)
        self.queue.sort(key=lambda x: x.priority, reverse=True)
    
    def get_next_file(self) -> Optional[FileQueueItem]:
        """
        Get next file to process from queue.
        
        Returns:
            Next FileQueueItem or None if queue is empty
        """
        # Get pending or retry files
        for item in self.queue:
            if item.status in [FileStatus.PENDING, FileStatus.RETRY]:
                item.status = FileStatus.PROCESSING
                item.started_at = datetime.now().isoformat()
                return item
        
        return None
    
    def mark_success(self, file_path: str, question_count: int, processing_time: float):
        """
        Mark file as successfully processed.
        
        Args:
            file_path: Path to the file
            question_count: Number of questions processed
            processing_time: Processing time in seconds
        """
        item = self._find_item(file_path)
        if item:
            item.status = FileStatus.SUCCESS
            item.completed_at = datetime.now().isoformat()
            item.question_count = question_count
            item.processing_time = processing_time
            self.completed.append(item)
            self.queue.remove(item)
    
    def mark_failed(self, file_path: str, error_message: str, processing_time: float):
        """
        Mark file as failed.
        
        Args:
            file_path: Path to the file
            error_message: Error message
            processing_time: Processing time in seconds
        """
        item = self._find_item(file_path)
        if item:
            item.error_message = error_message
            item.processing_time = processing_time
            item.retry_count += 1
            
            if item.retry_count < item.max_retries:
                # Retry
                item.status = FileStatus.RETRY
                item.started_at = None
            else:
                # Max retries reached
                item.status = FileStatus.FAILED
                item.completed_at = datetime.now().isoformat()
                self.failed.append(item)
                self.queue.remove(item)
    
    def get_queue_status(self) -> Dict[str, Any]:
        """
        Get current queue status.
        
        Returns:
            Dictionary with queue statistics
        """
        pending_count = sum(1 for item in self.queue if item.status == FileStatus.PENDING)
        processing_count = sum(1 for item in self.queue if item.status == FileStatus.PROCESSING)
        retry_count = sum(1 for item in self.queue if item.status == FileStatus.RETRY)
        
        return {
            'total_files': len(self.queue) + len(self.completed) + len(self.failed),
            'pending': pending_count,
            'processing': processing_count,
            'retry': retry_count,
            'completed': len(self.completed),
            'failed': len(self.failed),
            'queue_size': len(self.queue),
            'total_questions': sum(item.question_count for item in self.completed),
            'success_rate': (len(self.completed) / (len(self.completed) + len(self.failed)) * 100) if (len(self.completed) + len(self.failed)) > 0 else 0
        }
    
    def get_failed_files(self) -> List[str]:
        """
        Get list of failed file paths.
        
        Returns:
            List of file paths that failed processing
        """
        return [item.file_path for item in self.failed]
    
    def save_queue(self):
        """Save queue to file for persistence."""
        os.makedirs(os.path.dirname(self.queue_file), exist_ok=True)
        
        data = {
            'queue': [item.to_dict() for item in self.queue],
            'completed': [item.to_dict() for item in self.completed],
            'failed': [item.to_dict() for item in self.failed],
            'saved_at': datetime.now().isoformat()
        }
        
        with open(self.queue_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def load_queue(self) -> bool:
        """
        Load queue from file.
        
        Returns:
            True if loaded successfully, False otherwise
        """
        if not os.path.exists(self.queue_file):
            return False
        
        try:
            with open(self.queue_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self.queue = [FileQueueItem.from_dict(item) for item in data.get('queue', [])]
            self.completed = [FileQueueItem.from_dict(item) for item in data.get('completed', [])]
            self.failed = [FileQueueItem.from_dict(item) for item in data.get('failed', [])]
            
            return True
        except Exception as e:
            print(f"Error loading queue: {str(e)}")
            return False
    
    def clear_queue(self):
        """Clear all queues."""
        self.queue.clear()
        self.completed.clear()
        self.failed.clear()
    
    def _find_item(self, file_path: str) -> Optional[FileQueueItem]:
        """Find item in queue by file path."""
        for item in self.queue:
            if item.file_path == file_path:
                return item
        return None

