"""
Excel Exporter

Exports parsed question data to Excel files with multiple sheets.
"""

import pandas as pd
import os
from typing import List, Dict, Any
from datetime import datetime
import sys

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from models.question import Question
from models.question_code import QuestionCode
from models.question_tag import QuestionTag


class ExcelExporter:
    """
    Exports question data to Excel files with multiple sheets.
    
    Creates Excel file with 3 sheets:
    - Questions: Main question data
    - Question_codes: QuestionCode lookup table
    - Question_tags: Question tags
    """
    
    def __init__(self, output_dir: str = "output"):
        """
        Initialize Excel exporter.
        
        Args:
            output_dir: Directory to save Excel files
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def export_all(
        self, 
        questions: List[Question], 
        question_codes: List[QuestionCode], 
        question_tags: List[QuestionTag] = None
    ) -> str:
        """
        Export all data to Excel file with multiple sheets.
        
        Args:
            questions: List of Question objects
            question_codes: List of QuestionCode objects
            question_tags: List of QuestionTag objects
            
        Returns:
            Path to the exported Excel file
        """
        # Create unique filename to avoid permission issues
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(self.output_dir, f"questions_export_{timestamp}.xlsx")
        
        # Create Excel writer with styling
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:

            # Generate QuestionTag records from generatedTags
            from export.csv_exporter import CSVExporter
            csv_exporter = CSVExporter()
            generated_question_tags = csv_exporter.generate_question_tags_from_questions(questions)

            # Sheet 1: Questions merged with Question Codes and Tags
            merged_df = self._create_merged_dataframe_with_tags(questions, question_codes, generated_question_tags)
            merged_df.to_excel(writer, sheet_name='Questions', index=False)

            # Sheet 2: Question Tags (separate table)
            tags_df = self._create_question_tags_dataframe(generated_question_tags)
            tags_df.to_excel(writer, sheet_name='Question_tags', index=False)

            # Apply styling
            self._apply_excel_styling(writer, merged_df, tags_df)
        
        return file_path

    def _create_merged_dataframe(
        self,
        questions: List[Question],
        question_codes: List[QuestionCode]
    ) -> pd.DataFrame:
        """Create DataFrame with questions merged with question codes."""
        if not questions:
            return pd.DataFrame()

        # Create lookup dictionary for question codes
        codes_lookup = {code.code: code for code in question_codes}

        # Convert questions to dictionaries
        data = []
        for question in questions:
            row_data = question.to_csv_dict()

            # Clean all text fields for Excel compatibility
            text_fields = ['rawContent', 'content', 'answers', 'correctAnswer', 'solution', 'source']
            for field in text_fields:
                if field in row_data and row_data[field]:
                    row_data[field] = self._clean_for_excel(row_data[field])

            # Add question code data if available
            if question.questionCodeId and question.questionCodeId in codes_lookup:
                code = codes_lookup[question.questionCodeId]
                row_data.update({
                    'code': code.code,
                    'format': code.format,
                    'grade': code.grade,
                    'subject': code.subject,
                    'chapter': code.chapter,
                    'lesson': code.lesson,
                    'level': code.level,
                    'form': code.form
                })
            else:
                # Add empty code fields
                row_data.update({
                    'code': '',
                    'format': '',
                    'grade': '',
                    'subject': '',
                    'chapter': '',
                    'lesson': '',
                    'level': '',
                    'form': ''
                })

            data.append(row_data)

        return pd.DataFrame(data)

    def _create_merged_dataframe_with_tags(
        self,
        questions: List[Question],
        question_codes: List[QuestionCode],
        question_tags: List[QuestionTag]
    ) -> pd.DataFrame:
        """Create merged DataFrame with questions, question codes, and tags."""
        if not questions:
            return pd.DataFrame()

        # Create lookup dictionaries
        codes_lookup = {code.code: code for code in question_codes}

        # Create tags lookup: questionId -> list of tag names
        tags_lookup = {}
        for tag in question_tags:
            if tag.questionId not in tags_lookup:
                tags_lookup[tag.questionId] = []
            tags_lookup[tag.questionId].append(tag.tagName)

        # Convert questions to list of dictionaries
        data = []
        for question in questions:
            row_data = question.to_csv_dict()

            # Add question code data if available
            if question.questionCodeId and question.questionCodeId in codes_lookup:
                code = codes_lookup[question.questionCodeId]
                row_data.update({
                    'code': code.code,
                    'format': code.format,
                    'grade': code.grade,
                    'subject': code.subject,
                    'chapter': code.chapter,
                    'lesson': code.lesson,
                    'level': code.level,
                    'form': code.form
                })
            else:
                # Add empty code fields
                row_data.update({
                    'code': '',
                    'format': '',
                    'grade': '',
                    'subject': '',
                    'chapter': '',
                    'lesson': '',
                    'level': '',
                    'form': ''
                })

            # Add tags data
            question_tag_names = tags_lookup.get(question.id, [])
            row_data['questionTags'] = '; '.join(question_tag_names)
            row_data['tagCount'] = len(question_tag_names)

            # Clean all text fields for Excel compatibility
            for key, value in row_data.items():
                if isinstance(value, str):
                    row_data[key] = self._clean_for_excel(value)

            data.append(row_data)

        return pd.DataFrame(data)

    def _clean_for_excel(self, text: str) -> str:
        """Clean text for Excel compatibility by removing illegal characters."""
        if not text:
            return text

        import re
        text = str(text)

        # Remove control characters that Excel doesn't support
        # Keep only printable ASCII characters, common Unicode, and basic whitespace
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)

        # Remove problematic Unicode characters that cause Excel issues
        cleaned = re.sub(r'[\u0080-\u009F]', '', cleaned)

        # Only remove problematic control characters, keep LaTeX and Math intact
        # Remove only the most problematic characters that Excel absolutely cannot handle
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', cleaned)  # Remove only control chars

        # Keep LaTeX and Math expressions intact - only clean if they cause Excel errors
        # Don't replace \begin{}, \end{}, LaTeX commands, or $math$ expressions

        # Replace some problematic characters
        replacements = {
            '\u00A0': ' ',  # Non-breaking space
            '\u2028': '\n', # Line separator
            '\u2029': '\n', # Paragraph separator
        }

        for old, new in replacements.items():
            cleaned = cleaned.replace(old, new)

        # Remove any remaining problematic characters for Excel
        # Keep only characters that Excel can safely handle
        cleaned = ''.join(char for char in cleaned if ord(char) < 65536 and char.isprintable() or char in '\n\r\t ')

        # Truncate very long content to prevent Excel issues
        if len(cleaned) > 32767:  # Excel cell limit
            cleaned = cleaned[:32760] + "..."

        return cleaned

    def _create_questions_dataframe(self, questions: List[Question]) -> pd.DataFrame:
        """Create DataFrame for questions sheet."""
        if not questions:
            return pd.DataFrame()
        
        data = []
        for question in questions:
            # Convert answers to readable format
            answers_text = ""
            if question.answers:
                for i, answer in enumerate(question.answers):
                    if isinstance(answer, dict):
                        correct_mark = "✓" if answer.get('isCorrect', False) else ""
                        answers_text += f"{i+1}. {correct_mark} {answer.get('content', '')}\n"
                    else:
                        answers_text += f"{i+1}. {answer}\n"
            
            # Convert correctAnswer to readable format
            correct_answer_text = ""
            if question.correctAnswer:
                if isinstance(question.correctAnswer, list):
                    correct_answer_text = "; ".join(str(x) for x in question.correctAnswer)
                else:
                    correct_answer_text = str(question.correctAnswer)
            
            data.append({
                'ID': question.id,
                'Type': question.type,
                'Status': question.status,
                'Content': question.content,
                'Answers': answers_text.strip(),
                'Correct_Answer': correct_answer_text,
                'Solution': question.solution or "",
                'Source': question.source or "",
                'Subcount': question.subcount or "",
                'Question_Code_ID': question.questionCodeId or "",
                'Usage_Count': question.usageCount,
                'Creator': question.creator,
                'Feedback': question.feedback,
                'Difficulty': question.difficulty,
                'Created_At': question.created_at.strftime('%Y-%m-%d %H:%M:%S') if question.created_at else "",
                'Updated_At': question.updated_at.strftime('%Y-%m-%d %H:%M:%S') if question.updated_at else "",
                'Tags': ", ".join(question.tag) if question.tag else "",
                'Raw_Content': question.rawContent[:500] + "..." if len(question.rawContent) > 500 else question.rawContent
            })
        
        return pd.DataFrame(data)
    
    def _create_question_codes_dataframe(self, question_codes: List[QuestionCode]) -> pd.DataFrame:
        """Create DataFrame for question codes sheet."""
        if not question_codes:
            return pd.DataFrame()
        
        data = []
        for code in question_codes:
            data.append({
                'Code': code.code,
                'Format': code.format,
                'Grade': code.grade,
                'Subject': code.subject,
                'Chapter': code.chapter,
                'Lesson': code.lesson,
                'Level': code.level,
                'Form': code.form or ""
            })
        
        return pd.DataFrame(data)
    
    def _create_question_tags_dataframe(self, question_tags: List[QuestionTag]) -> pd.DataFrame:
        """Create DataFrame for question tags sheet."""
        if not question_tags:
            # Return empty DataFrame with headers
            return pd.DataFrame(columns=['Tag_Name', 'Description', 'Category'])
        
        data = []
        for tag in question_tags:
            data.append({
                'Tag_Name': tag.name if hasattr(tag, 'name') else str(tag),
                'Description': tag.description if hasattr(tag, 'description') else "",
                'Category': tag.category if hasattr(tag, 'category') else ""
            })
        
        return pd.DataFrame(data)
    
    def _apply_excel_styling(self, writer, questions_df, tags_df):
        """Apply styling to Excel sheets."""
        from openpyxl.styles import Font, PatternFill, Alignment

        # Style headers
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")

        # Questions sheet styling (merged with codes)
        if not questions_df.empty:
            ws_questions = writer.sheets['Questions']
            for cell in ws_questions[1]:  # Header row
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal="center")

            # Auto-adjust column widths
            for column in ws_questions.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)  # Max width 50
                ws_questions.column_dimensions[column_letter].width = adjusted_width

        # Question tags sheet styling
        if not tags_df.empty:
            ws_tags = writer.sheets['Question_tags']
            for cell in ws_tags[1]:  # Header row
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal="center")
