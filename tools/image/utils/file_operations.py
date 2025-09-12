"""
Windows File Operations Utility
Xử lý file locking issues và retry mechanisms cho Windows
"""
import os
import time
import shutil
import logging
from pathlib import Path
from typing import Optional, Callable, Any
from functools import wraps

logger = logging.getLogger(__name__)

class WindowsFileError(Exception):
    """Custom exception for Windows file operation errors"""
    pass

def retry_on_file_lock(max_retries: int = 5, base_delay: float = 0.1, max_delay: float = 2.0):
    """
    Decorator để retry file operations khi gặp Windows file locking
    
    Args:
        max_retries: Số lần retry tối đa
        base_delay: Delay cơ bản (seconds)
        max_delay: Delay tối đa (seconds)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except (OSError, IOError) as e:
                    last_exception = e
                    
                    # Check if it's a Windows file locking error
                    if hasattr(e, 'winerror') and e.winerror == 32:
                        if attempt < max_retries:
                            # Exponential backoff with jitter
                            delay = min(base_delay * (2 ** attempt), max_delay)
                            jitter = delay * 0.1 * (0.5 - abs(hash(str(args)) % 100) / 100)
                            sleep_time = delay + jitter
                            
                            logger.warning(f"File locked (attempt {attempt + 1}/{max_retries + 1}), retrying in {sleep_time:.2f}s: {e}")
                            time.sleep(sleep_time)
                            continue
                        else:
                            logger.error(f"Failed after {max_retries} retries: {e}")
                            raise WindowsFileError(f"File operation failed after {max_retries} retries: {e}") from e
                    else:
                        # Non-locking error, don't retry
                        raise e
                        
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        logger.warning(f"Unexpected error (attempt {attempt + 1}/{max_retries + 1}), retrying in {delay:.2f}s: {e}")
                        time.sleep(delay)
                        continue
                    else:
                        raise e
            
            # Should never reach here, but just in case
            raise last_exception if last_exception else Exception("Unknown error in retry mechanism")
        
        return wrapper
    return decorator

@retry_on_file_lock(max_retries=3, base_delay=0.2)
def safe_copy_file(src: Path, dst: Path, preserve_metadata: bool = True) -> bool:
    """
    Safely copy file with retry mechanism
    
    Args:
        src: Source file path
        dst: Destination file path  
        preserve_metadata: Whether to preserve file metadata
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Ensure destination directory exists
        dst.parent.mkdir(parents=True, exist_ok=True)
        
        # Remove destination if it exists
        if dst.exists():
            safe_remove_file(dst)
        
        # Copy file
        if preserve_metadata:
            shutil.copy2(src, dst)
        else:
            shutil.copy(src, dst)
            
        logger.debug(f"Successfully copied: {src} -> {dst}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to copy file {src} -> {dst}: {e}")
        return False

@retry_on_file_lock(max_retries=3, base_delay=0.1)
def safe_move_file(src: Path, dst: Path) -> bool:
    """
    Safely move file with retry mechanism
    
    Args:
        src: Source file path
        dst: Destination file path
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Ensure destination directory exists
        dst.parent.mkdir(parents=True, exist_ok=True)
        
        # Remove destination if it exists
        if dst.exists():
            safe_remove_file(dst)
            
        # Move file
        shutil.move(str(src), str(dst))
        logger.debug(f"Successfully moved: {src} -> {dst}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to move file {src} -> {dst}: {e}")
        return False

@retry_on_file_lock(max_retries=3, base_delay=0.1)
def safe_remove_file(file_path: Path) -> bool:
    """
    Safely remove file with retry mechanism
    
    Args:
        file_path: Path to file to remove
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if file_path.exists() and file_path.is_file():
            # Try to make file writable first (in case it's read-only)
            try:
                os.chmod(file_path, 0o777)
            except:
                pass  # Ignore chmod errors
                
            file_path.unlink()
            logger.debug(f"Successfully removed: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to remove file {file_path}: {e}")
        return False

@retry_on_file_lock(max_retries=3, base_delay=0.2)
def safe_read_file(file_path: Path, encoding: str = 'utf-8') -> Optional[str]:
    """
    Safely read file content with retry mechanism
    
    Args:
        file_path: Path to file to read
        encoding: File encoding
        
    Returns:
        File content as string, or None if failed
    """
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            content = f.read()
        logger.debug(f"Successfully read file: {file_path}")
        return content
        
    except Exception as e:
        logger.error(f"Failed to read file {file_path}: {e}")
        return None

@retry_on_file_lock(max_retries=3, base_delay=0.2)
def safe_write_file(file_path: Path, content: str, encoding: str = 'utf-8') -> bool:
    """
    Safely write file content with retry mechanism
    
    Args:
        file_path: Path to file to write
        content: Content to write
        encoding: File encoding
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding=encoding) as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())  # Force write to disk
            
        logger.debug(f"Successfully wrote file: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to write file {file_path}: {e}")
        return False

def safe_file_operation_with_delay(operation: Callable, delay: float = 0.1) -> Any:
    """
    Execute file operation with a small delay to reduce contention
    
    Args:
        operation: Function to execute
        delay: Delay in seconds before operation
        
    Returns:
        Result of operation
    """
    time.sleep(delay)
    return operation()

def is_file_locked(file_path: Path) -> bool:
    """
    Check if a file is currently locked/in use
    
    Args:
        file_path: Path to check
        
    Returns:
        True if file is locked, False otherwise
    """
    if not file_path.exists():
        return False
        
    try:
        # Try to open file in read+write mode
        with open(file_path, 'r+'):
            pass
        return False
        
    except (OSError, IOError) as e:
        if hasattr(e, 'winerror') and e.winerror == 32:
            return True
        return False
    except:
        return False

def wait_for_file_unlock(file_path: Path, max_wait: float = 5.0, check_interval: float = 0.1) -> bool:
    """
    Wait for a file to become unlocked
    
    Args:
        file_path: Path to file
        max_wait: Maximum time to wait (seconds)  
        check_interval: Time between checks (seconds)
        
    Returns:
        True if file became unlocked, False if timeout
    """
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        if not is_file_locked(file_path):
            return True
        time.sleep(check_interval)
    
    logger.warning(f"File remained locked after {max_wait}s: {file_path}")
    return False

def cleanup_temp_files(temp_dir: Path, pattern: str = "*", max_age_hours: int = 1):
    """
    Cleanup temporary files older than specified age
    
    Args:
        temp_dir: Temporary directory to clean
        pattern: File pattern to match
        max_age_hours: Maximum age in hours
    """
    if not temp_dir.exists():
        return
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    cleaned_count = 0
    
    try:
        for file_path in temp_dir.glob(pattern):
            try:
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        if safe_remove_file(file_path):
                            cleaned_count += 1
            except Exception as e:
                logger.debug(f"Error cleaning temp file {file_path}: {e}")
                continue
        
        if cleaned_count > 0:
            logger.info(f"Cleaned up {cleaned_count} temporary files from {temp_dir}")
            
    except Exception as e:
        logger.warning(f"Error during temp file cleanup: {e}")