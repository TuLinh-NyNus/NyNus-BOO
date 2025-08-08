"""
Progress Bar Component for LaTeX Question Parser

Provides progress tracking functionality for batch processing operations.
"""

import streamlit as st
import time
from typing import Optional, Callable, Dict, Any


class ProgressBarComponent:
    """Component for displaying progress bars and processing statistics."""
    
    def __init__(self):
        """Initialize the progress bar component."""
        self.start_time = None
        self.last_update_time = None
        
    def create_progress_container(self) -> Dict[str, Any]:
        """Create containers for progress display.
        
        Returns:
            Dict containing progress display elements
        """
        container = st.container()
        
        with container:
            progress_bar = st.progress(0)
            status_text = st.empty()
            stats_container = st.empty()
            time_container = st.empty()
            
        return {
            'container': container,
            'progress_bar': progress_bar,
            'status_text': status_text,
            'stats_container': stats_container,
            'time_container': time_container
        }
    
    def update_progress(
        self,
        progress_elements: Dict[str, Any],
        processed: int,
        total: int,
        elapsed_time: float,
        additional_info: Optional[Dict[str, Any]] = None
    ):
        """Update progress display.
        
        Args:
            progress_elements: Dictionary containing progress display elements
            processed: Number of items processed
            total: Total number of items to process
            elapsed_time: Time elapsed since processing started
            additional_info: Additional information to display
        """
        if total == 0:
            return
            
        # Calculate progress percentage
        progress = processed / total
        progress_elements['progress_bar'].progress(progress)
        
        # Calculate processing speed
        questions_per_sec = processed / elapsed_time if elapsed_time > 0 else 0
        
        # Estimate remaining time
        remaining_items = total - processed
        remaining_time = remaining_items / questions_per_sec if questions_per_sec > 0 else 0
        
        # Update status text
        status_text = (
            f"Processed: {processed:,}/{total:,} questions "
            f"({progress*100:.1f}%) - "
            f"{questions_per_sec:.1f} q/s"
        )
        
        if remaining_time > 0:
            status_text += f" - ETA: {self._format_time(remaining_time)}"
            
        progress_elements['status_text'].text(status_text)
        
        # Update statistics
        with progress_elements['stats_container'].container():
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Processed", f"{processed:,}")
            with col2:
                st.metric("Total", f"{total:,}")
            with col3:
                st.metric("Speed", f"{questions_per_sec:.1f} q/s")
            with col4:
                st.metric("Progress", f"{progress*100:.1f}%")
        
        # Update time information
        with progress_elements['time_container'].container():
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Elapsed", self._format_time(elapsed_time))
            with col2:
                if remaining_time > 0:
                    st.metric("Remaining", self._format_time(remaining_time))
                else:
                    st.metric("Remaining", "Calculating...")
        
        # Display additional information if provided
        if additional_info:
            self._display_additional_info(additional_info)
    
    def _format_time(self, seconds: float) -> str:
        """Format time in seconds to human readable format.
        
        Args:
            seconds: Time in seconds
            
        Returns:
            Formatted time string
        """
        if seconds < 60:
            return f"{seconds:.0f}s"
        elif seconds < 3600:
            minutes = seconds // 60
            remaining_seconds = seconds % 60
            return f"{minutes:.0f}m {remaining_seconds:.0f}s"
        else:
            hours = seconds // 3600
            remaining_minutes = (seconds % 3600) // 60
            return f"{hours:.0f}h {remaining_minutes:.0f}m"
    
    def _display_additional_info(self, info: Dict[str, Any]):
        """Display additional processing information.
        
        Args:
            info: Dictionary containing additional information
        """
        if 'current_batch' in info:
            st.info(f"Processing batch {info['current_batch']}")
        
        if 'errors' in info and info['errors'] > 0:
            st.warning(f"Errors encountered: {info['errors']}")
        
        if 'warnings' in info and info['warnings'] > 0:
            st.warning(f"Warnings: {info['warnings']}")
    
    def show_completion_message(
        self,
        total_processed: int,
        total_time: float,
        success_rate: float,
        additional_stats: Optional[Dict[str, Any]] = None
    ):
        """Show completion message with final statistics.
        
        Args:
            total_processed: Total number of items processed
            total_time: Total processing time
            success_rate: Success rate percentage
            additional_stats: Additional statistics to display
        """
        st.success("🎉 Processing completed successfully!")
        
        # Display final statistics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Processed", f"{total_processed:,}")
        with col2:
            st.metric("Processing Time", self._format_time(total_time))
        with col3:
            st.metric("Success Rate", f"{success_rate:.1f}%")
        
        # Display additional statistics if provided
        if additional_stats:
            st.subheader("📊 Detailed Statistics")
            
            for key, value in additional_stats.items():
                if isinstance(value, dict):
                    st.write(f"**{key}:**")
                    for sub_key, sub_value in value.items():
                        st.write(f"  - {sub_key}: {sub_value}")
                else:
                    st.write(f"**{key}:** {value}")
        
        # Show balloons animation
        st.balloons()
    
    def show_error_message(self, error_message: str, details: Optional[str] = None):
        """Show error message.
        
        Args:
            error_message: Main error message
            details: Additional error details
        """
        st.error(f"❌ {error_message}")
        
        if details:
            with st.expander("Error Details"):
                st.code(details)
    
    @staticmethod
    def create_callback_function(progress_elements: Dict[str, Any]) -> Callable:
        """Create a callback function for progress updates.
        
        Args:
            progress_elements: Dictionary containing progress display elements
            
        Returns:
            Callback function for progress updates
        """
        component = ProgressBarComponent()
        
        def callback(processed: int, total: int, elapsed_time: float, **kwargs):
            """Progress callback function."""
            component.update_progress(
                progress_elements,
                processed,
                total,
                elapsed_time,
                kwargs.get('additional_info')
            )
        
        return callback
