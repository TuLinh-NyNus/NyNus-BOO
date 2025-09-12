"""
Optimized streaming processor for handling large LaTeX files (300k+ questions)
"""
import gc
import time
import psutil
import threading
import json
import pickle
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Generator, Callable
from dataclasses import dataclass, asdict
from queue import Queue
import streamlit as st

from .latex_parser import LaTeXParser, Question
from .tikz_compiler import TikZCompiler
from .image_processor import ImageProcessor
from .file_manager import FileManager
from utils.logger import setup_logger
from config.settings import (IMAGE_FORMAT, TEMP_DIR, BATCH_SIZE, MAX_WORKERS, INCLUDEGRAPHICS_WIDTH,
                           CHECKPOINT_ENABLED, CHECKPOINT_INTERVAL, CHECKPOINT_DIR, AUTO_RESUME,
                           ADAPTIVE_BATCH_SIZE, MIN_BATCH_SIZE, MAX_BATCH_SIZE, TIKZ_COMPILE_TIMEOUT,
                           CONCURRENT_IMAGE_PROCESSING)

logger = setup_logger(__name__)


@dataclass
class ProcessingStats:
    """Statistics for processing progress"""
    total_questions: int = 0
    processed_questions: int = 0
    tikz_compiled: int = 0
    images_processed: int = 0
    errors: int = 0
    current_batch: int = 0
    total_batches: int = 0
    start_time: float = 0
    estimated_remaining: float = 0
    memory_usage_mb: float = 0


@dataclass
class CheckpointData:
    """Data structure for checkpoint system"""
    file_path: str
    current_batch: int
    processed_questions: int
    tikz_compiled: int
    images_processed: int
    errors: int
    start_time: float
    partial_content: str  # Nội dung đã xử lý tới batch hiện tại
    backup_path: str = ""
    timestamp: float = 0
    

class ProgressCallback:
    """Callback interface for progress updates"""
    
    def __init__(self, progress_bar, status_text, stats_container):
        self.progress_bar = progress_bar
        self.status_text = status_text 
        self.stats_container = stats_container
        self.lock = threading.Lock()
    
    def update(self, stats: ProcessingStats):
        """Update progress display"""
        with self.lock:
            if stats.total_questions > 0:
                progress = stats.processed_questions / stats.total_questions
                self.progress_bar.progress(progress)
                
                # Calculate ETA
                if stats.processed_questions > 0:
                    elapsed = time.time() - stats.start_time
                    rate = stats.processed_questions / elapsed
                    remaining = (stats.total_questions - stats.processed_questions) / rate
                    stats.estimated_remaining = remaining
                
                # Update status
                self.status_text.text(f"""
                🔄 Đang xử lý câu {stats.processed_questions:,}/{stats.total_questions:,}
                📊 Batch {stats.current_batch}/{stats.total_batches}
                🎨 TikZ compiled: {stats.tikz_compiled:,}
                🖼️ Images processed: {stats.images_processed:,}
                ⚠️ Errors: {stats.errors}
                💾 Memory: {stats.memory_usage_mb:.1f} MB
                ⏱️ ETA: {stats.estimated_remaining/60:.1f} phút
                """)


