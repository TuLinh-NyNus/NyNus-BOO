"""
Module xử lý hình ảnh có sẵn (copy và rename)
"""
import shutil
import logging
from pathlib import Path
from typing import Optional, List
from PIL import Image
from config import IMAGE_FORMAT, IMAGE_QUALITY

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Xử lý hình ảnh có sẵn"""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(exist_ok=True)
        
    def process_existing_image(self, 
                             source_path: str, 
                             output_name: str,
                             base_dir: Path = None) -> Optional[Path]:
        """
        Copy và rename hình ảnh có sẵn
        
        Args:
            source_path: Đường dẫn gốc của hình
            output_name: Tên file output (không có extension)
            base_dir: Thư mục gốc để resolve relative path
            
        Returns:
            Path đến file hình ảnh mới hoặc None nếu lỗi
        """
        try:
            # Resolve đường dẫn
            if base_dir:
                source_file = base_dir / source_path
            else:
                source_file = Path(source_path)
            
            # Kiểm tra file tồn tại
            if not source_file.exists():
                logger.warning(f"File không tồn tại: {source_file}")
                return None
            
            # Đường dẫn output
            output_file = self.output_dir / f"{output_name}.{IMAGE_FORMAT}"
            
            # Convert format nếu cần
            if self._needs_conversion(source_file):
                return self._convert_image(source_file, output_file)
            else:
                # Copy trực tiếp
                shutil.copy2(source_file, output_file)
                logger.info(f"Đã copy: {source_file.name} -> {output_file.name}")
                return output_file
                
        except Exception as e:
            logger.error(f"Lỗi khi xử lý hình {source_path}: {str(e)}")
            return None
    
    def _needs_conversion(self, source_file: Path) -> bool:
        """Kiểm tra xem có cần convert format không"""
        source_ext = source_file.suffix.lower().lstrip('.')
        return source_ext != IMAGE_FORMAT.lower()
    
    def _convert_image(self, source_file: Path, output_file: Path) -> Optional[Path]:
        """Convert hình sang format mong muốn"""
        try:
            # Mở hình với Pillow
            image = Image.open(source_file)
            
            # Convert mode nếu cần
            if IMAGE_FORMAT in ['jpg', 'jpeg'] and image.mode in ('RGBA', 'LA', 'P'):
                # Convert to RGB cho JPEG
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
                image = background
            
            # Lưu với format mới
            save_kwargs = {}
            if IMAGE_FORMAT == 'webp':
                save_kwargs = {'quality': IMAGE_QUALITY, 'lossless': False}
            elif IMAGE_FORMAT in ['jpg', 'jpeg']:
                save_kwargs = {'quality': IMAGE_QUALITY, 'optimize': True}
            elif IMAGE_FORMAT == 'png':
                save_kwargs = {'optimize': True}
            
            image.save(output_file, IMAGE_FORMAT.upper(), **save_kwargs)
            logger.info(f"Đã convert: {source_file.name} -> {output_file.name}")
            return output_file
            
        except Exception as e:
            logger.error(f"Lỗi khi convert hình: {str(e)}")
            return None
    
    def batch_process(self, 
                     image_paths: List[tuple], 
                     base_name: str,
                     base_dir: Path = None) -> List[Path]:
        """
        Xử lý nhiều hình cùng lúc
        
        Args:
            image_paths: List các tuple (source_path, image_type)
            base_name: Tên cơ bản cho output
            base_dir: Thư mục gốc
            
        Returns:
            List các Path đến file đã xử lý
        """
        results = []
        
        for idx, (source_path, img_type) in enumerate(image_paths, 1):
            if len(image_paths) > 1:
                output_name = f"{base_name}-{img_type}-{idx}"
            else:
                output_name = f"{base_name}-{img_type}"
            
            output_path = self.process_existing_image(source_path, output_name, base_dir)
            results.append(output_path)
        
        return results
