"""
Simple Test Script for LaTeX Question Parser

Run this script to test the parser with sample data.
"""

import os
import sys

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_basic_parsing():
    """Test basic parsing functionality."""
    print("🧪 Testing LaTeX Question Parser...")
    
    try:
        # Import modules
        from parser.latex_parser import LaTeXQuestionParser
        from processor.file_reader import FileReader
        from export.csv_exporter import CSVExporter
        from export.data_validator import DataValidator
        
        print("✅ All modules imported successfully")
        
        # Test with sample file
        sample_file = os.path.join(current_dir, "tests", "sample_data", "sample_small.md")
        
        if not os.path.exists(sample_file):
            print(f"❌ Sample file not found: {sample_file}")
            return False
        
        print(f"📁 Reading sample file: {sample_file}")
        
        # Read file
        file_reader = FileReader(sample_file)
        content = file_reader.read_full_content()
        
        print(f"📊 File size: {len(content)} characters")
        
        # Parse questions
        print("🔍 Parsing questions...")

        # Debug: Check for ex environments
        import re
        ex_matches = re.findall(r'\\begin\{ex\}', content)
        print(f"🔍 Found {len(ex_matches)} \\begin{{ex}} patterns")

        # Debug: Test regex directly
        pattern = r'((?:%.*?\n)*?)\\begin\{ex\}(.*?)\\end\{ex\}'
        matches = list(re.finditer(pattern, content, re.DOTALL))
        print(f"🔍 Direct regex found {len(matches)} matches")

        if matches:
            first_match = matches[0]
            print(f"🔍 First match groups: {len(first_match.groups())}")
            print(f"🔍 Group 1 (metadata): {repr(first_match.group(1)[:100])}")
            print(f"🔍 Group 2 (content): {repr(first_match.group(2)[:100])}")

        # Extract question blocks first
        question_blocks = LaTeXQuestionParser.extract_questions_from_content(content)
        print(f"🔍 Extracted {len(question_blocks)} question blocks")

        if question_blocks:
            print(f"🔍 First block preview: {question_blocks[0][:200]}...")

        questions, question_codes, errors = LaTeXQuestionParser.parse_latex_file(content)
        
        print(f"✅ Parsed {len(questions)} questions")
        print(f"✅ Found {len(question_codes)} question codes")
        
        if errors:
            print(f"⚠️ {len(errors)} parsing errors:")
            for error in errors[:3]:  # Show first 3 errors
                print(f"   - {error}")
        
        # Test question types
        type_counts = {}
        for question in questions:
            type_counts[question.type] = type_counts.get(question.type, 0) + 1
        
        print("📝 Question types found:")
        for q_type, count in type_counts.items():
            print(f"   - {q_type}: {count}")
        
        # Validate data
        print("✅ Validating data...")
        validator = DataValidator()
        validation_results = validator.validate_all_data(questions, question_codes)
        
        valid_questions = len(validation_results['valid_questions'])
        valid_codes = len(validation_results['valid_question_codes'])
        
        print(f"✅ {valid_questions}/{len(questions)} questions valid")
        print(f"✅ {valid_codes}/{len(question_codes)} question codes valid")
        
        # Test CSV export
        print("💾 Testing CSV export...")
        output_dir = os.path.join(current_dir, "test_output")
        os.makedirs(output_dir, exist_ok=True)
        
        csv_exporter = CSVExporter(output_dir)
        export_files = csv_exporter.export_all(
            validation_results['valid_questions'],
            validation_results['valid_question_codes'],
            []
        )
        
        print("📄 Exported files:")
        for file_type, file_path in export_files.items():
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"   - {file_type}: {file_path} ({file_size} bytes)")
            else:
                print(f"   - {file_type}: ❌ Not created")
        
        # Sample question details
        if questions:
            print("\n🔍 Sample Question Details:")
            sample_q = questions[0]
            print(f"   - ID: {sample_q.id}")
            print(f"   - Type: {sample_q.type}")
            print(f"   - Subcount: {sample_q.subcount}")
            print(f"   - Question Code: {sample_q.questionCodeId}")
            print(f"   - Content: {sample_q.content[:100]}...")
            
            if sample_q.answers:
                print(f"   - Answers: {len(sample_q.answers)} options")
                for i, answer in enumerate(sample_q.answers[:2]):
                    print(f"     {i+1}. {answer.content[:50]}... (Correct: {answer.isCorrect})")
            
            if sample_q.correctAnswer:
                print(f"   - Correct Answer: {sample_q.correctAnswer}")
        
        print("\n🎉 All tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_question_code_parsing():
    """Test question code parsing specifically."""
    print("\n🧪 Testing Question Code Parsing...")
    
    try:
        from parser.question_code_parser import QuestionCodeParser
        from models.question_code import QuestionCode
        
        # Test cases
        test_cases = [
            "200N0-0",  # ID6 format
            "1P1V1",    # ID5 format
            "2H3C4",    # ID5 format
            "3L5T7",    # ID5 format
        ]
        
        for code_string in test_cases:
            print(f"   Testing: {code_string}")
            
            # Test validation
            is_valid = QuestionCodeParser.validate_question_code_format(code_string)
            print(f"     Valid format: {is_valid}")
            
            # Test parsing
            question_code = QuestionCode.from_code_string(code_string)
            if question_code:
                print(f"     Parsed: Grade={question_code.grade}, Subject={question_code.subject}, Level={question_code.level}")
                print(f"     Format: {question_code.format}")
            else:
                print(f"     ❌ Failed to parse")
        
        print("✅ Question code parsing tests completed")
        
    except Exception as e:
        print(f"❌ Question code test failed: {str(e)}")


def main():
    """Main test function."""
    print("=" * 60)
    print("LaTeX Question Parser - Test Suite")
    print("=" * 60)
    
    # Run basic parsing test
    success = test_basic_parsing()
    
    # Run question code test
    test_question_code_parsing()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests completed successfully!")
        print("🚀 You can now run the full application with: python run.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 60)


if __name__ == "__main__":
    main()
