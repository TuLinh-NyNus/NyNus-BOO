#!/usr/bin/env python3
"""
Test Integration with New Levels in LaTeX Content
"""

import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from parser.question_code_parser import QuestionCodeParser

def test_new_levels_integration():
    """Test parsing QuestionCodes with new levels from LaTeX content."""
    
    print("🧪 TESTING NEW LEVELS INTEGRATION")
    print("=" * 60)
    
    # Test LaTeX content with new levels
    test_cases = [
        # Y level (should map to N)
        ("\\begin{ex}%[2P1Y1-1]\nContent here\n\\end{ex}", "2P1Y1-1", "N"),
        
        # B level (should map to H)  
        ("\\begin{ex}%[2P1B2-2]\nContent here\n\\end{ex}", "2P1B2-2", "H"),
        
        # K level (should map to V)
        ("\\begin{ex}%[2P1K3-3]\nContent here\n\\end{ex}", "2P1K3-3", "V"),
        
        # G level (should map to C)
        ("\\begin{ex}%[2P1G4-4]\nContent here\n\\end{ex}", "2P1G4-4", "C"),
        
        # Mixed with original levels
        ("\\begin{ex}%[2P1N1]\nContent here\n\\end{ex}", "2P1N1", "N"),
        ("\\begin{ex}%[2P1H1]\nContent here\n\\end{ex}", "2P1H1", "H"),
        
        # Invalid levels (should fail)
        ("\\begin{ex}%[2P1X1]\nContent here\n\\end{ex}", None, None),
        ("\\begin{ex}%[2P1Z1]\nContent here\n\\end{ex}", None, None),
    ]
    
    print("📋 INTEGRATION TEST RESULTS:")
    print("-" * 40)
    
    passed = 0
    failed = 0
    
    for i, (latex_content, expected_code, expected_level) in enumerate(test_cases, 1):
        print(f"\n{i}. Testing LaTeX content with level extraction")
        
        # Extract QuestionCode from LaTeX
        question_code = QuestionCodeParser.extract_question_code(latex_content)
        
        if expected_code is None:
            # Should fail to parse
            if question_code is None:
                print(f"   ✅ PASS - Correctly failed to parse invalid level")
                passed += 1
            else:
                print(f"   ❌ FAIL - Should have failed, got: {question_code.code}")
                failed += 1
        else:
            # Should parse successfully
            if question_code is None:
                print(f"   ❌ FAIL - Failed to parse valid code: {expected_code}")
                failed += 1
            elif question_code.code == expected_code and question_code.level == expected_level:
                print(f"   ✅ PASS - Code: {question_code.code}, Level: {question_code.level}")
                passed += 1
            else:
                print(f"   ❌ FAIL - Expected: {expected_code}/{expected_level}")
                print(f"            Got: {question_code.code if question_code else None}/{question_code.level if question_code else None}")
                failed += 1
    
    print(f"\n📊 INTEGRATION TEST SUMMARY:")
    print(f"   - Total tests: {len(test_cases)}")
    print(f"   - Passed: {passed}")
    print(f"   - Failed: {failed}")
    print(f"   - Success rate: {passed/len(test_cases)*100:.1f}%")
    
    if failed == 0:
        print(f"\n🎉 ALL INTEGRATION TESTS PASSED!")
        print(f"\n✅ READY FOR PRODUCTION:")
        print("   - New levels Y, B, K, G will be automatically mapped")
        print("   - Y → N (Nhận biết)")
        print("   - B → H (Hiểu)")
        print("   - K → V (Vận dụng)")
        print("   - G → C (Vận dụng cao)")
        print("   - Invalid levels will be rejected")
        print("   - All existing functionality preserved")
    else:
        print(f"\n⚠️ {failed} integration tests failed")

def main():
    test_new_levels_integration()

if __name__ == "__main__":
    main()
