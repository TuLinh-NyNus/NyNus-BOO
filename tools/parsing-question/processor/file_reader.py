"""
File Reader

Handles streaming reading of large LaTeX files.
"""

import os
from typing import Iterator, List
import re


class FileReader:
    """
    Efficient file reader for large LaTeX files.
    
    Provides streaming capabilities to handle files with 200k+ questions
    without loading everything into memory at once.
    """
    
    def __init__(self, file_path: str, encoding: str = 'utf-8'):
        """
        Initialize file reader.
        
        Args:
            file_path: Path to the LaTeX file
            encoding: File encoding (default: utf-8)
        """
        self.file_path = file_path
        self.encoding = encoding
        self.file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
    
    def read_full_content(self) -> str:
        """
        Read the entire file content.
        
        Returns:
            Full file content as string
        """
        try:
            with open(self.file_path, 'r', encoding=self.encoding) as file:
                return file.read()
        except Exception as e:
            raise IOError(f"Failed to read file {self.file_path}: {str(e)}")
    
    def stream_question_blocks(self, chunk_size: int = 8192) -> Iterator[str]:
        """
        Stream question blocks from the file.
        
        Args:
            chunk_size: Size of chunks to read at a time
            
        Yields:
            Individual question blocks
        """
        buffer = ""
        question_pattern = re.compile(r'\\begin\{ex\}.*?\\end\{ex\}', re.DOTALL)
        
        try:
            with open(self.file_path, 'r', encoding=self.encoding) as file:
                while True:
                    chunk = file.read(chunk_size)
                    if not chunk:
                        break
                    
                    buffer += chunk
                    
                    # Find complete question blocks in buffer
                    matches = list(question_pattern.finditer(buffer))
                    
                    if matches:
                        # Process all complete matches except the last one
                        for match in matches[:-1]:
                            # Include preceding metadata
                            start_pos = match.start()
                            
                            # Look backwards for metadata
                            lines_before = buffer[:start_pos].split('\n')
                            metadata_start = start_pos
                            
                            for i in range(len(lines_before) - 1, -1, -1):
                                line = lines_before[i].strip()
                                if line.startswith('%') or not line:
                                    line_start = start_pos - len('\n'.join(lines_before[i:]))
                                    metadata_start = line_start
                                else:
                                    break
                            
                            question_block = buffer[metadata_start:match.end()]
                            yield question_block.strip()
                        
                        # Keep the last match and everything after it in buffer
                        last_match = matches[-1]
                        buffer = buffer[last_match.start():]
                
                # Process any remaining content in buffer
                if buffer.strip():
                    matches = list(question_pattern.finditer(buffer))
                    for match in matches:
                        start_pos = match.start()
                        
                        # Look backwards for metadata
                        lines_before = buffer[:start_pos].split('\n')
                        metadata_start = start_pos
                        
                        for i in range(len(lines_before) - 1, -1, -1):
                            line = lines_before[i].strip()
                            if line.startswith('%') or not line:
                                line_start = start_pos - len('\n'.join(lines_before[i:]))
                                metadata_start = line_start
                            else:
                                break
                        
                        question_block = buffer[metadata_start:match.end()]
                        yield question_block.strip()
                        
        except Exception as e:
            raise IOError(f"Failed to stream file {self.file_path}: {str(e)}")
    
    def split_into_batches(self, batch_size: int = 1000) -> List[List[str]]:
        """
        Split file content into batches of question blocks.
        
        Args:
            batch_size: Number of questions per batch
            
        Returns:
            List of batches, each containing question blocks
        """
        batches = []
        current_batch = []
        
        for question_block in self.stream_question_blocks():
            current_batch.append(question_block)
            
            if len(current_batch) >= batch_size:
                batches.append(current_batch)
                current_batch = []
        
        # Add remaining questions as final batch
        if current_batch:
            batches.append(current_batch)
        
        return batches
    
    def count_questions(self) -> int:
        """
        Count total number of questions in the file.
        
        Returns:
            Number of question blocks found
        """
        count = 0
        for _ in self.stream_question_blocks():
            count += 1
        return count
    
    def get_file_info(self) -> dict:
        """
        Get information about the file.
        
        Returns:
            Dictionary with file information
        """
        return {
            'file_path': self.file_path,
            'file_size_bytes': self.file_size,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2),
            'encoding': self.encoding,
            'exists': os.path.exists(self.file_path)
        }
