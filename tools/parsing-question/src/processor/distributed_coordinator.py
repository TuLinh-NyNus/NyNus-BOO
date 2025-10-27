"""
Distributed Coordinator

Coordinates distributed processing across multiple machines/workers.
"""

import os
import json
import socket
import threading
import time
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from enum import Enum
import queue


class WorkerStatus(Enum):
    """Worker status enum."""
    IDLE = "idle"
    BUSY = "busy"
    OFFLINE = "offline"
    ERROR = "error"


class WorkerInfo:
    """
    Information about a distributed worker.
    """
    def __init__(self, worker_id: str, host: str, port: int, max_capacity: int = 1):
        self.worker_id = worker_id
        self.host = host
        self.port = port
        self.max_capacity = max_capacity
        self.current_load = 0
        self.status = WorkerStatus.IDLE
        self.last_heartbeat = datetime.now().isoformat()
        self.total_processed = 0
        self.total_errors = 0
        self.current_task = None
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'worker_id': self.worker_id,
            'host': self.host,
            'port': self.port,
            'max_capacity': self.max_capacity,
            'current_load': self.current_load,
            'status': self.status.value,
            'last_heartbeat': self.last_heartbeat,
            'total_processed': self.total_processed,
            'total_errors': self.total_errors,
            'current_task': self.current_task
        }


class Task:
    """
    Distributed processing task.
    """
    def __init__(self, task_id: str, file_path: str, priority: int = 0):
        self.task_id = task_id
        self.file_path = file_path
        self.priority = priority
        self.status = 'pending'  # pending, assigned, processing, completed, failed
        self.assigned_worker = None
        self.created_at = datetime.now().isoformat()
        self.started_at = None
        self.completed_at = None
        self.result = None
        self.error_message = None
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'task_id': self.task_id,
            'file_path': self.file_path,
            'priority': self.priority,
            'status': self.status,
            'assigned_worker': self.assigned_worker,
            'created_at': self.created_at,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
            'error_message': self.error_message
        }


