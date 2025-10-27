"""
Prometheus Metrics Exporter

Exports processing metrics to Prometheus for monitoring and alerting.
"""

import time
from typing import Dict, Any, Optional
from prometheus_client import Counter, Gauge, Histogram, Summary, start_http_server, REGISTRY
import threading


class PrometheusExporter:
    """
    Exports processing metrics to Prometheus.
    
    Metrics exported:
    - files_processed_total: Total files processed
    - files_successful_total: Total successful files
    - files_failed_total: Total failed files
    - questions_extracted_total: Total questions extracted
    - processing_time_seconds: Processing time histogram
    - current_workers: Current number of workers
    - current_batch_size: Current batch size
    - memory_usage_percent: Memory usage percentage
    - cpu_usage_percent: CPU usage percentage
    """
    
    def __init__(self, port: int = 9090, enable_server: bool = True):
        """
        Initialize Prometheus exporter.
        
        Args:
            port: Port for Prometheus HTTP server
            enable_server: Whether to start HTTP server
        """
        self.port = port
        self.enable_server = enable_server
        self.server_thread = None
        
        # Define metrics
        self._define_metrics()
        
        # Start HTTP server if enabled
        if self.enable_server:
            self.start_server()
    
    def _define_metrics(self):
        """Define Prometheus metrics."""
        
        # Counters
        self.files_processed_total = Counter(
            'parsing_files_processed_total',
            'Total number of files processed',
            ['status']  # success, failed
        )
        
        self.questions_extracted_total = Counter(
            'parsing_questions_extracted_total',
            'Total number of questions extracted'
        )
        
        self.errors_total = Counter(
            'parsing_errors_total',
            'Total number of errors encountered',
            ['error_type']  # parsing, validation, io, etc.
        )
        
        # Gauges
        self.current_workers = Gauge(
            'parsing_current_workers',
            'Current number of worker processes'
        )
        
        self.current_batch_size = Gauge(
            'parsing_current_batch_size',
            'Current batch size for question processing'
        )
        
        self.memory_usage_percent = Gauge(
            'parsing_memory_usage_percent',
            'Memory usage percentage'
        )
        
        self.cpu_usage_percent = Gauge(
            'parsing_cpu_usage_percent',
            'CPU usage percentage'
        )
        
        self.active_sessions = Gauge(
            'parsing_active_sessions',
            'Number of active processing sessions'
        )
        
        self.checkpoint_size_bytes = Gauge(
            'parsing_checkpoint_size_bytes',
            'Size of checkpoint data in bytes'
        )
        
        # Histograms
        self.file_processing_time = Histogram(
            'parsing_file_processing_seconds',
            'Time to process a single file',
            buckets=[1, 5, 10, 30, 60, 120, 300, 600, 1800, 3600]  # 1s to 1h
        )
        
        self.batch_processing_time = Histogram(
            'parsing_batch_processing_seconds',
            'Time to process a batch of questions',
            buckets=[0.1, 0.5, 1, 2, 5, 10, 30, 60]  # 0.1s to 1m
        )
        
        # Summaries
        self.questions_per_file = Summary(
            'parsing_questions_per_file',
            'Number of questions per file'
        )
        
        self.errors_per_file = Summary(
            'parsing_errors_per_file',
            'Number of errors per file'
        )
    
    def start_server(self):
        """Start Prometheus HTTP server in background thread."""
        if self.server_thread is None or not self.server_thread.is_alive():
            self.server_thread = threading.Thread(
                target=self._run_server,
                daemon=True
            )
            self.server_thread.start()
            print(f"📊 Prometheus metrics server started on port {self.port}")
    
    def _run_server(self):
        """Run Prometheus HTTP server."""
        try:
            start_http_server(self.port)
            # Keep thread alive
            while True:
                time.sleep(1)
        except Exception as e:
            print(f"❌ Failed to start Prometheus server: {e}")
    
    def record_file_processed(self, status: str, processing_time: float, 
                             question_count: int, error_count: int):
        """
        Record file processing metrics.
        
        Args:
            status: 'success' or 'failed'
            processing_time: Processing time in seconds
            question_count: Number of questions extracted
            error_count: Number of errors encountered
        """
        # Increment counters
        self.files_processed_total.labels(status=status).inc()
        
        if status == 'success':
            self.questions_extracted_total.inc(question_count)
        
        if error_count > 0:
            self.errors_total.labels(error_type='parsing').inc(error_count)
        
        # Record histograms
        self.file_processing_time.observe(processing_time)
        
        # Record summaries
        self.questions_per_file.observe(question_count)
        self.errors_per_file.observe(error_count)
    
    def record_batch_processed(self, processing_time: float):
        """
        Record batch processing time.
        
        Args:
            processing_time: Processing time in seconds
        """
        self.batch_processing_time.observe(processing_time)
    
    def update_system_metrics(self, cpu_percent: float, memory_percent: float):
        """
        Update system resource metrics.
        
        Args:
            cpu_percent: CPU usage percentage
            memory_percent: Memory usage percentage
        """
        self.cpu_usage_percent.set(cpu_percent)
        self.memory_usage_percent.set(memory_percent)
    
    def update_configuration(self, workers: int, batch_size: int):
        """
        Update configuration metrics.
        
        Args:
            workers: Number of workers
            batch_size: Batch size
        """
        self.current_workers.set(workers)
        self.current_batch_size.set(batch_size)
    
    def update_session_metrics(self, active_sessions: int, checkpoint_size: int):
        """
        Update session-related metrics.
        
        Args:
            active_sessions: Number of active sessions
            checkpoint_size: Size of checkpoint data in bytes
        """
        self.active_sessions.set(active_sessions)
        self.checkpoint_size_bytes.set(checkpoint_size)
    
    def record_error(self, error_type: str):
        """
        Record an error.
        
        Args:
            error_type: Type of error (parsing, validation, io, etc.)
        """
        self.errors_total.labels(error_type=error_type).inc()
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """
        Get summary of current metrics.
        
        Returns:
            Dictionary with metric values
        """
        # Note: This is a simplified summary. For full metrics, use Prometheus queries.
        return {
            'files_processed': {
                'success': self.files_processed_total.labels(status='success')._value.get(),
                'failed': self.files_processed_total.labels(status='failed')._value.get()
            },
            'questions_extracted': self.questions_extracted_total._value.get(),
            'current_workers': self.current_workers._value.get(),
            'current_batch_size': self.current_batch_size._value.get(),
            'memory_usage_percent': self.memory_usage_percent._value.get(),
            'cpu_usage_percent': self.cpu_usage_percent._value.get(),
            'active_sessions': self.active_sessions._value.get()
        }


# Global exporter instance
_exporter: Optional[PrometheusExporter] = None


def get_exporter(port: int = 9090, enable_server: bool = True) -> PrometheusExporter:
    """
    Get or create global Prometheus exporter instance.
    
    Args:
        port: Port for Prometheus HTTP server
        enable_server: Whether to start HTTP server
        
    Returns:
        PrometheusExporter instance
    """
    global _exporter
    
    if _exporter is None:
        _exporter = PrometheusExporter(port=port, enable_server=enable_server)
    
    return _exporter


def record_file_metrics(status: str, processing_time: float, 
                       question_count: int, error_count: int):
    """
    Convenience function to record file metrics.
    
    Args:
        status: 'success' or 'failed'
        processing_time: Processing time in seconds
        question_count: Number of questions extracted
        error_count: Number of errors encountered
    """
    exporter = get_exporter()
    exporter.record_file_processed(status, processing_time, question_count, error_count)


def update_system_metrics(cpu_percent: float, memory_percent: float):
    """
    Convenience function to update system metrics.
    
    Args:
        cpu_percent: CPU usage percentage
        memory_percent: Memory usage percentage
    """
    exporter = get_exporter()
    exporter.update_system_metrics(cpu_percent, memory_percent)

