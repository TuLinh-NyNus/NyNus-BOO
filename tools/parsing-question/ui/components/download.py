"""
Download Component

Handles file downloads for processed results.
"""

import streamlit as st
import os
import zipfile
import tempfile
from typing import Dict, List


class DownloadComponent:
    """Component for handling file downloads."""
    
    @staticmethod
    def render(export_files: Dict[str, str]):
        """
        Render download buttons for exported files.
        
        Args:
            export_files: Dictionary mapping file types to file paths
        """
        if not export_files:
            st.info("No files available for download.")
            return
        
        st.subheader("💾 Download Files")
        
        # Individual file downloads
        DownloadComponent._render_individual_downloads(export_files)
        
        # Bulk download
        DownloadComponent._render_bulk_download(export_files)
        
        # File information
        DownloadComponent._render_file_info(export_files)
    
    @staticmethod
    def _render_individual_downloads(export_files: Dict[str, str]):
        """Render individual file download buttons."""
        st.write("**Individual Files:**")
        
        # Create columns for download buttons
        file_types = list(export_files.keys())
        cols = st.columns(min(len(file_types), 4))
        
        file_descriptions = {
            'questions': '📝 Questions CSV',
            'question_codes': '🔢 Question Codes CSV',
            'question_tags': '🏷️ Question Tags CSV',
            'summary': '📊 Export Summary',
            'error_report': '🚨 Error Report'
        }
        
        for i, (file_type, file_path) in enumerate(export_files.items()):
            col_index = i % len(cols)
            
            with cols[col_index]:
                if os.path.exists(file_path):
                    # Read file content
                    try:
                        with open(file_path, 'rb') as f:
                            file_data = f.read()
                        
                        file_name = os.path.basename(file_path)
                        description = file_descriptions.get(file_type, file_type.title())
                        
                        st.download_button(
                            label=description,
                            data=file_data,
                            file_name=file_name,
                            mime=DownloadComponent._get_mime_type(file_path),
                            use_container_width=True
                        )
                    except Exception as e:
                        st.error(f"Error reading {file_type}: {str(e)}")
                else:
                    st.warning(f"{file_type} not found")
    
    @staticmethod
    def _render_bulk_download(export_files: Dict[str, str]):
        """Render bulk download as ZIP file."""
        st.write("**Bulk Download:**")
        
        # Create ZIP file
        zip_data = DownloadComponent._create_zip_file(export_files)
        
        if zip_data:
            st.download_button(
                label="📦 Download All Files (ZIP)",
                data=zip_data,
                file_name="latex_parser_results.zip",
                mime="application/zip",
                use_container_width=True
            )
        else:
            st.error("Failed to create ZIP file")
    
    @staticmethod
    def _render_file_info(export_files: Dict[str, str]):
        """Render file information table."""
        with st.expander("📋 File Information", expanded=False):
            file_info_data = []
            
            for file_type, file_path in export_files.items():
                if os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)
                    file_name = os.path.basename(file_path)
                    
                    # Count rows for CSV files
                    row_count = "N/A"
                    if file_path.endswith('.csv'):
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                row_count = sum(1 for line in f) - 1  # Subtract header
                        except:
                            row_count = "Error"
                    
                    file_info_data.append({
                        'File Type': file_type.replace('_', ' ').title(),
                        'File Name': file_name,
                        'Size (KB)': f"{file_size / 1024:.1f}",
                        'Rows': row_count,
                        'Status': '✅ Ready'
                    })
                else:
                    file_info_data.append({
                        'File Type': file_type.replace('_', ' ').title(),
                        'File Name': 'Not found',
                        'Size (KB)': '0',
                        'Rows': 'N/A',
                        'Status': '❌ Missing'
                    })
            
            if file_info_data:
                import pandas as pd
                df = pd.DataFrame(file_info_data)
                st.dataframe(df, use_container_width=True)
    
    @staticmethod
    def _create_zip_file(export_files: Dict[str, str]) -> bytes:
        """
        Create a ZIP file containing all export files.
        
        Args:
            export_files: Dictionary of file paths
            
        Returns:
            ZIP file data as bytes
        """
        try:
            with tempfile.NamedTemporaryFile() as tmp_file:
                with zipfile.ZipFile(tmp_file.name, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    for file_type, file_path in export_files.items():
                        if os.path.exists(file_path):
                            # Add file to ZIP with a clean name
                            file_name = os.path.basename(file_path)
                            zip_file.write(file_path, file_name)
                
                # Read the ZIP file data
                with open(tmp_file.name, 'rb') as f:
                    return f.read()
        
        except Exception as e:
            st.error(f"Error creating ZIP file: {str(e)}")
            return None
    
    @staticmethod
    def _get_mime_type(file_path: str) -> str:
        """
        Get MIME type for a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            MIME type string
        """
        extension = os.path.splitext(file_path)[1].lower()
        
        mime_types = {
            '.csv': 'text/csv',
            '.md': 'text/markdown',
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.zip': 'application/zip'
        }
        
        return mime_types.get(extension, 'application/octet-stream')
    
    @staticmethod
    def create_download_instructions() -> str:
        """
        Create download instructions for users.
        
        Returns:
            Formatted instructions string
        """
        instructions = """
## Download Instructions

### CSV Files
- **questions.csv**: Main question data with all parsed information
- **question_codes.csv**: Question code lookup table with hierarchical classification
- **question_tags.csv**: Question tags (currently empty, for future use)

### Reports
- **export_summary.md**: Summary of the export process with statistics
- **error.md**: Detailed error report for questions that failed to parse

### Usage Tips
1. **Import to Database**: Use the CSV files to import data into your database
2. **Review Errors**: Check error.md for questions that need manual review
3. **Validate Data**: Verify the exported data matches your expectations
4. **Backup**: Keep a copy of the original LaTeX file and exported results

### File Formats
- CSV files use UTF-8 encoding
- JSON fields in CSV are properly escaped
- Timestamps are in ISO format
- Foreign key relationships are maintained via ID fields
        """
        
        return instructions.strip()
