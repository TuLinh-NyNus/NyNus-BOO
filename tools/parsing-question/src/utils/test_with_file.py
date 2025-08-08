#!/usr/bin/env python3
"""
Test script để test LaTeX Question Parser với file cụ thể.
"""

import sys
import os
import tempfile
import traceback
from pathlib import Path

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_with_file(file_path: str, output_dir: str = "output"):
    """Test parsing với file cụ thể."""

    print(f"🧪 Testing LaTeX Question Parser with file: {file_path}")
    print("=" * 60)
    
    # Kiểm tra file tồn tại
    if not os.path.exists(file_path):
        print(f"❌ File không tồn tại: {file_path}")
        return False
    
    # Tạo output directory
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Output directory: {os.path.abspath(output_dir)}")
    
    try:
        # Import các module cần thiết
        print("\n🔧 Importing modules...")
        from processor.file_reader import FileReader
        from processor.batch_processor import BatchProcessor
        from processor.error_handler import ErrorHandler
        from export.csv_exporter import CSVExporter
        from export.data_validator import DataValidator
        
        print("✅ All modules imported successfully")
        
        # Khởi tạo error handler
        print("\n🛠️ Initializing error handler...")
        error_handler = ErrorHandler(output_dir)
        error_handler.start_processing()
        
        # Đọc và phân tích file
        print(f"\n📖 Reading file: {file_path}")
        file_reader = FileReader(file_path)
        file_info = file_reader.get_file_info()
        
        print(f"✅ File loaded: {file_info['file_size_mb']:.2f} MB")
        print(f"   - Lines: {file_info.get('total_lines', 'N/A')}")
        print(f"   - Encoding: {file_info.get('encoding', 'N/A')}")
        
        # Đếm số câu hỏi
        print("\n📊 Counting questions...")
        total_questions = file_reader.count_questions()
        print(f"✅ Found {total_questions:,} questions")
        
        if total_questions == 0:
            print("⚠️ No questions found in file")
            return False
        
        # Chia thành batches
        print("\n📦 Creating batches...")
        batch_size = min(1000, total_questions)  # Batch size nhỏ hơn để test
        batches = file_reader.split_into_batches(batch_size)
        print(f"✅ Created {len(batches)} batches (batch size: {batch_size})")
        
        # Xử lý batches
        print("\n⚡ Processing questions...")
        
        def progress_callback(processed: int, total: int, elapsed_time: float):
            """Callback để hiển thị progress."""
            progress = processed / total if total > 0 else 0
            questions_per_sec = processed / elapsed_time if elapsed_time > 0 else 0
            print(f"   Progress: {processed:,}/{total:,} ({progress*100:.1f}%) - {questions_per_sec:.1f} q/s")
        
        # Xử lý với multiprocessing
        batch_processor = BatchProcessor(max_workers=2)  # Giảm workers để dễ debug
        questions, question_codes, errors = batch_processor.process_batches(
            batches, 
            progress_callback
        )
        
        print(f"✅ Processing completed:")
        print(f"   - Questions parsed: {len(questions)}")
        print(f"   - Question codes: {len(question_codes)}")
        print(f"   - Errors: {len(errors)}")
        
        # Xử lý errors
        if errors:
            print(f"\n⚠️ Processing errors:")
            for i, error in enumerate(errors[:5]):  # Hiển thị 5 lỗi đầu tiên
                print(f"   {i+1}. {error}")
            if len(errors) > 5:
                print(f"   ... and {len(errors) - 5} more errors")
        
        error_handler.add_batch_errors(errors, -1)
        error_handler.end_processing()
        
        # Validation
        print("\n✅ Validating data...")
        validator = DataValidator()
        validation_results = validator.validate_all_data(questions, question_codes)

        # Add validation errors to error handler
        all_validation_errors = []
        for error_type, error_list in validation_results['errors'].items():
            if error_type == 'question_errors':
                # Handle detailed question errors with raw content
                for error_detail in error_list:
                    if isinstance(error_detail, dict):
                        error_handler.add_error(
                            'validation',
                            error_detail['message'],
                            question_block=error_detail.get('raw_content', ''),
                            context={
                                'question_id': error_detail.get('question_id'),
                                'question_index': error_detail.get('question_index'),
                                'validation_errors': error_detail.get('errors', [])
                            }
                        )
                        all_validation_errors.append(error_detail['message'])
                    else:
                        # Fallback for old format
                        error_handler.add_error('validation', str(error_detail))
                        all_validation_errors.append(str(error_detail))
            else:
                # Handle other error types (question_codes, etc.)
                for error in error_list:
                    error_handler.add_error('validation', str(error))
                    all_validation_errors.append(str(error))

        if all_validation_errors:
            print(f"⚠️ Found {len(all_validation_errors)} validation errors")

        print(f"✅ Validation completed:")
        print(f"   - Valid questions: {len(validation_results['valid_questions'])}")
        print(f"   - Valid question codes: {len(validation_results['valid_question_codes'])}")
        print(f"   - Valid question tags: {len(validation_results['valid_question_tags'])}")
        print(f"   - Validation errors: {len(all_validation_errors)}")
        
        # Export to CSV
        print("\n💾 Exporting to CSV...")
        csv_exporter = CSVExporter(output_dir)
        export_files = csv_exporter.export_all(
            validation_results['valid_questions'],
            validation_results['valid_question_codes'],
            validation_results['valid_question_tags']
        )

        # Export to Excel
        print("💾 Exporting to Excel...")
        from export.excel_exporter import ExcelExporter
        excel_exporter = ExcelExporter(output_dir)
        excel_file = excel_exporter.export_all(
            validation_results['valid_questions'],
            validation_results['valid_question_codes'],
            validation_results['valid_question_tags']
        )
        export_files['excel'] = excel_file
        
        # Tạo summary
        summary_path = csv_exporter.create_export_summary(
            validation_results['valid_questions'],
            validation_results['valid_question_codes'],
            validation_results['valid_question_tags'],
            export_files
        )
        export_files['summary'] = summary_path
        
        # Lưu error report
        error_report_path = error_handler.save_error_report()
        export_files['error_report'] = error_report_path
        
        print(f"✅ Export completed. Files created:")
        for file_type, file_path in export_files.items():
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"   - {file_type}: {file_path} ({file_size:,} bytes)")
            else:
                print(f"   - {file_type}: {file_path} (NOT FOUND)")
        
        # Thống kê cuối cùng với status breakdown
        processing_stats = batch_processor.get_processing_stats()
        valid_questions = validation_results['valid_questions']

        # Count by status
        active_count = sum(1 for q in valid_questions if q.status == "ACTIVE")
        pending_count = sum(1 for q in valid_questions if q.status == "PENDING")

        success_rate = (len(valid_questions) / total_questions * 100) if total_questions > 0 else 0
        active_rate = (active_count / total_questions * 100) if total_questions > 0 else 0

        print(f"\n📈 Final Statistics:")
        print(f"   - Total questions found: {total_questions:,}")
        print(f"   - Successfully parsed: {len(valid_questions):,}")
        print(f"     • ACTIVE (ready to use): {active_count:,} ({active_rate:.1f}%)")
        print(f"     • PENDING (needs review): {pending_count:,} ({(pending_count/total_questions*100) if total_questions > 0 else 0:.1f}%)")
        print(f"   - Overall success rate: {success_rate:.1f}%")
        print(f"   - Processing time: {processing_stats['elapsed_time_seconds']:.1f}s")
        print(f"   - Average speed: {processing_stats.get('questions_per_second', 0):.1f} q/s")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during processing: {str(e)}")
        print(f"📋 Traceback:")
        traceback.print_exc()
        return False

def main():
    """Main function."""
    test_file = "tests/12.OTMN-Lop12-so1-16-24-25.tex"
    output_dir = "output"
    
    print("🚀 LaTeX Question Parser - File Test")
    print("=" * 60)
    
    success = test_with_file(test_file, output_dir)
    
    if success:
        print("\n🎉 Test completed successfully!")
    else:
        print("\n❌ Test failed!")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
