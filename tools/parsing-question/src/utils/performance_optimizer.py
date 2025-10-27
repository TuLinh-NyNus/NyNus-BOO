"""
Performance Optimizer

Optimizes processing performance through dynamic tuning.
"""

import os
import psutil
import time
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PerformanceMetrics:
    """Performance metrics data."""
    cpu_percent: float
    memory_percent: float
    memory_available_mb: float
    disk_io_read_mb: float
    disk_io_write_mb: float
    questions_per_second: float
    files_per_second: float
    avg_file_processing_time: float
    timestamp: float


class PerformanceOptimizer:
    """
    Optimizes processing performance dynamically.
    
    Features:
    - Auto-tune batch size based on memory
    - Auto-tune worker count based on CPU
    - Memory pressure detection
    - I/O bottleneck detection
    - Performance recommendations
    """
    
    def __init__(
        self,
        initial_batch_size: int = 250,
        initial_workers: int = 4,
        min_batch_size: int = 50,
        max_batch_size: int = 1000,
        min_workers: int = 1,
        max_workers: int = 8
    ):
        """
        Initialize performance optimizer.
        
        Args:
            initial_batch_size: Starting batch size
            initial_workers: Starting worker count
            min_batch_size: Minimum batch size
            max_batch_size: Maximum batch size
            min_workers: Minimum workers
            max_workers: Maximum workers
        """
        self.current_batch_size = initial_batch_size
        self.current_workers = initial_workers
        self.min_batch_size = min_batch_size
        self.max_batch_size = max_batch_size
        self.min_workers = min_workers
        self.max_workers = max_workers
        
        self.metrics_history = []
        self.last_adjustment_time = time.time()
        self.adjustment_cooldown = 30  # seconds
        
        # Performance thresholds
        self.memory_high_threshold = 85  # %
        self.memory_critical_threshold = 95  # %
        self.cpu_low_threshold = 30  # %
        self.cpu_high_threshold = 90  # %
        
    def collect_metrics(
        self,
        questions_processed: int = 0,
        files_processed: int = 0,
        elapsed_time: float = 0
    ) -> PerformanceMetrics:
        """
        Collect current performance metrics.
        
        Args:
            questions_processed: Number of questions processed
            files_processed: Number of files processed
            elapsed_time: Elapsed time in seconds
            
        Returns:
            PerformanceMetrics object
        """
        # CPU and Memory
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_available_mb = memory.available / (1024 * 1024)
        
        # Disk I/O
        disk_io = psutil.disk_io_counters()
        disk_io_read_mb = disk_io.read_bytes / (1024 * 1024) if disk_io else 0
        disk_io_write_mb = disk_io.write_bytes / (1024 * 1024) if disk_io else 0
        
        # Processing rates
        questions_per_second = questions_processed / elapsed_time if elapsed_time > 0 else 0
        files_per_second = files_processed / elapsed_time if elapsed_time > 0 else 0
        avg_file_time = elapsed_time / files_processed if files_processed > 0 else 0
        
        metrics = PerformanceMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            memory_available_mb=memory_available_mb,
            disk_io_read_mb=disk_io_read_mb,
            disk_io_write_mb=disk_io_write_mb,
            questions_per_second=questions_per_second,
            files_per_second=files_per_second,
            avg_file_processing_time=avg_file_time,
            timestamp=time.time()
        )
        
        self.metrics_history.append(metrics)
        
        # Keep only last 100 metrics
        if len(self.metrics_history) > 100:
            self.metrics_history = self.metrics_history[-100:]
        
        return metrics
    
    def should_adjust(self) -> bool:
        """
        Check if enough time has passed since last adjustment.
        
        Returns:
            True if should adjust
        """
        return (time.time() - self.last_adjustment_time) >= self.adjustment_cooldown
    
    def optimize_batch_size(self, current_metrics: PerformanceMetrics) -> int:
        """
        Optimize batch size based on memory usage.
        
        Args:
            current_metrics: Current performance metrics
            
        Returns:
            Recommended batch size
        """
        if not self.should_adjust():
            return self.current_batch_size
        
        memory_percent = current_metrics.memory_percent
        
        # Critical memory - reduce batch size significantly
        if memory_percent >= self.memory_critical_threshold:
            new_batch_size = max(self.min_batch_size, int(self.current_batch_size * 0.5))
            print(f"🔴 Critical memory ({memory_percent:.1f}%), reducing batch size: {self.current_batch_size} → {new_batch_size}")
            
        # High memory - reduce batch size
        elif memory_percent >= self.memory_high_threshold:
            new_batch_size = max(self.min_batch_size, int(self.current_batch_size * 0.8))
            print(f"🟡 High memory ({memory_percent:.1f}%), reducing batch size: {self.current_batch_size} → {new_batch_size}")
            
        # Low memory - can increase batch size
        elif memory_percent < 60 and self.current_batch_size < self.max_batch_size:
            new_batch_size = min(self.max_batch_size, int(self.current_batch_size * 1.2))
            print(f"🟢 Low memory ({memory_percent:.1f}%), increasing batch size: {self.current_batch_size} → {new_batch_size}")
            
        else:
            new_batch_size = self.current_batch_size
        
        if new_batch_size != self.current_batch_size:
            self.current_batch_size = new_batch_size
            self.last_adjustment_time = time.time()
        
        return self.current_batch_size
    
    def optimize_workers(self, current_metrics: PerformanceMetrics) -> int:
        """
        Optimize worker count based on CPU usage.
        
        Args:
            current_metrics: Current performance metrics
            
        Returns:
            Recommended worker count
        """
        if not self.should_adjust():
            return self.current_workers
        
        cpu_percent = current_metrics.cpu_percent
        
        # High CPU - reduce workers
        if cpu_percent >= self.cpu_high_threshold:
            new_workers = max(self.min_workers, self.current_workers - 1)
            print(f"🔴 High CPU ({cpu_percent:.1f}%), reducing workers: {self.current_workers} → {new_workers}")
            
        # Low CPU - can increase workers
        elif cpu_percent < self.cpu_low_threshold and self.current_workers < self.max_workers:
            new_workers = min(self.max_workers, self.current_workers + 1)
            print(f"🟢 Low CPU ({cpu_percent:.1f}%), increasing workers: {self.current_workers} → {new_workers}")
            
        else:
            new_workers = self.current_workers
        
        if new_workers != self.current_workers:
            self.current_workers = new_workers
            self.last_adjustment_time = time.time()
        
        return self.current_workers
    
    def get_recommendations(self, current_metrics: PerformanceMetrics) -> Dict[str, Any]:
        """
        Get performance optimization recommendations.
        
        Args:
            current_metrics: Current performance metrics
            
        Returns:
            Dictionary with recommendations
        """
        recommendations = {
            'batch_size': self.current_batch_size,
            'workers': self.current_workers,
            'warnings': [],
            'suggestions': []
        }
        
        # Memory warnings
        if current_metrics.memory_percent >= self.memory_critical_threshold:
            recommendations['warnings'].append(
                f"Critical memory usage: {current_metrics.memory_percent:.1f}%"
            )
            recommendations['suggestions'].append(
                "Consider reducing batch size or worker count"
            )
        elif current_metrics.memory_percent >= self.memory_high_threshold:
            recommendations['warnings'].append(
                f"High memory usage: {current_metrics.memory_percent:.1f}%"
            )
        
        # CPU warnings
        if current_metrics.cpu_percent >= self.cpu_high_threshold:
            recommendations['warnings'].append(
                f"High CPU usage: {current_metrics.cpu_percent:.1f}%"
            )
        elif current_metrics.cpu_percent < self.cpu_low_threshold:
            recommendations['suggestions'].append(
                f"Low CPU usage ({current_metrics.cpu_percent:.1f}%), can increase workers"
            )
        
        # Performance suggestions
        if current_metrics.questions_per_second > 0:
            if current_metrics.questions_per_second < 50:
                recommendations['suggestions'].append(
                    "Low processing speed, consider optimizing batch size or workers"
                )
        
        return recommendations
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """
        Get performance summary from metrics history.
        
        Returns:
            Performance summary dictionary
        """
        if not self.metrics_history:
            return {}
        
        recent_metrics = self.metrics_history[-10:]  # Last 10 metrics
        
        avg_cpu = sum(m.cpu_percent for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m.memory_percent for m in recent_metrics) / len(recent_metrics)
        avg_qps = sum(m.questions_per_second for m in recent_metrics) / len(recent_metrics)
        avg_fps = sum(m.files_per_second for m in recent_metrics) / len(recent_metrics)
        
        return {
            'avg_cpu_percent': avg_cpu,
            'avg_memory_percent': avg_memory,
            'avg_questions_per_second': avg_qps,
            'avg_files_per_second': avg_fps,
            'current_batch_size': self.current_batch_size,
            'current_workers': self.current_workers,
            'total_metrics_collected': len(self.metrics_history)
        }
    
    def reset(self):
        """Reset optimizer to initial state."""
        self.metrics_history.clear()
        self.last_adjustment_time = time.time()

