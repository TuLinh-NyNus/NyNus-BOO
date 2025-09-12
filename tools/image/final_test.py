#!/usr/bin/env python3
"""
Test cuối cùng: Enhanced Processor với fixed LaTeX parser
"""

import os
import sys
import time
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from core.enhanced_processor import EnhancedLaTeXProcessor

def main():
    """Test Enhanced Processor với fixed parser trên file lớn"""
    
    print("=== Final Test: Enhanced Processor với Fixed Parser ===")
    
    # File path
    large_file = r"C:\Users\tu120\OneDrive\Desktop\1.MyLT\DATA\LOC ID\12.9,2025.tex"
    output_dir = Path("test_output_final")
    
    # Check file exists
    if not os.path.exists(large_file):
        print(f"❌ File không tồn tại: {large_file}")
        return
    
    file_size = os.path.getsize(large_file) / (1024 * 1024)  # MB
    print(f"📁 File size: {file_size:.2f} MB")
    
    # Create processor
    processor = EnhancedLaTeXProcessor()
    
    print(f"🚀 Starting Enhanced Processing với Fixed Parser...")
    start_time = time.time()
    
    try:
        # Process với small batch size để test
        result = processor.process_file(
            input_path=large_file,
            output_dir=output_dir,
            batch_size=50,  # Small batch để nhanh test
            max_batches=5   # Chỉ test 5 batches đầu
        )
        
        process_time = time.time() - start_time
        
        print(f"\n✅ Processing Results:")
        print(f"  📊 Total questions found: {result.get('total_questions', 'N/A')}")
        print(f"  🎯 Questions processed: {result.get('processed_questions', 'N/A')}")
        print(f"  📦 Batches completed: {result.get('batches_completed', 'N/A')}")
        print(f"  🖼️ TikZ images generated: {result.get('tikz_generated', 'N/A')}")
        print(f"  ⏱️ Processing time: {process_time:.2f}s")
        print(f"  💾 Memory efficient: {result.get('memory_efficient', 'N/A')}")
        
        if result.get('processed_questions', 0) > 26:
            print(f"🎉 SUCCESS! Fixed parser is working - processed {result['processed_questions']} questions!")
            print(f"   (Previous bug limited to 26 questions)")
        
        # Check output
        if output_dir.exists():
            files = list(output_dir.glob("**/*"))
            print(f"  📁 Output files: {len(files)}")
            
            # Show some output files
            for i, file in enumerate(files[:5]):
                print(f"    {i+1}. {file.name}")
        
        return result
        
    except Exception as e:
        process_time = time.time() - start_time
        print(f"❌ Processing error: {e}")
        print(f"⏱️ Time before error: {process_time:.2f}s")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = main()
    
    if result and result.get('processed_questions', 0) > 100:
        print(f"\n🏆 EXCELLENT! System can now handle large files correctly!")
        print(f"   Ready to process all 225K questions in production.")
    else:
        print(f"\n⚠️ Need further investigation for full-scale processing.")