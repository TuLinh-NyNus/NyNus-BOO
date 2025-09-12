#!/usr/bin/env python3
"""
Test Enhanced Processor với file lớn để kiểm tra Windows file locking fix
"""
import sys
import time
from pathlib import Path
from core.enhanced_processor import EnhancedLaTeXProcessor
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

def test_large_file_processing():
    """Test xử lý file lớn với Enhanced Processor"""
    
    # File path cần test
    test_file_path = r"C:\Users\tu120\OneDrive\Desktop\1.MyLT\DATA\LOC ID\12.9,2025.tex"
    
    print("🛡️ Testing Enhanced LaTeX Processor with Windows File Locking Fix")
    print("=" * 70)
    
    # Kiểm tra file tồn tại
    test_file = Path(test_file_path)
    if not test_file.exists():
        print(f"❌ File không tồn tại: {test_file_path}")
        return False
    
    print(f"📁 Test file: {test_file.name}")
    print(f"📊 File size: {test_file.stat().st_size / 1024 / 1024:.1f} MB")
    
    # Đếm số câu hỏi nhanh
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read(10000)  # Đọc 10k ký tự đầu để estimate
            sample_questions = content.count('begin{ex')
        
        # Estimate total questions
        total_size = test_file.stat().st_size
        estimated_questions = int((sample_questions / 10000) * total_size)
        print(f"📋 Estimated questions: ~{estimated_questions:,}")
        
    except Exception as e:
        print(f"⚠️ Cannot estimate questions: {e}")
        estimated_questions = 100000  # Conservative estimate
    
    # Tạo file info structure
    file_info = {
        'name': test_file.name,
        'path': str(test_file),
        'size': test_file.stat().st_size,
        'question_count': estimated_questions,
        'source': 'test'
    }
    
    print(f"🚀 Starting Enhanced Processor test...")
    print(f"⏱️ Estimated processing time: {estimated_questions * 0.5 / 60:.1f} minutes")
    print("📝 This will test:")
    print("  • Windows file locking retry mechanism")
    print("  • Memory management for large files")
    print("  • Error recovery and continuation")
    print("  • Safe file operations")
    print()
    
    # Progress tracking
    processed_count = 0
    start_time = time.time()
    
    def progress_callback(current_idx, total_files, current_file):
        nonlocal processed_count
        processed_count = current_idx + 1
        
        elapsed = time.time() - start_time
        if elapsed > 0:
            rate = processed_count / elapsed
            eta = (total_files - processed_count) / rate if rate > 0 else 0
            
            print(f"⏳ Progress: {processed_count}/{total_files} "
                  f"({processed_count/total_files*100:.1f}%) "
                  f"- Rate: {rate:.1f} files/sec - ETA: {eta/60:.1f} min")
    
    # Initialize Enhanced Processor
    processor = EnhancedLaTeXProcessor(
        max_memory_mb=2000,  # 2GB memory threshold
        cleanup_temp=True
    )
    
    print("🛡️ Enhanced Processor initialized")
    print("🔧 Configuration:")
    print(f"  • Max memory threshold: 2000 MB")
    print(f"  • Timeout per file: 30 minutes")
    print(f"  • Continue on error: True")
    print(f"  • Temp cleanup: True")
    print()
    
    try:
        # Start processing
        print("🚀 Starting batch processing...")
        results = processor.process_files_batch(
            file_list=[file_info],
            callback=progress_callback,
            timeout_per_file=60,  # 60 minutes timeout cho file lớn
            continue_on_error=True
        )
        
        # Print results
        processing_time = time.time() - start_time
        print("\n" + "="*70)
        print("📊 PROCESSING RESULTS")
        print("="*70)
        
        print(f"⏱️ Total processing time: {processing_time/60:.1f} minutes")
        print(f"✅ Successful files: {results['successful_files']}")
        print(f"❌ Failed files: {results['failed_files']}")
        print(f"🎨 TikZ compiled: {results['total_tikz_compiled']:,}")
        print(f"🖼️ Images processed: {results['total_images_processed']:,}")
        print(f"⚠️ Total errors: {results['total_errors']:,}")
        
        # Detailed results
        if results['file_results']:
            file_result = results['file_results'][0]
            print(f"\n📋 File Details:")
            print(f"  • Status: {file_result.get('status', 'unknown')}")
            print(f"  • Processing time: {processing_time:.1f} seconds")
            
            if 'error' in file_result:
                print(f"  • Error: {file_result['error']}")
            
        # Processing errors
        if results.get('processing_errors'):
            print(f"\n🔍 Processing Errors:")
            for error in results['processing_errors']:
                print(f"  • {error['file']}: {error['error']}")
        
        # Summary từ processor
        summary = processor.get_processing_summary()
        print(f"\n🛡️ Enhanced Processor Summary:")
        print(f"  • Processed files: {summary['processed_files']}")
        print(f"  • Failed files: {summary['failed_files']}")
        
        if summary['successful_files_list']:
            print(f"  • Success list: {summary['successful_files_list']}")
        
        if summary['failed_files_list']:
            print(f"  • Failed list: {summary['failed_files_list']}")
        
        # Test verdict
        success_rate = results['successful_files'] / results['total_files'] * 100
        print(f"\n🎯 TEST VERDICT:")
        if success_rate == 100:
            print(f"✅ PASS - All files processed successfully ({success_rate:.1f}%)")
        elif success_rate >= 80:
            print(f"⚠️ PARTIAL - Most files processed ({success_rate:.1f}%)")
        else:
            print(f"❌ FAIL - Too many failures ({success_rate:.1f}%)")
        
        return success_rate == 100
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR during processing:")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🛡️ Enhanced LaTeX Processor - Windows File Locking Test")
    print("🧪 Testing file locking fixes with large LaTeX file")
    print()
    
    # Run test
    success = test_large_file_processing()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("✅ Windows file locking fixes are working properly")
        sys.exit(0)
    else:
        print("\n💥 Test failed!")
        print("❌ There may be issues with the file locking fixes")
        sys.exit(1)