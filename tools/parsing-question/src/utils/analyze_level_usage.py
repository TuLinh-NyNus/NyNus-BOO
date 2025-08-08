#!/usr/bin/env python3
"""
Analyze Level Usage in QuestionCodes
"""

import csv
import sys
import os
from collections import Counter

def analyze_level_usage():
    """Analyze level usage in the parsed QuestionCodes."""
    
    csv_path = "output/question_codes.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return
    
    print("🔍 ANALYZING QUESTIONCODE LEVEL USAGE")
    print("=" * 60)
    
    level_counts = Counter()
    total_codes = 0
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            total_codes += 1
            level = row['level']
            level_counts[level] += 1
    
    print(f"📊 LEVEL DISTRIBUTION:")
    print(f"   - Total QuestionCodes: {total_codes:,}")
    print("-" * 40)
    
    # Sort by count (descending)
    for level, count in level_counts.most_common():
        percentage = count / total_codes * 100
        print(f"   - Level {level}: {count:,} codes ({percentage:.1f}%)")
    
    # Check for mapped levels
    mapped_levels = ['N', 'H', 'V', 'C']  # These could be from Y, B, K, G
    original_levels = ['T', 'M']  # These are only original
    
    print(f"\n🔍 LEVEL ANALYSIS:")
    print("-" * 40)
    
    for level in mapped_levels:
        if level in level_counts:
            print(f"   - Level {level}: {level_counts[level]:,} codes")
            print(f"     (Could include mapped from Y→N, B→H, K→V, G→C)")
    
    for level in original_levels:
        if level in level_counts:
            print(f"   - Level {level}: {level_counts[level]:,} codes (original only)")
    
    # Show some examples
    print(f"\n📝 SAMPLE QUESTIONCODES BY LEVEL:")
    print("-" * 40)
    
    samples_shown = {}
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            level = row['level']
            if level not in samples_shown and len(samples_shown) < 6:
                samples_shown[level] = row['code']
    
    for level in sorted(samples_shown.keys()):
        print(f"   - Level {level}: {samples_shown[level]}")
    
    print(f"\n💡 NOTES:")
    print("   - All levels shown are AFTER mapping (Y→N, B→H, K→V, G→C)")
    print("   - Original file may have contained Y, B, K, G levels")
    print("   - These were automatically converted to standard levels")

def main():
    analyze_level_usage()

if __name__ == "__main__":
    main()
