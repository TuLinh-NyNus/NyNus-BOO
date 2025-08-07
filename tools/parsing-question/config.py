"""
Configuration Settings

Central configuration for the LaTeX Question Parser application.
"""

import os
from typing import Dict, Any


class Config:
    """Application configuration settings."""
    
    # Application settings
    APP_NAME = "LaTeX Question Parser"
    APP_VERSION = "1.0.0"
    APP_DESCRIPTION = "Convert LaTeX questions to structured CSV format"
    
    # Processing settings
    DEFAULT_BATCH_SIZE = 1000
    MAX_BATCH_SIZE = 5000
    MIN_BATCH_SIZE = 100
    
    # File settings
    SUPPORTED_FILE_EXTENSIONS = ['.md', '.tex', '.txt']
    MAX_FILE_SIZE_MB = 500
    DEFAULT_ENCODING = 'utf-8'
    
    # Output settings
    DEFAULT_OUTPUT_DIR = "tools/parsing-question/output"
    CSV_ENCODING = 'utf-8'
    
    # Question type settings
    SUPPORTED_QUESTION_TYPES = ['MC', 'TF', 'SA', 'ES']
    SKIP_QUESTION_TYPES = ['MA']  # Matching questions not implemented
    
    # Validation settings
    MAX_CONTENT_LENGTH = 10000
    MAX_ANSWER_LENGTH = 1000
    MAX_SOLUTION_LENGTH = 5000
    
    # UI settings
    STREAMLIT_CONFIG = {
        'page_title': APP_NAME,
        'page_icon': '📝',
        'layout': 'wide',
        'initial_sidebar_state': 'expanded'
    }
    
    # Processing limits
    MAX_WORKERS = None  # Will use CPU count
    PROGRESS_UPDATE_INTERVAL = 100  # Update progress every N questions
    
    # Error handling
    MAX_ERRORS_TO_DISPLAY = 50
    ERROR_LOG_LEVEL = 'INFO'
    
    @classmethod
    def get_output_dir(cls, custom_dir: str = None) -> str:
        """
        Get the output directory, creating it if necessary.
        
        Args:
            custom_dir: Custom output directory
            
        Returns:
            Output directory path
        """
        output_dir = custom_dir or cls.DEFAULT_OUTPUT_DIR
        os.makedirs(output_dir, exist_ok=True)
        return output_dir
    
    @classmethod
    def validate_file_size(cls, file_size_bytes: int) -> bool:
        """
        Validate if file size is within limits.
        
        Args:
            file_size_bytes: File size in bytes
            
        Returns:
            True if file size is acceptable
        """
        max_size_bytes = cls.MAX_FILE_SIZE_MB * 1024 * 1024
        return file_size_bytes <= max_size_bytes
    
    @classmethod
    def get_batch_size_limits(cls) -> Dict[str, int]:
        """
        Get batch size limits.
        
        Returns:
            Dictionary with min, max, and default batch sizes
        """
        return {
            'min': cls.MIN_BATCH_SIZE,
            'max': cls.MAX_BATCH_SIZE,
            'default': cls.DEFAULT_BATCH_SIZE
        }
    
    @classmethod
    def get_file_validation_rules(cls) -> Dict[str, Any]:
        """
        Get file validation rules.
        
        Returns:
            Dictionary with validation rules
        """
        return {
            'supported_extensions': cls.SUPPORTED_FILE_EXTENSIONS,
            'max_size_mb': cls.MAX_FILE_SIZE_MB,
            'encoding': cls.DEFAULT_ENCODING,
            'required_patterns': [
                r'\\begin\{ex\}',  # Must contain ex environments
                r'\\end\{ex\}'
            ]
        }
    
    @classmethod
    def get_export_settings(cls) -> Dict[str, Any]:
        """
        Get export settings.
        
        Returns:
            Dictionary with export settings
        """
        return {
            'csv_encoding': cls.CSV_ENCODING,
            'include_headers': True,
            'quote_all_fields': False,
            'date_format': 'iso',
            'null_value': ''
        }


# Environment-specific configurations
class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    ERROR_LOG_LEVEL = 'DEBUG'
    MAX_ERRORS_TO_DISPLAY = 100


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    ERROR_LOG_LEVEL = 'WARNING'
    MAX_ERRORS_TO_DISPLAY = 20


# Select configuration based on environment
def get_config() -> Config:
    """
    Get configuration based on environment.
    
    Returns:
        Configuration class instance
    """
    env = os.getenv('ENVIRONMENT', 'development').lower()
    
    if env == 'production':
        return ProductionConfig()
    else:
        return DevelopmentConfig()


# Global configuration instance
config = get_config()