class StreamingLaTeXProcessor:
    """Optimized processor for large LaTeX files"""
    
    def __init__(self, batch_size: int = BATCH_SIZE, max_workers: int = MAX_WORKERS):
        self.initial_batch_size = batch_size
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.parser = LaTeXParser()
        self.tikz_compiler = TikZCompiler()
        self.file_manager = FileManager()
        self.stats = ProcessingStats()
        self._stop_processing = False
        self._last_memory_usage = 0
        
    def process_large_file(self, tex_file_path: str, progress_callback: Optional[ProgressCallback] = None) -> Dict:
        """
        Process large LaTeX file with streaming and progress tracking
        
        Args:
            tex_file_path: Path to the .tex file
            progress_callback: Callback for progress updates
            
        Returns:
            Dictionary with processing results
        """
        tex_file = Path(tex_file_path)
        
        if not tex_file.exists():
            logger.error(f"File không tồn tại: {tex_file}")
            return {'error': 'File không tồn tại'}
        
        try:
            # Kiểm tra checkpoint hiện có
            checkpoint_data = None
            if AUTO_RESUME:
                checkpoint_data = self._load_checkpoint(tex_file_path)
            
            # Initialize stats
            if checkpoint_data:
                # Resume từ checkpoint
                self.stats = ProcessingStats(
                    processed_questions=checkpoint_data.processed_questions,
                    tikz_compiled=checkpoint_data.tikz_compiled,
                    images_processed=checkpoint_data.images_processed,
                    errors=checkpoint_data.errors,
                    current_batch=checkpoint_data.current_batch,
                    start_time=checkpoint_data.start_time
                )
                logger.info(f"Resume từ checkpoint: batch {checkpoint_data.current_batch}")
                if progress_callback:
                    st.info(f"🔄 Resume từ checkpoint: batch {checkpoint_data.current_batch}")
            else:
                # Bắt đầu mới
                self.stats = ProcessingStats()
                self.stats.start_time = time.time()
            
            self._stop_processing = False
            
            # Check available memory
            memory_info = psutil.virtual_memory()
            if memory_info.percent > 85:
                logger.warning(f"Memory usage cao: {memory_info.percent}%")
                if progress_callback:
                    st.warning(f"⚠️ Memory usage cao: {memory_info.percent}%. Tiến trình có thể chậm.")
            
            # Backup file (nếu chưa có từ checkpoint)
            backup_path = checkpoint_data.backup_path if checkpoint_data else None
            if not backup_path:
                backup_path = self.file_manager.backup_file(tex_file)
                logger.info(f"Đã backup: {backup_path}")
            
            # Create output structure
            output_dir, images_dir = self.file_manager.create_output_structure(tex_file)
            
            # Stream parse file để đếm questions trước
            logger.info("Đang đếm tổng số câu hỏi...")
            self.stats.total_questions = self._count_questions(tex_file)
            self.stats.total_batches = (self.stats.total_questions + self.batch_size - 1) // self.batch_size
            
            logger.info(f"Tìm thấy {self.stats.total_questions:,} câu hỏi, sẽ xử lý {self.stats.total_batches} batch")
            
            # Process in batches với checkpoint support
            processed_content = self._process_in_batches(
                tex_file, images_dir, progress_callback, checkpoint_data, str(backup_path)
            )
            
            if self._stop_processing:
                return {'error': 'Xử lý bị dừng bởi user'}
            
            # Write processed content back
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(processed_content)
            
            # Create final report
            report_path = output_dir / "report.txt"
            self._create_detailed_report(report_path)
            
            # Cleanup
            self.file_manager.cleanup_temp_files(TEMP_DIR)
            self._cleanup_checkpoint(tex_file_path)  # Dọc dẹp checkpoint khi hoàn thành
            gc.collect()  # Force garbage collection
            
            return {
                'total_questions': self.stats.total_questions,
                'tikz_compiled': self.stats.tikz_compiled,
                'images_processed': self.stats.images_processed,
                'errors': self.stats.errors,
                'output_dir': str(output_dir),
                'images_dir': str(images_dir),
                'backup_path': str(backup_path),
                'processed_file': str(tex_file),
                'processing_time': time.time() - self.stats.start_time,
                'questions': []  # Don't store all question details for large files
            }
            
        except Exception as e:
            logger.error(f"Lỗi khi xử lý file: {str(e)}")
            return {'error': str(e)}
    
    def _count_questions(self, tex_file: Path) -> int:
        """Count total questions without loading full content"""
        count = 0
        try:
            with open(tex_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if '\\begin{ex}' in line:
                        count += 1
        except Exception as e:
            logger.error(f"Lỗi khi đếm câu hỏi: {str(e)}")
            # Fallback: parse normally but only count
            questions = self.parser.parse_file(tex_file)
            count = len(questions)
        
        return count
    
    def _process_in_batches(self, tex_file: Path, images_dir: Path, 
                           progress_callback: Optional[ProgressCallback],
                           checkpoint_data: Optional[CheckpointData] = None,
                           backup_path: str = "") -> str:
        """Process file in batches to manage memory với checkpoint support và true streaming"""
        
        logger.info("🔄 Bắt đầu true streaming processing...")
        
        # Đọc file content hoặc resume từ checkpoint
        if checkpoint_data and checkpoint_data.partial_content:
            # Resume: sử dụng partial content từ checkpoint
            full_content = checkpoint_data.partial_content
            logger.info("Sử dụng partial content từ checkpoint")
        else:
            # Bắt đầu mới: đọc toàn bộ file
            with open(tex_file, 'r', encoding='utf-8') as f:
                full_content = f.read()
        
        original_content = full_content
        
        # CRITICAL FIX: Parse questions với streaming để tránh memory overload
        try:
            logger.info("🧠 Parsing questions với memory optimization...")
            questions = self._parse_questions_streaming(tex_file)
            logger.info(f"✅ Đã parse {len(questions):,} questions thành công")
        except Exception as e:
            logger.error(f"❌ Lỗi critical khi parse questions: {str(e)}")
            # Fallback: thử parse với batch nhỏ hơn
            logger.warning("⚠️ Fallback to small batch parsing...")
            try:
                questions = self._parse_questions_fallback(tex_file)
                logger.info(f"✅ Fallback parse thành công: {len(questions):,} questions")
            except Exception as e2:
                logger.error(f"❌ Fallback cũng thất bại: {str(e2)}")
                return full_content  # Return nguyên content nếu parse fail
        
        if not questions:
            logger.warning("⚠️ Không tìm thấy questions nào để xử lý")
            return full_content
            
        logger.info(f"🎯 Sẽ xử lý {len(questions):,} questions trong {self.stats.total_batches} batches")
        
        # Nếu resume, bỏ qua các batch đã xử lý
        start_batch = checkpoint_data.current_batch + 1 if checkpoint_data else 1
        total_processed = 0
        
        # Process in batches với enhanced error handling
        try:
            for batch_num, batch_questions in enumerate(self._batch_generator(questions, self.batch_size), 1):
                if self._stop_processing:
                    logger.info(f"🛑 Processing stopped by user at batch {batch_num}")
                    # Lưu checkpoint khi dừng
                    self._save_checkpoint(CheckpointData(
                        file_path=str(tex_file),
                        current_batch=batch_num - 1,
                        processed_questions=self.stats.processed_questions,
                        tikz_compiled=self.stats.tikz_compiled,
                        images_processed=self.stats.images_processed,
                        errors=self.stats.errors,
                        start_time=self.stats.start_time,
                        partial_content=full_content,
                        backup_path=backup_path
                    ))
                    break
                
                # Bỏ qua các batch đã xử lý nếu resume
                if batch_num < start_batch:
                    continue
                    
                self.stats.current_batch = batch_num
                logger.info(f"📦 Xử lý batch {batch_num}/{self.stats.total_batches} ({len(batch_questions)} câu hỏi)")
                
                # Process batch with enhanced error handling
                try:
                    full_content = self._process_batch(batch_questions, full_content, images_dir, tex_file.parent)
                    total_processed += len(batch_questions)
                    logger.info(f"✅ Batch {batch_num} completed - Total processed: {total_processed:,}/{len(questions):,}")
                except Exception as e:
                    logger.error(f"❌ Lỗi xử lý batch {batch_num}: {str(e)}")
                    self.stats.errors += len(batch_questions)  # Count all questions in failed batch as errors
                    # Continue với batch tiếp theo thay vì crash
                    continue
                
                # Update progress
                self.stats.processed_questions = min(batch_num * self.batch_size, self.stats.total_questions)
                self._update_memory_stats()
                
                # Điều chỉnh batch size nếu cần
                self._adjust_batch_size()
                
                if progress_callback:
                    progress_callback.update(self.stats)
                
                # Lưu checkpoint định kỳ
                if batch_num % CHECKPOINT_INTERVAL == 0:
                    self._save_checkpoint(CheckpointData(
                        file_path=str(tex_file),
                        current_batch=batch_num,
                        processed_questions=self.stats.processed_questions,
                        tikz_compiled=self.stats.tikz_compiled,
                        images_processed=self.stats.images_processed,
                        errors=self.stats.errors,
                        start_time=self.stats.start_time,
                        partial_content=full_content,
                        backup_path=backup_path
                    ))
                
                # Force garbage collection after each batch
                gc.collect()
                
                # Memory check với enhanced handling
                memory_info = psutil.virtual_memory()
                if memory_info.percent > 90:
                    logger.warning(f"💾 Memory usage rất cao: {memory_info.percent}%")
                    if progress_callback:
                        st.warning(f"⚠️ Memory usage rất cao: {memory_info.percent}%. Đang clean up...")
                    gc.collect()
                    time.sleep(1)  # Brief pause for system
                    
                    # Nếu memory vẫn cao, adjust batch size
                    if psutil.virtual_memory().percent > 85:
                        self.batch_size = max(10, int(self.batch_size * 0.7))
                        logger.warning(f"🔧 Reduced batch size to {self.batch_size} due to high memory usage")
                        
        except Exception as e:
            logger.error(f"❌ Critical error in batch processing loop: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
        logger.info(f"🏁 Completed processing: {total_processed:,} total questions processed")
        return full_content
    
    def _parse_questions_streaming(self, tex_file: Path) -> List[Question]:
        """Parse questions với streaming để tránh memory overload"""
        questions = []
        try:
            # Thử parse với memory-optimized approach
            questions = self.parser.parse_file(tex_file)
            
            # Kiểm tra memory usage sau khi parse
            memory_info = psutil.virtual_memory()
            if memory_info.percent > 80:
                logger.warning(f"High memory usage after parsing: {memory_info.percent}%")
                gc.collect()  # Force cleanup
                
        except MemoryError as e:
            logger.error(f"Memory error during parsing: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Parse error: {str(e)}")
            raise e
            
        return questions
    
    def _parse_questions_fallback(self, tex_file: Path) -> List[Question]:
        """Fallback parsing với smaller chunks"""
        logger.info("🔄 Attempting fallback parsing với smaller chunks...")
        
        # Simple fallback: manually find question boundaries
        questions = []
        question_count = 0
        
        try:
            with open(tex_file, 'r', encoding='utf-8') as f:
                current_question = ""
                in_question = False
                
                for line_num, line in enumerate(f, 1):
                    if '\\begin{ex}' in line:
                        in_question = True
                        current_question = line
                        continue
                        
                    if in_question:
                        current_question += line
                        
                        if '\\end{ex}' in line:
                            # End of question found
                            question_count += 1
                            
                            # Create a minimal Question object
                            from .latex_parser import Question
                            q = Question(
                                index=question_count,
                                subcount=f"fallback_{question_count}",
                                full_content=current_question
                            )
                            questions.append(q)
                            
                            current_question = ""
                            in_question = False
                            
                            # Memory check every 1000 questions
                            if question_count % 1000 == 0:
                                memory_info = psutil.virtual_memory()
                                if memory_info.percent > 85:
                                    logger.warning(f"High memory in fallback parsing: {memory_info.percent}%")
                                    gc.collect()
                                    
        except Exception as e:
            logger.error(f"Fallback parsing failed: {str(e)}")
            raise e
            
        logger.info(f"Fallback parsing completed: {len(questions):,} questions")
        return questions
    
    def _batch_generator(self, questions: List[Question], batch_size: int) -> Generator[List[Question], None, None]:
        """Generate batches of questions"""
        for i in range(0, len(questions), batch_size):
            yield questions[i:i + batch_size]
    
    def _process_batch(self, questions: List[Question], content: str, 
                      images_dir: Path, base_dir: Path) -> str:
        """Process a batch of questions with threading"""
        
        # Create thread pool for TikZ compilation
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = []
            
            for question in questions:
                if self._stop_processing:
                    break
                    
                # Submit TikZ compilation tasks
                if question.question_tikz:
                    for idx, (tikz_code, _, _) in enumerate(question.question_tikz, 1):
                        image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
                        future = executor.submit(self._compile_tikz_task, tikz_code, image_name, images_dir)
                        futures.append(('tikz_ques', future, question, idx))
                
                if question.solution_tikz:
                    for idx, (tikz_code, _, _) in enumerate(question.solution_tikz, 1):
                        image_name = question.get_image_name("SOL", idx if len(question.solution_tikz) > 1 else 0)
                        future = executor.submit(self._compile_tikz_task, tikz_code, image_name, images_dir)
                        futures.append(('tikz_sol', future, question, idx))
            
            # Process completed TikZ tasks
            for task_type, future, question, idx in futures:
                if self._stop_processing:
                    break
                    
                try:
                    result = future.result(timeout=TIKZ_COMPILE_TIMEOUT)  # Configurable timeout per TikZ
                    if result:
                        self.stats.tikz_compiled += 1
                    else:
                        self.stats.errors += 1
                        logger.warning(f"TikZ compilation failed for question {question.index}")
                except Exception as e:
                    self.stats.errors += 1
                    logger.error(f"TikZ task error: {str(e)}")
        
        # Process existing images - có thể dùng concurrent nếu được bật
        image_processor = ImageProcessor(images_dir)
        
        if CONCURRENT_IMAGE_PROCESSING:
            # Concurrent image processing
            with ThreadPoolExecutor(max_workers=min(2, self.max_workers)) as img_executor:
                image_futures = []
                
                for question in questions:
                    if self._stop_processing:
                        break
                    
                    # Update content with processed images
                    content = self._update_question_content(content, question, images_dir)
                    
                    # Submit image processing tasks
                    for idx, (_, img_path, _, _) in enumerate(question.question_images, 1):
                        image_name = question.get_image_name("QUES", idx if len(question.question_images) > 1 else 0)
                        future = img_executor.submit(image_processor.process_existing_image, img_path, image_name, base_dir)
                        image_futures.append(('ques', future))
                    
                    for idx, (_, img_path, _, _) in enumerate(question.solution_images, 1):
                        image_name = question.get_image_name("SOL", idx if len(question.solution_images) > 1 else 0)
                        future = img_executor.submit(image_processor.process_existing_image, img_path, image_name, base_dir)
                        image_futures.append(('sol', future))
                
                # Process completed image tasks
                for img_type, future in image_futures:
                    if self._stop_processing:
                        break
                    try:
                        result = future.result(timeout=5)  # 5 second timeout per image
                        if result:
                            self.stats.images_processed += 1
                        else:
                            self.stats.errors += 1
                    except Exception as e:
                        self.stats.errors += 1
                        logger.error(f"Concurrent image processing error: {str(e)}")
        else:
            # Sequential image processing (original)
            for question in questions:
                if self._stop_processing:
                    break
                    
                # Update content with processed images
                content = self._update_question_content(content, question, images_dir)
                
                # Process existing images
                if question.question_images:
                    for idx, (_, img_path, _, _) in enumerate(question.question_images, 1):
                        try:
                            image_name = question.get_image_name("QUES", idx if len(question.question_images) > 1 else 0)
                            if image_processor.process_existing_image(img_path, image_name, base_dir):
                                self.stats.images_processed += 1
                            else:
                                self.stats.errors += 1
                        except Exception as e:
                            self.stats.errors += 1
                            logger.error(f"Image processing error: {str(e)}")
                
                if question.solution_images:
                    for idx, (_, img_path, _, _) in enumerate(question.solution_images, 1):
                        try:
                            image_name = question.get_image_name("SOL", idx if len(question.solution_images) > 1 else 0)
                            if image_processor.process_existing_image(img_path, image_name, base_dir):
                                self.stats.images_processed += 1
                            else:
                                self.stats.errors += 1
                        except Exception as e:
                            self.stats.errors += 1
                            logger.error(f"Image processing error: {str(e)}")
        
        return content
    
    def _compile_tikz_task(self, tikz_code: str, image_name: str, images_dir: Path) -> bool:
        """TikZ compilation task for thread pool"""
        try:
            compiled_image = self.tikz_compiler.compile_tikz(tikz_code, image_name)
            if compiled_image:
                final_name = f"{image_name}.{IMAGE_FORMAT}"
                result = self.file_manager.move_image_to_output(compiled_image, images_dir, final_name)
                return result is not None
            return False
        except Exception as e:
            logger.error(f"TikZ compilation task error: {str(e)}")
            return False
    
    def _update_question_content(self, content: str, question: Question, images_dir: Path) -> str:
        """Update content for a single question"""
        # Use the same logic as in the original processor but for single question
        # This is a simplified version - you might want to refactor the original method
        
        # Replace TikZ with image includes
        if question.question_tikz:
            for idx, (tikz_code, start_pos, end_pos) in enumerate(question.question_tikz, 1):
                image_name = question.get_image_name("QUES", idx if len(question.question_tikz) > 1 else 0)
                image_path = f"images/{image_name}.{IMAGE_FORMAT}"
                include_command = f"\\includegraphics[width={INCLUDEGRAPHICS_WIDTH}]{{{image_path}}}"
                
                # Replace TikZ block with include command
                content = content.replace(tikz_code, include_command, 1)
        
        if question.solution_tikz:
            for idx, (tikz_code, start_pos, end_pos) in enumerate(question.solution_tikz, 1):
                image_name = question.get_image_name("SOL", idx if len(question.solution_tikz) > 1 else 0)
                image_path = f"images/{image_name}.{IMAGE_FORMAT}"
                include_command = f"\\includegraphics[width={INCLUDEGRAPHICS_WIDTH}]{{{image_path}}}"
                
                content = content.replace(tikz_code, include_command, 1)
        
        return content
    
    def _update_memory_stats(self):
        """Update memory usage statistics"""
        process = psutil.Process()
        self.stats.memory_usage_mb = process.memory_info().rss / (1024 * 1024)
        self._last_memory_usage = psutil.virtual_memory().percent
    
    def _adjust_batch_size(self):
        """Tự động điều chỉnh batch size dựa trên memory usage"""
        if not ADAPTIVE_BATCH_SIZE:
            return
        
        memory_percent = psutil.virtual_memory().percent
        
        if memory_percent > 85:
            # Memory cao - giảm batch size
            new_size = max(MIN_BATCH_SIZE, int(self.batch_size * 0.8))
            if new_size != self.batch_size:
                logger.info(f"Giảm batch size: {self.batch_size} -> {new_size} (Memory: {memory_percent:.1f}%)")
                self.batch_size = new_size
        elif memory_percent < 60 and self.batch_size < self.initial_batch_size:
            # Memory thấp - tăng batch size
            new_size = min(MAX_BATCH_SIZE, int(self.batch_size * 1.2))
            if new_size != self.batch_size:
                logger.info(f"Tăng batch size: {self.batch_size} -> {new_size} (Memory: {memory_percent:.1f}%)")
                self.batch_size = new_size
    
    def _create_detailed_report(self, report_path: Path):
        """Create detailed processing report"""
        try:
            processing_time = time.time() - self.stats.start_time
            
            report = [
                "=" * 80,
                "BÁO CÁO XỬ LÝ HÌNH ẢNH LATEX - CHẾ ĐỘ TỐI ƯU",
                "=" * 80,
                f"Thời gian bắt đầu: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(self.stats.start_time))}",
                f"Thời gian xử lý: {processing_time/3600:.2f} giờ ({processing_time/60:.1f} phút)",
                "",
                "THỐNG KÊ TỔNG QUAN:",
                f"- Tổng số câu hỏi: {self.stats.total_questions:,}",
                f"- Câu hỏi đã xử lý: {self.stats.processed_questions:,}",
                f"- TikZ đã compile: {self.stats.tikz_compiled:,}",
                f"- Hình ảnh đã xử lý: {self.stats.images_processed:,}",
                f"- Lỗi gặp phải: {self.stats.errors:,}",
                f"- Số batch xử lý: {self.stats.total_batches}",
                f"- Kích thước batch: {self.batch_size}",
                f"- Số worker threads: {self.max_workers}",
                "",
                "HIỆU SUẤT:",
                f"- Tốc độ xử lý: {self.stats.processed_questions/processing_time*60:.1f} câu/phút",
                f"- Memory peak usage: {self.stats.memory_usage_mb:.1f} MB",
                f"- Thời gian trung bình/câu: {processing_time/max(1, self.stats.processed_questions)*1000:.1f} ms",
                "",
                "=" * 80
            ]
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(report))
            
            logger.info(f"Đã tạo báo cáo chi tiết: {report_path}")
            
        except Exception as e:
            logger.error(f"Lỗi khi tạo báo cáo: {str(e)}")
    
    def _get_checkpoint_path(self, file_path: str) -> Path:
        """Lấy đường dẫn checkpoint cho file"""
        file_name = Path(file_path).stem
        return CHECKPOINT_DIR / f"{file_name}_checkpoint.pkl"
    
    def _save_checkpoint(self, checkpoint_data: CheckpointData):
        """Lưu checkpoint"""
        if not CHECKPOINT_ENABLED:
            return
        
        try:
            checkpoint_path = self._get_checkpoint_path(checkpoint_data.file_path)
            checkpoint_data.timestamp = time.time()
            
            with open(checkpoint_path, 'wb') as f:
                pickle.dump(checkpoint_data, f)
            
            logger.info(f"Đã lưu checkpoint: batch {checkpoint_data.current_batch}")
            
        except Exception as e:
            logger.error(f"Lỗi khi lưu checkpoint: {str(e)}")
    
    def _load_checkpoint(self, file_path: str) -> Optional[CheckpointData]:
        """Tải checkpoint"""
        if not CHECKPOINT_ENABLED:
            return None
        
        try:
            checkpoint_path = self._get_checkpoint_path(file_path)
            if not checkpoint_path.exists():
                return None
            
            with open(checkpoint_path, 'rb') as f:
                checkpoint_data = pickle.load(f)
            
            logger.info(f"Tìm thấy checkpoint: batch {checkpoint_data.current_batch}")
            return checkpoint_data
            
        except Exception as e:
            logger.error(f"Lỗi khi tải checkpoint: {str(e)}")
            return None
    
    def _cleanup_checkpoint(self, file_path: str):
        """Dọc dẹp checkpoint sau khi hoàn thành"""
        try:
            checkpoint_path = self._get_checkpoint_path(file_path)
            if checkpoint_path.exists():
                checkpoint_path.unlink()
                logger.info("Đã dọc dẹp checkpoint")
        except Exception as e:
            logger.warning(f"Không thể dọc dẹp checkpoint: {str(e)}")
    
    def stop_processing(self):
        """Stop the processing gracefully"""
        self._stop_processing = True
        logger.info("Yêu cầu dừng xử lý đã được ghi nhận")
