#!/usr/bin/env python3
"""
Debug script để test các module
"""
import sys
from pathlib import Path

def test_imports():
    """Test import các module"""
    try:
        print("Testing imports...")
        
        # Test config
        from config import IMAGE_FORMAT, PATTERNS, STREAMLIT_CONFIG
        print(f"✅ Config import OK - IMAGE_FORMAT: {IMAGE_FORMAT}")
        
        # Test core modules
        from core import LaTeXParser, TikZCompiler, ImageProcessor, FileManager
        print("✅ Core modules import OK")
        
        # Test processor
        from processor import LaTeXImageProcessor
        print("✅ Processor import OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_processor():
    """Test processor với file test"""
    try:
        from processor import LaTeXImageProcessor
        
        # Tạo test file
        test_file = Path("test_simple.tex")
        test_content = """\\documentclass{article}
\\begin{document}
\\begin{ex}
[TL.001]
Test question
\\end{ex}
\\end{document}"""
        
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        # Test processor
        processor = LaTeXImageProcessor()
        results = processor.process_file(str(test_file))
        
        print(f"✅ Processor test OK: {results}")
        
        # Cleanup
        if test_file.exists():
            test_file.unlink()
            
        return True
        
    except Exception as e:
        print(f"❌ Processor error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== LaTeX Image Processor Debug ===")
    
    success = True
    success &= test_imports()
    success &= test_processor()
    
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)
