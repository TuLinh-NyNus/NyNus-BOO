#!/usr/bin/env python3
"""
Analyze PENDING questions from CSV output
"""

import csv
import sys
import os

def analyze_pending_questions():
    """Analyze PENDING questions in the CSV output."""
    
    csv_path = "output/questions.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return
    
    print("🔍 ANALYZING PENDING QUESTIONS")
    print("=" * 60)
    
    pending_questions = []
    total_questions = 0
    active_questions = 0
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            total_questions += 1
            
            if row['status'] == 'PENDING':
                pending_questions.append(row)
            elif row['status'] == 'ACTIVE':
                active_questions += 1
    
    print(f"📊 SUMMARY:")
    print(f"   - Total questions: {total_questions:,}")
    print(f"   - ACTIVE questions: {active_questions:,}")
    print(f"   - PENDING questions: {len(pending_questions):,}")
    print(f"   - PENDING rate: {len(pending_questions)/total_questions*100:.1f}%")
    
    if not pending_questions:
        print("✅ No PENDING questions found!")
        return
    
    # Analyze by type
    print(f"\n📋 PENDING QUESTIONS BY TYPE:")
    type_counts = {}
    for q in pending_questions:
        qtype = q['type']
        type_counts[qtype] = type_counts.get(qtype, 0) + 1
    
    for qtype, count in sorted(type_counts.items()):
        print(f"   - {qtype}: {count:,} questions")
    
    # Show examples
    print(f"\n📝 EXAMPLES OF PENDING QUESTIONS:")
    print("-" * 40)
    
    shown = 0
    for q in pending_questions[:5]:  # Show first 5
        shown += 1
        print(f"\n{shown}. Question ID: {q['id']} (Type: {q['type']})")
        print(f"   Content: {q['content'][:100]}...")
        print(f"   Correct Answer: {q['correctAnswer']}")
        print(f"   Raw Content: {q['rawContent'][:200]}...")
    
    if len(pending_questions) > 5:
        print(f"\n... and {len(pending_questions) - 5} more PENDING questions")
    
    print(f"\n💡 RECOMMENDATIONS:")
    print("   1. Review PENDING questions manually")
    print("   2. Add missing \\True markers for MC questions")
    print("   3. Fill in \\shortans{} content for SA questions")
    print("   4. Update status to ACTIVE after fixing")

def main():
    analyze_pending_questions()

if __name__ == "__main__":
    main()
