"""
Results View Component

Displays processing results and statistics.
"""

import streamlit as st
from typing import Dict, Any, List
import pandas as pd
import json


class ResultsViewComponent:
    """Component for displaying processing results."""
    
    @staticmethod
    def render(processing_results: Dict[str, Any]):
        """
        Render the results view.
        
        Args:
            processing_results: Results from data validation and processing
        """
        if not processing_results:
            st.info("No processing results available.")
            return
        
        # Main statistics
        ResultsViewComponent._render_main_statistics(processing_results)
        
        # Question type breakdown
        ResultsViewComponent._render_question_types(processing_results)
        
        # Validation results
        ResultsViewComponent._render_validation_results(processing_results)
        
        # Sample data preview
        ResultsViewComponent._render_sample_data(processing_results)
        
        # Error summary
        ResultsViewComponent._render_error_summary(processing_results)
    
    @staticmethod
    def _render_main_statistics(processing_results: Dict[str, Any]):
        """Render main processing statistics."""
        st.subheader("📊 Processing Statistics")
        
        stats = processing_results.get('statistics', {})
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "Total Questions",
                stats.get('total_questions_input', 0),
                help="Total number of question blocks processed"
            )
        
        with col2:
            st.metric(
                "Valid Questions",
                stats.get('valid_questions', 0),
                delta=f"+{stats.get('valid_questions', 0) - stats.get('invalid_questions', 0)}",
                help="Questions that passed validation"
            )
        
        with col3:
            success_rate = stats.get('validation_success_rate', 0)
            st.metric(
                "Success Rate",
                f"{success_rate:.1f}%",
                delta=f"{success_rate - 90:.1f}%" if success_rate < 90 else None,
                delta_color="inverse" if success_rate < 90 else "normal",
                help="Percentage of successfully parsed questions"
            )
        
        with col4:
            st.metric(
                "Question Codes",
                stats.get('valid_question_codes', 0),
                help="Unique question codes found"
            )
    
    @staticmethod
    def _render_question_types(processing_results: Dict[str, Any]):
        """Render question type breakdown."""
        questions = processing_results.get('valid_questions', [])
        
        if not questions:
            return
        
        st.subheader("📝 Question Types")
        
        # Count question types
        type_counts = {}
        for question in questions:
            q_type = question.type
            type_counts[q_type] = type_counts.get(q_type, 0) + 1
        
        # Display as columns
        if type_counts:
            cols = st.columns(len(type_counts))
            
            type_descriptions = {
                'MC': 'Multiple Choice',
                'TF': 'True/False',
                'SA': 'Short Answer',
                'ES': 'Essay'
            }
            
            for i, (q_type, count) in enumerate(type_counts.items()):
                with cols[i]:
                    description = type_descriptions.get(q_type, q_type)
                    st.metric(
                        f"{q_type} - {description}",
                        count,
                        help=f"Number of {description} questions"
                    )
            
            # Create a pie chart
            if len(type_counts) > 1:
                chart_data = pd.DataFrame(
                    list(type_counts.items()),
                    columns=['Question Type', 'Count']
                )
                st.bar_chart(chart_data.set_index('Question Type'))
    
    @staticmethod
    def _render_validation_results(processing_results: Dict[str, Any]):
        """Render validation results."""
        errors = processing_results.get('errors', {})
        
        total_errors = sum(len(error_list) for error_list in errors.values())
        
        if total_errors == 0:
            st.success("✅ All data passed validation!")
            return
        
        st.subheader("⚠️ Validation Issues")
        
        # Error summary
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Question Errors", len(errors.get('question_errors', [])))
        with col2:
            st.metric("Code Errors", len(errors.get('question_code_errors', [])))
        with col3:
            st.metric("Foreign Key Errors", len(errors.get('foreign_key_errors', [])))
        with col4:
            st.metric("Consistency Errors", len(errors.get('consistency_errors', [])))
        
        # Detailed error display
        for error_type, error_list in errors.items():
            if error_list:
                with st.expander(f"{error_type.replace('_', ' ').title()} ({len(error_list)})"):
                    for i, error in enumerate(error_list[:10]):  # Show first 10 errors
                        st.write(f"{i+1}. {error}")
                    
                    if len(error_list) > 10:
                        st.write(f"... and {len(error_list) - 10} more errors")
    
    @staticmethod
    def _render_sample_data(processing_results: Dict[str, Any]):
        """Render sample data preview."""
        questions = processing_results.get('valid_questions', [])
        question_codes = processing_results.get('valid_question_codes', [])
        
        if not questions:
            return
        
        st.subheader("🔍 Sample Data Preview")
        
        # Sample questions
        with st.expander("Sample Questions", expanded=False):
            sample_questions = questions[:3]  # Show first 3 questions
            
            for i, question in enumerate(sample_questions):
                st.write(f"**Question {i+1}:**")
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write(f"Type: {question.type}")
                with col2:
                    st.write(f"Subcount: {question.subcount}")
                with col3:
                    st.write(f"Code: {question.questionCodeId}")
                
                # Content preview
                content_preview = question.content[:200] + "..." if len(question.content) > 200 else question.content
                st.write(f"Content: {content_preview}")
                
                # Answers preview
                if question.answers:
                    st.write(f"Answers: {len(question.answers)} options")
                    if question.correctAnswer:
                        st.write(f"Correct: {question.correctAnswer}")
                
                st.divider()
        
        # Sample question codes
        if question_codes:
            with st.expander("Sample Question Codes", expanded=False):
                sample_codes = question_codes[:5]  # Show first 5 codes
                
                code_data = []
                for code in sample_codes:
                    code_data.append({
                        'Code': code.code,
                        'Format': code.format,
                        'Grade': code.grade,
                        'Subject': code.subject,
                        'Chapter': code.chapter,
                        'Level': code.level
                    })
                
                df = pd.DataFrame(code_data)
                st.dataframe(df, use_container_width=True)
    
    @staticmethod
    def _render_error_summary(processing_results: Dict[str, Any]):
        """Render error summary if there are errors."""
        errors = processing_results.get('errors', {})
        
        # Count total errors
        total_errors = sum(len(error_list) for error_list in errors.values())
        
        if total_errors == 0:
            return
        
        st.subheader("🚨 Error Summary")
        
        # Show error distribution
        error_counts = {
            error_type.replace('_', ' ').title(): len(error_list)
            for error_type, error_list in errors.items()
            if error_list
        }
        
        if error_counts:
            chart_data = pd.DataFrame(
                list(error_counts.items()),
                columns=['Error Type', 'Count']
            )
            st.bar_chart(chart_data.set_index('Error Type'))
        
        # Recommendations
        st.info("""
        **Recommendations:**
        - Review the error.md file for detailed error information
        - Check malformed questions and fix LaTeX syntax
        - Verify question code formats
        - Ensure answer consistency for MC and TF questions
        """)
    
    @staticmethod
    def create_summary_report(processing_results: Dict[str, Any]) -> str:
        """
        Create a text summary report.
        
        Args:
            processing_results: Processing results
            
        Returns:
            Formatted summary report
        """
        stats = processing_results.get('statistics', {})
        errors = processing_results.get('errors', {})
        
        report = f"""
LaTeX Question Parser - Processing Summary
==========================================

Processing Statistics:
- Total Questions Processed: {stats.get('total_questions_input', 0):,}
- Valid Questions: {stats.get('valid_questions', 0):,}
- Invalid Questions: {stats.get('invalid_questions', 0):,}
- Success Rate: {stats.get('validation_success_rate', 0):.1f}%
- Question Codes Found: {stats.get('valid_question_codes', 0):,}

Question Type Breakdown:
"""
        
        # Add question type counts
        questions = processing_results.get('valid_questions', [])
        if questions:
            type_counts = {}
            for question in questions:
                q_type = question.type
                type_counts[q_type] = type_counts.get(q_type, 0) + 1
            
            for q_type, count in type_counts.items():
                report += f"- {q_type}: {count:,}\n"
        
        # Add error summary
        total_errors = sum(len(error_list) for error_list in errors.values())
        if total_errors > 0:
            report += f"\nValidation Issues:\n"
            report += f"- Total Errors: {total_errors:,}\n"
            
            for error_type, error_list in errors.items():
                if error_list:
                    report += f"- {error_type.replace('_', ' ').title()}: {len(error_list):,}\n"
        
        return report.strip()
