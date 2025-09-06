"""
Logger configuration
"""
import logging
import sys
from pathlib import Path
from config import LOG_LEVEL, LOG_FORMAT

def setup_logger(name: str = None, log_file: Path = None) -> logging.Logger:
    """
    Setup logger với format chuẩn
    
    Args:
        name: Tên logger
        log_file: File log (optional)
        
    Returns:
        Configured logger
    """
    logger = logging.getLogger(name or __name__)
    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(console_handler)
    
    # File handler nếu có
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        logger.addHandler(file_handler)
    
    return logger
