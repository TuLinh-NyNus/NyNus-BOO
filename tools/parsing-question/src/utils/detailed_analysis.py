#!/usr/bin/env python3
"""
Phân tích chi tiết để phát hiện lỗi logic trong LaTeX Question Parser
"""

import pandas as pd
import json
import re
import os
import sys
from typing import List, Dict, Any

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def analyze_parsing_logic():
    """Phân tích chi tiết logic parsing."""
    
    print("🔍 PHÂN TÍCH CHI TIẾT LỖI LOGIC PARSING")
    print("=" * 60)
    
    # Load dữ liệu
    output_dir = "output"
    questions_path = os.path.join(output_dir, "questions.csv")
    
    if not os.path.exists(questions_path):
        print("❌ Không tìm thấy file questions.csv")
        return
    
    df = pd.read_csv(questions_path)
    print(f"📊 Loaded {len(df)} questions")
    
    # 1. Phân tích nội dung bị cắt hoặc không đầy đủ
    print("\n1️⃣ PHÂN TÍCH NỘI DUNG BỊ CẮT")
    print("-" * 40)
    
    # Tìm câu hỏi có nội dung quá ngắn
    short_content = df[df['content'].str.len() < 50]
    print(f"❌ {len(short_content)} câu hỏi có nội dung < 50 ký tự")
    
    if not short_content.empty:
        print("Mẫu câu hỏi có nội dung ngắn:")
        for idx, row in short_content.head(3).iterrows():
            print(f"  ID {row['id']}: '{row['content'][:100]}...'")
    
    # 2. Phân tích đáp án không được trích xuất đúng
    print("\n2️⃣ PHÂN TÍCH ĐÁP ÁN")
    print("-" * 40)
    
    # Câu hỏi không có đáp án
    no_answers = df[df['answers'].isna() | (df['answers'].str.strip() == '')]
    print(f"❌ {len(no_answers)} câu hỏi không có đáp án")
    
    # Câu hỏi không có đáp án đúng
    no_correct = df[df['correctAnswer'].isna() | (df['correctAnswer'].str.strip() == '')]
    print(f"❌ {len(no_correct)} câu hỏi không có đáp án đúng")
    
    # Phân tích format đáp án
    answer_formats = {}
    for idx, row in df.head(100).iterrows():  # Chỉ phân tích 100 câu đầu
        if pd.notna(row['answers']) and row['answers'].strip():
            try:
                answers = json.loads(row['answers'])
                if isinstance(answers, list) and answers:
                    first_answer = answers[0]
                    if isinstance(first_answer, dict):
                        format_key = "dict_format"
                    else:
                        format_key = "string_format"
                    answer_formats[format_key] = answer_formats.get(format_key, 0) + 1
            except:
                answer_formats['invalid_json'] = answer_formats.get('invalid_json', 0) + 1
    
    print("Format đáp án:")
    for format_type, count in answer_formats.items():
        print(f"  - {format_type}: {count}")
    
    # 3. Phân tích LaTeX commands không được xử lý
    print("\n3️⃣ PHÂN TÍCH LATEX COMMANDS")
    print("-" * 40)
    
    latex_patterns = [
        (r'\\begin\{[^}]+\}', 'begin environments'),
        (r'\\end\{[^}]+\}', 'end environments'),
        (r'\\choice[A-Z]*', 'choice commands'),
        (r'\\True', 'True markers'),
        (r'\\loigiai', 'solution markers'),
        (r'\\[a-zA-Z]+\{', 'other commands with braces')
    ]
    
    for pattern, description in latex_patterns:
        matches = df['content'].str.contains(pattern, na=False).sum()
        if matches > 0:
            print(f"❌ {matches} câu hỏi còn chứa {description}")
    
    # 4. Phân tích loại câu hỏi
    print("\n4️⃣ PHÂN TÍCH LOẠI CÂU HỎI")
    print("-" * 40)
    
    type_counts = df['type'].value_counts()
    print("Phân bố loại câu hỏi:")
    for qtype, count in type_counts.items():
        print(f"  - {qtype}: {count:,} câu")
    
    # Kiểm tra logic phân loại
    # TF questions should have True/False answers
    tf_questions = df[df['type'] == 'TF']
    if not tf_questions.empty:
        print(f"\nKiểm tra câu hỏi TF ({len(tf_questions)} câu):")
        tf_with_multiple_answers = 0
        for idx, row in tf_questions.head(10).iterrows():
            if pd.notna(row['answers']):
                try:
                    answers = json.loads(row['answers'])
                    if len(answers) > 2:
                        tf_with_multiple_answers += 1
                except:
                    pass
        if tf_with_multiple_answers > 0:
            print(f"  ⚠️ {tf_with_multiple_answers}/10 câu TF có >2 đáp án (có thể sai loại)")
    
    # 5. Phân tích solution extraction
    print("\n5️⃣ PHÂN TÍCH TRÍCH XUẤT LỜI GIẢI")
    print("-" * 40)
    
    has_solution = df['solution'].notna() & (df['solution'].str.strip() != '')
    print(f"✅ {has_solution.sum()}/{len(df)} câu hỏi có lời giải ({has_solution.mean()*100:.1f}%)")
    
    # Kiểm tra solution có chứa LaTeX commands
    if has_solution.any():
        solutions_with_latex = df[has_solution]['solution'].str.contains(r'\\[a-zA-Z]+', na=False).sum()
        print(f"⚠️ {solutions_with_latex} lời giải còn chứa LaTeX commands")

