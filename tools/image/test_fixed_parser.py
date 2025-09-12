#!/usr/bin/env python3
"""
Test script để verify regex fix cho LaTeX parser
"""

import os
import sys
import time
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from core.latex_parser import LaTeXParser

def test_fixed_parser():
    """Test LaTeX parser với regex fix"""
    
    print("=== Test Fixed LaTeX Parser ===")
    
    # File path
    large_file = r"C:\Users\tu120\OneDrive\Desktop\1.MyLT\DATA\LOC ID\12.9,2025.tex"
    
    # Check file exists
    if not os.path.exists(large_file):
        print(f"❌ File không tồn tại: {large_file}")
        return
    
    file_size = os.path.getsize(large_file) / (1024 * 1024)  # MB
    print(f"📁 File size: {file_size:.2f} MB")
    
    # Test với parser
    parser = LaTeXParser()
    
    print(f"\n🧪 Testing fixed parser...")
    start_time = time.time()
    
    try:
        # Parse first few lines để test
        with open(large_file, 'r', encoding='utf-8') as f:
            # Read first 10000 lines for quick test
            lines = []
            for i, line in enumerate(f):
                if i >= 10000:
                    break
                lines.append(line)
            
            test_content = ''.join(lines)
        
        # Create temp file
        temp_file = "test_chunk.tex"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        # Parse với fixed parser
        questions = parser.parse_file(temp_file)
        
        parse_time = time.time() - start_time
        print(f"✅ Fixed parser found: {len(questions)} questions")
        print(f"⏱️ Parse time: {parse_time:.2f}s")
        
        # Show first few questions info
        for i, q in enumerate(questions[:5], 1):
            print(f"📋 Question {i}: {len(q.content)} chars, subcount: {q.subcount}")
        
        # Cleanup
        os.remove(temp_file)
        
        return len(questions)
        
    except Exception as e:
        parse_time = time.time() - start_time
        print(f"❌ Parser error: {e}")
        print(f"⏱️ Time before error: {parse_time:.2f}s")
        return 0

def test_full_file_counting():
    """Test counting trên full file"""
    
    print(f"\n🔍 Testing full file counting...")
    large_file = r"C:\Users\tu120\OneDrive\Desktop\1.MyLT\DATA\LOC ID\12.9,2025.tex"
    
    # Test với small chunk trước
    with open(large_file, 'r', encoding='utf-8') as f:
        # Read first 100k lines
        lines = []
        for i, line in enumerate(f):
            if i >= 100000:
                break
            lines.append(line)
        
        chunk_content = ''.join(lines)
    
    # Count ex blocks trong chunk
    import re
    pattern = r'\\begin\{ex\}.*?\\end\{ex\}'
    matches = re.findall(pattern, chunk_content, re.DOTALL)
    print(f"🔍 100K lines chunk contains: {len(matches)} ex blocks")
    
    # Parse với fixed parser
    temp_file = "test_100k.tex"
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(chunk_content)
    
    parser = LaTeXParser()
    questions = parser.parse_file(temp_file)
    print(f"✅ Fixed parser found: {len(questions)} questions in 100K lines")
    
    # Cleanup
    os.remove(temp_file)
    
    return len(questions)

def main():
    print(f"🖥️ Testing regex-fixed LaTeX parser...")
    
    # Test 1: Small chunk
    small_result = test_fixed_parser()
    
    # Test 2: Larger chunk
    large_result = test_full_file_counting()
    
    print(f"\n📊 Test Results:")
    print(f"  - 10K lines: {small_result} questions")
    print(f"  - 100K lines: {large_result} questions")
    
    if large_result > small_result:
        print(f"✅ Fixed parser is working! Scaling correctly.")
    else:
        print(f"⚠️ Parser may still have issues.")
    
    print(f"\n✅ Test completed!")

if __name__ == "__main__":
    main()