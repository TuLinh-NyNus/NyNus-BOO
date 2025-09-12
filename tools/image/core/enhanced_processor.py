"""
Enhanced LaTeX Processor với tính năng resilience và error recovery
Wrapper để xử lý files một cách an toàn và đảm bảo tiếp tục khi gặp lỗi
"""
import gc
import os
import time
import traceback
import tempfile
from pathlib import Path
from typing import Dict, Optional, List
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError, as_completed

# Setup logger
logger = logging.getLogger(__name__)

class EnhancedLaTeXProcessor:
    """Enhanced processor với error recovery và resource management"""
    
    def __init__(self, max_memory_mb: int = 1000, cleanup_temp: bool = True):
        """
        Initialize enhanced processor
        
        Args:
            max_memory_mb: Maximum memory threshold before cleanup (MB)
            cleanup_temp: Whether to cleanup temp files after each processing
        """
        self.max_memory_mb = max_memory_mb
        self.cleanup_temp = cleanup_temp
        self.processed_files = []
        self.failed_files = []
        
    def process_files_batch(self, file_list: List[Dict], 
                           callback=None, 
                           timeout_per_file: int = 30,
                           continue_on_error: bool = True) -> Dict:
        """
        Process a batch of files with enhanced error handling
        
        Args:
            file_list: List of file info dictionaries
            callback: Progress callback function
            timeout_per_file: Timeout per file in minutes
            continue_on_error: Whether to continue when encountering errors
            
        Returns:
            Overall processing results
        """
        results = {
            'total_files': len(file_list),
            'successful_files': 0,
            'failed_files': 0,
            'total_tikz_compiled': 0,
            'total_images_processed': 0,
            'total_errors': 0,
            'file_results': [],
            'processing_errors': []
        }
        
        logger.info(f"Starting batch processing of {len(file_list)} files")
        
        for idx, file_info in enumerate(file_list):
            try:
                # Check memory usage and cleanup if needed
                self._check_and_cleanup_memory()
                
                # Progress callback
                if callback:
                    callback(idx, len(file_list), file_info['name'])
                
                # Process single file with timeout
                file_result = self._process_single_file_safe(
                    file_info, timeout_per_file
                )
                
                # Update results
                if file_result.get('status') == 'success':
                    results['successful_files'] += 1
                    results['total_tikz_compiled'] += file_result.get('tikz_compiled', 0)
                    results['total_images_processed'] += file_result.get('images_processed', 0)
                    results['total_errors'] += file_result.get('errors', 0)
                    self.processed_files.append(file_info['name'])
                    
                elif file_result.get('status') == 'timeout':
                    results['failed_files'] += 1
                    results['total_errors'] += 1
                    self.failed_files.append(f"{file_info['name']} (timeout)")
                    
                else:
                    results['failed_files'] += 1
                    results['total_errors'] += 1
                    self.failed_files.append(f"{file_info['name']} (error)")
                
                # Add to file results
                file_result['file_name'] = file_info['name']
                file_result['processed_at'] = time.time()
                results['file_results'].append(file_result)
                
                # Log progress
                logger.info(f"Processed {idx+1}/{len(file_list)}: {file_info['name']} - Status: {file_result.get('status', 'unknown')}")
                
            except Exception as e:
                error_msg = f"Critical error processing {file_info['name']}: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                
                results['processing_errors'].append({
                    'file': file_info['name'],
                    'error': error_msg,
                    'traceback': traceback.format_exc()
                })
                
                results['failed_files'] += 1
                results['total_errors'] += 1
                self.failed_files.append(f"{file_info['name']} (critical error)")
                
                if not continue_on_error:
                    logger.error("Stopping processing due to critical error")
                    break
                else:
                    logger.info("Continuing processing despite error")
                    continue
        
        # Final cleanup
        self._final_cleanup()
        
        # Log summary
        logger.info(f"Batch processing completed: {results['successful_files']}/{results['total_files']} successful")
        
        return results
    
    def _process_single_file_safe(self, file_info: Dict, timeout_minutes: int) -> Dict:
        """
        Process a single file with comprehensive error handling
        
        Args:
            file_info: File information dictionary
            timeout_minutes: Timeout in minutes
            
        Returns:
            Processing result dictionary
        """
        def _process_file_worker():
            """Worker function for file processing"""
            try:
                # Import here to avoid circular imports
                from processor import LaTeXImageProcessor
                from core.streaming_processor import StreamingLaTeXProcessor
                
                # Choose processor based on file size
                if file_info.get('question_count', 0) >= 10000:
                    processor = StreamingLaTeXProcessor()
                    return processor.process_large_file(file_info['path'])
                else:
                    processor = LaTeXImageProcessor()
                    return processor.process_file_inplace(file_info['path'], update_original=True)
                    
            except ImportError as e:
                logger.error(f"Import error: {str(e)}")
                return {
                    'status': 'error',
                    'error': f'Import error: {str(e)}',
                    'error_type': 'ImportError'
                }
                
            except Exception as e:
                logger.error(f"Processing error for {file_info['name']}: {str(e)}")
                logger.error(traceback.format_exc())
                return {
                    'status': 'error',
                    'error': str(e),
                    'error_type': type(e).__name__,
                    'traceback': traceback.format_exc()
                }
        
        # Process with timeout
        with ThreadPoolExecutor(max_workers=1) as executor:
            try:
                future = executor.submit(_process_file_worker)
                result = future.result(timeout=timeout_minutes * 60)
                
                # Validate result
                if isinstance(result, dict):
                    if 'error' not in result:
                        result['status'] = 'success'
                    else:
                        result['status'] = 'error'
                    return result
                else:
                    logger.error(f"Invalid result type from processor: {type(result)}")
                    return {
                        'status': 'error',
                        'error': f'Invalid result type: {type(result)}',
                        'error_type': 'InvalidResultType'
                    }
                    
            except TimeoutError:
                logger.warning(f"File processing timed out: {file_info['name']}")
                return {
                    'status': 'timeout',
                    'error': f'Processing timed out after {timeout_minutes} minutes',
                    'file_name': file_info['name'],
                    'tikz_compiled': 0,
                    'images_processed': 0,
                    'errors': 1
                }
                
            except Exception as e:
                logger.error(f"Unexpected error in timeout handler: {str(e)}")
                return {
                    'status': 'error',
                    'error': f'Unexpected timeout handler error: {str(e)}',
                    'error_type': type(e).__name__,
                    'tikz_compiled': 0,
                    'images_processed': 0,
                    'errors': 1
                }
    
    def _check_and_cleanup_memory(self):
        """Check memory usage and cleanup if needed"""
        try:
            import psutil
            process = psutil.Process(os.getpid())
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            if memory_mb > self.max_memory_mb:
                logger.info(f"Memory usage ({memory_mb:.1f} MB) exceeds threshold, cleaning up")
                self._cleanup_resources()
                
        except ImportError:
            # psutil not available, just do basic cleanup
            gc.collect()
        except Exception as e:
            logger.warning(f"Error checking memory usage: {str(e)}")
            gc.collect()
    
    def _cleanup_resources(self):
        """Cleanup resources and memory"""
        try:
            # Force garbage collection
            gc.collect()
            
            # Clear temp files if enabled
            if self.cleanup_temp:
                self._cleanup_temp_files()
                
            logger.info("Resource cleanup completed")
            
        except Exception as e:
            logger.warning(f"Error during resource cleanup: {str(e)}")
    
    def _cleanup_temp_files(self):
        """Cleanup temporary files"""
        try:
            temp_dir = Path(tempfile.gettempdir())
            
            # Look for LaTeX related temp files
            patterns = ['*.aux', '*.log', '*.pdf', '*.fls', '*.fdb_latexmk']
            
            cleaned_count = 0
            for pattern in patterns:
                for temp_file in temp_dir.glob(pattern):
                    try:
                        if temp_file.stat().st_mtime < (time.time() - 3600):  # Older than 1 hour
                            temp_file.unlink()
                            cleaned_count += 1
                    except Exception:
                        continue
            
            if cleaned_count > 0:
                logger.info(f"Cleaned up {cleaned_count} temp files")
                
        except Exception as e:
            logger.warning(f"Error cleaning temp files: {str(e)}")
    
    def _final_cleanup(self):
        """Final cleanup after batch processing"""
        try:
            self._cleanup_resources()
            logger.info("Final cleanup completed")
        except Exception as e:
            logger.warning(f"Error in final cleanup: {str(e)}")
    
    def get_processing_summary(self) -> Dict:
        """Get summary of processing results"""
        return {
            'processed_files': len(self.processed_files),
            'failed_files': len(self.failed_files),
            'successful_files_list': self.processed_files.copy(),
            'failed_files_list': self.failed_files.copy()
        }