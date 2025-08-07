"""
Session State Manager

Manages Streamlit session state for the application.
"""

import streamlit as st
from typing import Any, Dict


class SessionStateManager:
    """Manages session state variables for the Streamlit app."""
    
    def __init__(self):
        """Initialize session state manager."""
        self.default_values = {
            'processing_complete': False,
            'processing_results': None,
            'processing_stats': None,
            'export_files': None,
            'current_file': None,
            'validation_results': None,
            'error_handler': None
        }
    
    def initialize(self):
        """Initialize session state with default values."""
        for key, default_value in self.default_values.items():
            if key not in st.session_state:
                st.session_state[key] = default_value
    
    def reset_processing_state(self):
        """Reset processing-related session state."""
        processing_keys = [
            'processing_complete',
            'processing_results', 
            'processing_stats',
            'export_files',
            'validation_results'
        ]
        
        for key in processing_keys:
            st.session_state[key] = self.default_values.get(key)
    
    def set_value(self, key: str, value: Any):
        """
        Set a session state value.
        
        Args:
            key: Session state key
            value: Value to set
        """
        st.session_state[key] = value
    
    def get_value(self, key: str, default: Any = None) -> Any:
        """
        Get a session state value.
        
        Args:
            key: Session state key
            default: Default value if key doesn't exist
            
        Returns:
            Session state value or default
        """
        return st.session_state.get(key, default)
    
    def has_key(self, key: str) -> bool:
        """
        Check if a key exists in session state.
        
        Args:
            key: Session state key
            
        Returns:
            True if key exists, False otherwise
        """
        return key in st.session_state
    
    def clear_all(self):
        """Clear all session state."""
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        self.initialize()
    
    def get_processing_summary(self) -> Dict[str, Any]:
        """
        Get a summary of current processing state.
        
        Returns:
            Dictionary with processing summary
        """
        return {
            'processing_complete': self.get_value('processing_complete', False),
            'has_results': self.get_value('processing_results') is not None,
            'has_stats': self.get_value('processing_stats') is not None,
            'has_export_files': self.get_value('export_files') is not None,
            'current_file': self.get_value('current_file')
        }
