#!/usr/bin/env python3
"""
Test Text Cleaning for Streamlit Display
"""

import pandas as pd
import os

def clean_text_display(text):
    """Clean text for better display in Streamlit."""
    if pd.isna(text) or text is None:
        return "N/A"

    text = str(text)

    # Handle JSON strings (for answers field)
    import json
    import re

    # Try to parse as JSON and format nicely
    if text.startswith('[') and text.endswith(']'):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                formatted_items = []
                for i, item in enumerate(parsed):
                    if isinstance(item, dict):
                        content = item.get('content', '')
                        is_correct = item.get('isCorrect', False)
                        correct_mark = " ✓" if is_correct else ""
                        formatted_items.append(f"{i+1}. {content}{correct_mark}")
                    else:
                        formatted_items.append(f"{i+1}. {item}")
                text = '\n'.join(formatted_items)
        except:
            pass  # If not valid JSON, continue with text cleaning

    # Decode Unicode escape sequences
    try:
        text = text.encode().decode('unicode_escape')
    except:
        pass  # If decoding fails, continue with original text

    # Handle common LaTeX/encoding issues
    replacements = {
        '\\n': '\n',
        '\\t': '    ',  # Convert tabs to spaces
        '\\\\': '\n',   # LaTeX line breaks
        '\\lq\\lq': '"',
        '\\rq\\rq': '"',
        '\\lq': "'",
        '\\rq': "'",
        '\\$': '$',
        '\\{': '{',
        '\\}': '}',
        '\\&': '&',
        '\\%': '%',
        '\\#': '#',
        '\\_': '_',
        '\\^': '^',
        '\\~': '~',
        '\\textbf{': '**',
        '\\textit{': '*',
        '\\emph{': '*',
        '\\begin{itemize}': '\n',
        '\\end{itemize}': '\n',
        '\\item': '• ',
        '\\begin{enumerate}': '\n',
        '\\end{enumerate}': '\n',
        '\\begin{itemchoice}': '\n',
        '\\end{itemchoice}': '\n',
        '\\itemch': '• ',
        '\\True': '✓ ',
        '\\False': '✗ ',
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Clean up LaTeX math and formatting
    text = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', text)  # Remove LaTeX commands but keep content
    text = re.sub(r'\\[a-zA-Z]+', '', text)  # Remove remaining LaTeX commands

    # Clean up multiple spaces and newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)  # Multiple newlines to double
    text = re.sub(r' +', ' ', text)  # Multiple spaces to single
    text = re.sub(r'\t+', '    ', text)  # Multiple tabs to spaces

    return text.strip()

def test_text_cleaning():
    """Test text cleaning with sample data."""
    
    print("🧪 TESTING TEXT CLEANING")
    print("=" * 60)
    
    # Load sample data
    csv_path = "output/questions.csv"
    if not os.path.exists(csv_path):
        print("❌ CSV file not found. Please run parser first.")
        return
    
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    print(f"📊 Loaded {len(df)} questions")
    print(f"📋 Columns: {list(df.columns)}")
    
    # Test cleaning on first few questions
    print(f"\n🔍 TESTING TEXT CLEANING ON FIRST 3 QUESTIONS:")
    print("-" * 60)
    
    for i in range(min(3, len(df))):
        row = df.iloc[i]
        print(f"\n📝 Question {i+1} (ID: {row.get('id', 'N/A')}):")
        
        # Test content cleaning
        if 'content' in row and pd.notna(row['content']):
            original = str(row['content'])[:200]
            cleaned = clean_text_display(row['content'])[:200]
            
            print(f"   Original: {repr(original)}")
            print(f"   Cleaned:  {repr(cleaned)}")
            print(f"   Length:   {len(original)} → {len(cleaned)}")
        
        # Test answers cleaning
        if 'answers' in row and pd.notna(row['answers']):
            original = str(row['answers'])[:100]
            cleaned = clean_text_display(row['answers'])[:100]
            
            print(f"   Answers Original: {repr(original)}")
            print(f"   Answers Cleaned:  {repr(cleaned)}")
    
    # Check for common problematic characters
    print(f"\n🔍 CHECKING FOR PROBLEMATIC CHARACTERS:")
    print("-" * 60)
    
    problematic_chars = ['\\n', '\\t', '\\lq', '\\rq', '\\textbf', '\\$', '\\{', '\\}']
    
    for char in problematic_chars:
        count = 0
        for col in ['content', 'answers', 'solution']:
            if col in df.columns:
                count += df[col].astype(str).str.contains(char, regex=False, na=False).sum()
        
        if count > 0:
            print(f"   Found '{char}': {count} occurrences")
    
    # Show column statistics
    print(f"\n📊 COLUMN STATISTICS:")
    print("-" * 60)
    
    for col in df.columns:
        non_null = df[col].notna().sum()
        total = len(df)
        percentage = (non_null / total * 100) if total > 0 else 0
        
        print(f"   {col:20}: {non_null:4}/{total} ({percentage:5.1f}%)")
    
    print(f"\n✅ Text cleaning test completed!")

def main():
    test_text_cleaning()

if __name__ == "__main__":
    main()