def compare_with_original_detailed():
    """So sánh chi tiết với file gốc."""
    
    print("\n🔄 SO SÁNH CHI TIẾT VỚI FILE GỐC")
    print("=" * 60)
    
    original_file = "tests/10-11.so1-17-24-25.md"
    
    if not os.path.exists(original_file):
        print(f"❌ Không tìm thấy file gốc: {original_file}")
        return
    
    # Đọc file gốc
    with open(original_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    print(f"📄 File gốc: {len(original_content):,} ký tự")
    
    # Tìm tất cả câu hỏi trong file gốc
    ex_pattern = r'\\begin\{ex\}.*?\\end\{ex\}'
    original_questions = re.findall(ex_pattern, original_content, re.DOTALL)
    
    print(f"📊 Tìm thấy {len(original_questions)} câu hỏi trong file gốc")
    
    # Load parsed data
    df = pd.read_csv("output/questions.csv")
    print(f"📊 Đã parse {len(df)} câu hỏi")
    
    # So sánh số lượng
    if len(original_questions) != len(df):
        print(f"⚠️ Số lượng không khớp: Gốc {len(original_questions)} vs Parsed {len(df)}")
    
    # Phân tích câu hỏi đầu tiên
    if original_questions:
        print("\n📝 PHÂN TÍCH CÂU HỎI ĐẦU TIÊN:")
        print("-" * 40)
        
        first_original = original_questions[0]
        print("🔸 Câu hỏi gốc:")
        print(first_original[:500] + "..." if len(first_original) > 500 else first_original)
        
        if not df.empty:
            first_parsed = df.iloc[0]
            print("\n🔸 Câu hỏi đã parse:")
            print(f"Content: {first_parsed['content'][:300]}...")
            print(f"Type: {first_parsed['type']}")
            print(f"Answers: {first_parsed['answers'][:200] if pd.notna(first_parsed['answers']) else 'None'}...")
            print(f"Correct: {first_parsed['correctAnswer'][:200] if pd.notna(first_parsed['correctAnswer']) else 'None'}...")
    
    # Phân tích patterns trong file gốc
    print("\n🔍 PHÂN TÍCH PATTERNS TRONG FILE GỐC:")
    print("-" * 40)
    
    patterns_to_check = [
        (r'\\choiceTF', 'choiceTF commands'),
        (r'\\choice(?!TF)', 'choice commands'),
        (r'\\shortans', 'shortans commands'),
        (r'\\True', 'True markers'),
        (r'\\loigiai\{', 'solution blocks'),
        (r'%\[([^\]]+)\]', 'question codes')
    ]
    
    for pattern, description in patterns_to_check:
        matches = re.findall(pattern, original_content)
        print(f"  - {description}: {len(matches)} lần xuất hiện")
        if matches and len(matches) <= 5:
            print(f"    Ví dụ: {matches[:3]}")

def main():
    """Main analysis function."""
    analyze_parsing_logic()
    compare_with_original_detailed()
    
    print("\n" + "=" * 60)
    print("🎯 KẾT LUẬN:")
    print("Hãy mở giao diện Streamlit tại http://localhost:8503 để xem chi tiết")
    print("và so sánh kết quả parsing với dữ liệu gốc.")

if __name__ == "__main__":
    main()
