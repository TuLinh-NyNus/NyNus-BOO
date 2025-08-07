"""
File Upload Component

Handles file upload functionality for the Streamlit app.
"""

import streamlit as st
from typing import Optional, Dict, Any


class FileUploadComponent:
    """Component for handling file uploads."""
    
    @staticmethod
    def render() -> Optional[st.runtime.uploaded_file_manager.UploadedFile]:
        """
        Render the file upload widget.
        
        Returns:
            Uploaded file object or None
        """
        uploaded_file = st.file_uploader(
            "Choose a LaTeX file (.md)",
            type=['md', 'tex', 'txt'],
            help="Upload a markdown file containing LaTeX questions in \\begin{ex}...\\end{ex} format",
            key="latex_file_upload"
        )
        
        return uploaded_file
    
    @staticmethod
    def display_file_info(file_info: Dict[str, Any]):
        """
        Display information about the uploaded file.
        
        Args:
            file_info: Dictionary containing file information
        """
        with st.expander("📄 File Information", expanded=True):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("File Name", file_info.get('name', 'Unknown'))
            
            with col2:
                size_mb = file_info.get('size', 0) / (1024 * 1024)
                st.metric("File Size", f"{size_mb:.2f} MB")
            
            with col3:
                st.metric("File Type", file_info.get('type', 'Unknown'))
            
            # File size warnings
            if size_mb > 100:
                st.warning("⚠️ Large file detected. Processing may take significant time.")
            elif size_mb > 50:
                st.info("ℹ️ Medium-sized file. Processing will take a few minutes.")
            else:
                st.success("✅ File size is optimal for processing.")
    
    @staticmethod
    def validate_file_content(file_content: str) -> Dict[str, Any]:
        """
        Validate the content of the uploaded file.
        
        Args:
            file_content: Content of the uploaded file
            
        Returns:
            Dictionary with validation results
        """
        validation_result = {
            'is_valid': True,
            'warnings': [],
            'errors': [],
            'stats': {}
        }
        
        # Check for LaTeX question blocks
        import re
        ex_blocks = re.findall(r'\\begin\{ex\}.*?\\end\{ex\}', file_content, re.DOTALL)
        
        validation_result['stats']['question_blocks_found'] = len(ex_blocks)
        
        if len(ex_blocks) == 0:
            validation_result['is_valid'] = False
            validation_result['errors'].append("No \\begin{ex}...\\end{ex} blocks found in file")
        
        # Check for common LaTeX commands
        common_commands = ['\\choice', '\\choiceTF', '\\shortans', '\\loigiai']
        found_commands = {}
        
        for command in common_commands:
            count = len(re.findall(command, file_content))
            found_commands[command] = count
        
        validation_result['stats']['commands_found'] = found_commands
        
        # Check file encoding
        try:
            file_content.encode('utf-8')
        except UnicodeEncodeError:
            validation_result['warnings'].append("File may contain non-UTF-8 characters")
        
        # Check for very long lines (potential formatting issues)
        lines = file_content.split('\n')
        long_lines = [i for i, line in enumerate(lines) if len(line) > 1000]
        
        if long_lines:
            validation_result['warnings'].append(f"Found {len(long_lines)} very long lines (>1000 chars)")
        
        validation_result['stats']['total_lines'] = len(lines)
        validation_result['stats']['file_size_chars'] = len(file_content)
        
        return validation_result
    
    @staticmethod
    def display_validation_results(validation_result: Dict[str, Any]):
        """
        Display file validation results.
        
        Args:
            validation_result: Results from validate_file_content
        """
        if validation_result['is_valid']:
            st.success("✅ File validation passed")
        else:
            st.error("❌ File validation failed")
        
        # Display statistics
        stats = validation_result['stats']
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Question Blocks", stats.get('question_blocks_found', 0))
        with col2:
            st.metric("Total Lines", stats.get('total_lines', 0))
        with col3:
            st.metric("File Size (chars)", f"{stats.get('file_size_chars', 0):,}")
        
        # Display command statistics
        if stats.get('commands_found'):
            st.subheader("LaTeX Commands Found")
            commands = stats['commands_found']
            
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("\\choice", commands.get('\\choice', 0))
            with col2:
                st.metric("\\choiceTF", commands.get('\\choiceTF', 0))
            with col3:
                st.metric("\\shortans", commands.get('\\shortans', 0))
            with col4:
                st.metric("\\loigiai", commands.get('\\loigiai', 0))
        
        # Display warnings
        if validation_result['warnings']:
            st.warning("⚠️ Warnings:")
            for warning in validation_result['warnings']:
                st.write(f"• {warning}")
        
        # Display errors
        if validation_result['errors']:
            st.error("❌ Errors:")
            for error in validation_result['errors']:
                st.write(f"• {error}")
    
    @staticmethod
    def get_file_preview(file_content: str, max_lines: int = 20) -> str:
        """
        Get a preview of the file content.
        
        Args:
            file_content: Content of the file
            max_lines: Maximum number of lines to show
            
        Returns:
            Preview string
        """
        lines = file_content.split('\n')
        
        if len(lines) <= max_lines:
            return file_content
        
        preview_lines = lines[:max_lines]
        preview = '\n'.join(preview_lines)
        preview += f"\n\n... ({len(lines) - max_lines} more lines)"
        
        return preview
