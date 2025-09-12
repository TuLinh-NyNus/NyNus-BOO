#!/usr/bin/env python3
"""
Debug script để test LaTeX parser behavior với file lớn
Kiểm tra tại sao parser chỉ parse được 26/225k questions
"""

import os
import sys
import time
import psutil
import re
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from core.latex_parser import LaTeXParser

def get_memory_usage():
    """Get current memory usage in MB"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024

def count_ex_blocks_simple(content: str) -> int:
    """Simple count of \\begin{ex} blocks using regex"""
    pattern = r'\\begin\{ex\}'
    matches = re.findall(pattern, content)
    return len(matches)

def count_ex_blocks_regex_complete(content: str) -> int:
    """Count complete \\begin{ex}...\\end{ex} blocks using regex"""
    pattern = r'\\begin\{ex\}.*?\\end\{ex\}'
    matches = re.findall(pattern, content, re.DOTALL)
    return len(matches)

def test_parser_with_chunks(filepath: str, chunk_sizes: list):
    """Test parser với các kích thước chunk khác nhau"""
    
    print("=== Debug LaTeX Parser ===")
    print(f"File: {filepath}")
    
    # Check file exists and size
    if not os.path.exists(filepath):
        print(f"❌ File không tồn tại: {filepath}")
        return
    
    file_size = os.path.getsize(filepath) / (1024 * 1024)  # MB
    print(f"📁 File size: {file_size:.2f} MB")
    
    # Read full content first to get baseline counts
    print("\n📊 Đang đọc full content để count baseline...")
    start_mem = get_memory_usage()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            full_content = f.read()
        
        after_read_mem = get_memory_usage()
        print(f"💾 Memory after reading full file: {after_read_mem:.2f} MB (+{after_read_mem - start_mem:.2f} MB)")
        
        # Count với different methods
        simple_count = count_ex_blocks_simple(full_content)
        regex_count = count_ex_blocks_regex_complete(full_content)
        
        print(f"🔍 Simple \\begin{{ex}} count: {simple_count}")
        print(f"🔍 Complete blocks regex count: {regex_count}")
        
        after_count_mem = get_memory_usage()
        print(f"💾 Memory after counting: {after_count_mem:.2f} MB")
        
    except Exception as e:
        print(f"❌ Error reading full file: {e}")
        return
    
    # Test với chunks
    print(f"\n🧪 Testing parser với chunks khác nhau...")
    
    for chunk_lines in chunk_sizes:
        print(f"\n--- Testing với {chunk_lines:,} lines ---")
        
        try:
            # Read chunk
            chunk_start_mem = get_memory_usage()
            
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = []
                for i, line in enumerate(f):
                    if i >= chunk_lines:
                        break
                    lines.append(line)
                
                chunk_content = ''.join(lines)
            
            chunk_read_mem = get_memory_usage()
            print(f"💾 Memory after reading {len(lines):,} lines: {chunk_read_mem:.2f} MB")
            
            # Count trong chunk
            chunk_simple = count_ex_blocks_simple(chunk_content)
            chunk_regex = count_ex_blocks_regex_complete(chunk_content)
            print(f"🔍 Chunk simple count: {chunk_simple}")
            print(f"🔍 Chunk regex count: {chunk_regex}")
            
            # Test parser
            parser = LaTeXParser()
            
            # Create temp file for chunk
            temp_path = filepath + f".chunk_{chunk_lines}"
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(chunk_content)
            
            parse_start_time = time.time()
            parse_start_mem = get_memory_usage()
            
            try:
                questions = parser.parse_file(temp_path)
                parse_time = time.time() - parse_start_time
                parse_end_mem = get_memory_usage()
                
                print(f"✅ Parser found: {len(questions)} questions")
                print(f"⏱️ Parse time: {parse_time:.2f}s")
                print(f"💾 Memory during parsing: {parse_end_mem:.2f} MB (+{parse_end_mem - parse_start_mem:.2f} MB)")
                
            except Exception as e:
                parse_time = time.time() - parse_start_time
                parse_end_mem = get_memory_usage()
                print(f"❌ Parser error: {e}")
                print(f"⏱️ Time before error: {parse_time:.2f}s")
                print(f"💾 Memory when error: {parse_end_mem:.2f} MB")
            
            # Cleanup temp file
            try:
                os.remove(temp_path)
            except:
                pass
                
        except Exception as e:
            print(f"❌ Chunk test error: {e}")

def test_regex_alternative_parser(content: str) -> int:
    """Test regex-based alternative parser"""
    print(f"\n🔬 Testing regex-based alternative parser...")
    
    start_time = time.time()
    start_mem = get_memory_usage()
    
    try:
        # Use regex to find all ex blocks
        pattern = r'\\begin\{ex\}.*?\\end\{ex\}'
        matches = re.finditer(pattern, content, re.DOTALL)
        
        blocks = []
        count = 0
        for match in matches:
            count += 1
            if count <= 50:  # Only keep first 50 for memory efficiency
                blocks.append(match.group())
            
            # Progress every 10k matches
            if count % 10000 == 0:
                current_mem = get_memory_usage()
                print(f"📈 Processed {count:,} blocks, Memory: {current_mem:.2f} MB")
        
        end_time = time.time()
        end_mem = get_memory_usage()
        
        print(f"✅ Regex parser found: {count:,} total blocks")
        print(f"⏱️ Parse time: {end_time - start_time:.2f}s")
        print(f"💾 Memory usage: {end_mem:.2f} MB (+{end_mem - start_mem:.2f} MB)")
        
        return count
        
    except Exception as e:
        end_time = time.time()
        end_mem = get_memory_usage()
        print(f"❌ Regex parser error: {e}")
        print(f"⏱️ Time before error: {end_time - start_time:.2f}s")
        print(f"💾 Memory when error: {end_mem:.2f} MB")
        return 0

def main():
    # File path
    large_file = r"C:\Users\tu120\OneDrive\Desktop\1.MyLT\DATA\LOC ID\12.9,2025.tex"
    
    # Test với chunks khác nhau
    chunk_sizes = [1000, 5000, 10000, 50000, 100000]
    
    # Basic info
    print(f"🖥️ Python process PID: {os.getpid()}")
    print(f"💾 Initial memory: {get_memory_usage():.2f} MB")
    
    # Test chunks
    test_parser_with_chunks(large_file, chunk_sizes)
    
    # Test regex alternative
    print(f"\n🔬 Testing regex alternative với full file...")
    try:
        with open(large_file, 'r', encoding='utf-8') as f:
            content = f.read()
        test_regex_alternative_parser(content)
    except Exception as e:
        print(f"❌ Error reading full file for regex test: {e}")
    
    print(f"\n✅ Debug completed!")

if __name__ == "__main__":
    main()