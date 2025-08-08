#!/usr/bin/env python3
"""
Test Level Mapping Logic for QuestionCode
"""

import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from models.question_code import QuestionCode

def test_level_mapping():
    """Test the new level mapping logic."""
    
    print("🧪 TESTING QUESTIONCODE LEVEL MAPPING")
    print("=" * 60)
    
    # Test cases: (input_code, expected_level, description)
    test_cases = [
        # Original levels (should remain unchanged)
        ("2P1N1", "N", "Original N level"),
        ("2P1H1", "H", "Original H level"),
        ("2P1V1", "V", "Original V level"),
        ("2P1C1", "C", "Original C level"),
        ("2P1T1", "T", "Original T level"),
        ("2P1M1", "M", "Original M level"),
        
        # New levels (should be mapped)
        ("2P1Y1", "N", "Y → N mapping"),
        ("2P1B1", "H", "B → H mapping"),
        ("2P1K1", "V", "K → V mapping"),
        ("2P1G1", "C", "G → C mapping"),
        
        # ID6 format tests
        ("2P1Y1-1", "N", "Y → N mapping (ID6)"),
        ("2P1B1-2", "H", "B → H mapping (ID6)"),
        ("2P1K1-3", "V", "K → V mapping (ID6)"),
        ("2P1G1-4", "C", "G → C mapping (ID6)"),
        
        # Invalid levels (should fail to parse)
        ("2P1X1", None, "Invalid level X"),
        ("2P1Z1", None, "Invalid level Z"),
    ]
    
    print("📋 TEST RESULTS:")
    print("-" * 40)
    
    passed = 0
    failed = 0
    
    for i, (input_code, expected_level, description) in enumerate(test_cases, 1):
        print(f"\n{i:2d}. {description}")
        print(f"    Input: {input_code}")
        
        # Parse QuestionCode
        question_code = QuestionCode.from_code_string(input_code)
        
        if expected_level is None:
            # Should fail to parse
            if question_code is None:
                print(f"    ✅ PASS - Correctly failed to parse invalid level")
                passed += 1
            else:
                print(f"    ❌ FAIL - Should have failed to parse, got level: {question_code.level}")
                failed += 1
        else:
            # Should parse successfully
            if question_code is None:
                print(f"    ❌ FAIL - Failed to parse valid code")
                failed += 1
            elif question_code.level == expected_level:
                print(f"    ✅ PASS - Level: {question_code.level}")
                passed += 1
            else:
                print(f"    ❌ FAIL - Expected: {expected_level}, Got: {question_code.level}")
                failed += 1
    
    print(f"\n📊 SUMMARY:")
    print(f"   - Total tests: {len(test_cases)}")
    print(f"   - Passed: {passed}")
    print(f"   - Failed: {failed}")
    print(f"   - Success rate: {passed/len(test_cases)*100:.1f}%")
    
    if failed == 0:
        print(f"\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️ {failed} tests failed")
    
    # Test validation
    print(f"\n🔍 TESTING VALIDATION:")
    print("-" * 40)
    
    valid_code = QuestionCode.from_code_string("2P1Y1")
    if valid_code:
        errors = valid_code.validate()
        if not errors:
            print("✅ Validation passed for mapped level")
        else:
            print(f"❌ Validation failed: {errors}")
    
    # Test CSV export
    print(f"\n📄 TESTING CSV EXPORT:")
    print("-" * 40)
    
    if valid_code:
        csv_dict = valid_code.to_csv_dict()
        print(f"CSV output: {csv_dict}")
        print(f"Level in CSV: {csv_dict['level']} (should be mapped value)")

def main():
    test_level_mapping()

if __name__ == "__main__":
    main()