class DistributedCoordinator:
    """
    Coordinates distributed processing across multiple workers.
    
    Features:
    - Worker registration and heartbeat monitoring
    - Task distribution with load balancing
    - Result aggregation
    - Fault tolerance (worker failure handling)
    - Progress tracking
    """
    
    def __init__(
        self,
        coordinator_port: int = 5000,
        heartbeat_interval: int = 30,  # seconds
        heartbeat_timeout: int = 90  # seconds
    ):
        """
        Initialize distributed coordinator.
        
        Args:
            coordinator_port: Port for coordinator server
            heartbeat_interval: Interval between heartbeats
            heartbeat_timeout: Timeout before marking worker offline
        """
        self.coordinator_port = coordinator_port
        self.heartbeat_interval = heartbeat_interval
        self.heartbeat_timeout = heartbeat_timeout
        
        self.workers: Dict[str, WorkerInfo] = {}
        self.tasks: Dict[str, Task] = {}
        self.task_queue = queue.PriorityQueue()
        
        self.is_running = False
        self.heartbeat_thread = None
        self.task_distribution_thread = None
        
    def register_worker(
        self,
        worker_id: str,
        host: str,
        port: int,
        max_capacity: int = 1
    ) -> bool:
        """
        Register a new worker.
        
        Args:
            worker_id: Unique worker identifier
            host: Worker host address
            port: Worker port
            max_capacity: Maximum concurrent tasks
            
        Returns:
            True if registered successfully
        """
        if worker_id in self.workers:
            print(f"⚠️ Worker {worker_id} already registered, updating info")
        
        worker = WorkerInfo(worker_id, host, port, max_capacity)
        self.workers[worker_id] = worker
        
        print(f"✅ Worker {worker_id} registered at {host}:{port}")
        return True
    
    def unregister_worker(self, worker_id: str):
        """
        Unregister a worker.
        
        Args:
            worker_id: Worker ID to unregister
        """
        if worker_id in self.workers:
            # Reassign tasks from this worker
            for task in self.tasks.values():
                if task.assigned_worker == worker_id and task.status in ['assigned', 'processing']:
                    task.status = 'pending'
                    task.assigned_worker = None
                    self.task_queue.put((-task.priority, task.task_id))
            
            del self.workers[worker_id]
            print(f"🔴 Worker {worker_id} unregistered")
    
    def submit_tasks(self, file_paths: List[str], priority: int = 0) -> List[str]:
        """
        Submit tasks for processing.
        
        Args:
            file_paths: List of file paths to process
            priority: Task priority (higher = processed first)
            
        Returns:
            List of task IDs
        """
        task_ids = []
        
        for file_path in file_paths:
            task_id = f"task_{len(self.tasks)}_{int(time.time())}"
            task = Task(task_id, file_path, priority)
            
            self.tasks[task_id] = task
            self.task_queue.put((-priority, task_id))  # Negative for max-heap
            task_ids.append(task_id)
        
        print(f"📋 Submitted {len(task_ids)} tasks")
        return task_ids
    
    def get_available_worker(self) -> Optional[WorkerInfo]:
        """
        Get an available worker with capacity.
        
        Returns:
            WorkerInfo if available, None otherwise
        """
        available_workers = [
            w for w in self.workers.values()
            if w.status in [WorkerStatus.IDLE, WorkerStatus.BUSY] and w.current_load < w.max_capacity
        ]
        
        if not available_workers:
            return None
        
        # Return worker with lowest load
        return min(available_workers, key=lambda w: w.current_load)
    
    def assign_task(self, task: Task, worker: WorkerInfo) -> bool:
        """
        Assign task to worker.
        
        Args:
            task: Task to assign
            worker: Worker to assign to
            
        Returns:
            True if assigned successfully
        """
        task.status = 'assigned'
        task.assigned_worker = worker.worker_id
        task.started_at = datetime.now().isoformat()
        
        worker.current_load += 1
        worker.current_task = task.task_id
        worker.status = WorkerStatus.BUSY
        
        print(f"📤 Assigned task {task.task_id} to worker {worker.worker_id}")
        return True
    
    def task_completed(self, task_id: str, result: Dict[str, Any]):
        """
        Mark task as completed.
        
        Args:
            task_id: Task ID
            result: Task result data
        """
        if task_id not in self.tasks:
            print(f"⚠️ Unknown task {task_id}")
            return
        
        task = self.tasks[task_id]
        task.status = 'completed'
        task.completed_at = datetime.now().isoformat()
        task.result = result
        
        # Update worker
        if task.assigned_worker and task.assigned_worker in self.workers:
            worker = self.workers[task.assigned_worker]
            worker.current_load = max(0, worker.current_load - 1)
            worker.total_processed += 1
            
            if worker.current_load == 0:
                worker.status = WorkerStatus.IDLE
                worker.current_task = None
        
        print(f"✅ Task {task_id} completed")
    
    def task_failed(self, task_id: str, error_message: str):
        """
        Mark task as failed.
        
        Args:
            task_id: Task ID
            error_message: Error message
        """
        if task_id not in self.tasks:
            print(f"⚠️ Unknown task {task_id}")
            return
        
        task = self.tasks[task_id]
        task.status = 'failed'
        task.completed_at = datetime.now().isoformat()
        task.error_message = error_message
        
        # Update worker
        if task.assigned_worker and task.assigned_worker in self.workers:
            worker = self.workers[task.assigned_worker]
            worker.current_load = max(0, worker.current_load - 1)
            worker.total_errors += 1
            
            if worker.current_load == 0:
                worker.status = WorkerStatus.IDLE
                worker.current_task = None
        
        print(f"❌ Task {task_id} failed: {error_message}")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get coordinator status.
        
        Returns:
            Status dictionary
        """
        total_tasks = len(self.tasks)
        completed_tasks = sum(1 for t in self.tasks.values() if t.status == 'completed')
        failed_tasks = sum(1 for t in self.tasks.values() if t.status == 'failed')
        pending_tasks = sum(1 for t in self.tasks.values() if t.status == 'pending')
        processing_tasks = sum(1 for t in self.tasks.values() if t.status in ['assigned', 'processing'])
        
        return {
            'total_workers': len(self.workers),
            'active_workers': sum(1 for w in self.workers.values() if w.status != WorkerStatus.OFFLINE),
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'failed_tasks': failed_tasks,
            'pending_tasks': pending_tasks,
            'processing_tasks': processing_tasks,
            'progress_percentage': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            'workers': [w.to_dict() for w in self.workers.values()],
            'is_running': self.is_running
        }

