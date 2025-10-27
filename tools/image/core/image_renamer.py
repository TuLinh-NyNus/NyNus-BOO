"""
Image Renaming Tool - Công cụ đổi tên hình ảnh hàng loạt
Hỗ trợ rename theo pattern và preview trước khi thực hiện
"""
import os
import shutil
import logging
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import re

logger = logging.getLogger(__name__)


class ImageRenamer:
    """Tool để rename hình ảnh theo pattern"""
    
    def __init__(self):
        self.rename_history = []  # Lưu lịch sử rename để undo
        
    def scan_images(self, folder_path: str, extensions: List[str] = None) -> List[Dict]:
        """
        Scan folder để tìm tất cả hình ảnh
        
        Args:
            folder_path: Đường dẫn folder chứa hình
            extensions: List các extension cần scan (default: common image formats)
            
        Returns:
            List các dict chứa thông tin hình ảnh
        """
        if extensions is None:
            extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff']
        
        folder = Path(folder_path)
        if not folder.exists():
            logger.error(f"Folder không tồn tại: {folder_path}")
            return []
        
        images = []
        for file_path in folder.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in extensions:
                images.append({
                    'original_path': str(file_path),
                    'original_name': file_path.name,
                    'extension': file_path.suffix,
                    'size': file_path.stat().st_size,
                    'modified_time': file_path.stat().st_mtime
                })
        
        logger.info(f"Tìm thấy {len(images)} hình ảnh trong {folder_path}")
        return sorted(images, key=lambda x: x['original_name'])
    
    def generate_new_names(self, images: List[Dict], pattern: str, 
                          start_number: int = 1, 
                          subcount_pattern: str = None) -> List[Dict]:
        """
        Generate tên mới cho hình ảnh theo pattern
        
        Args:
            images: List hình ảnh từ scan_images()
            pattern: Pattern đặt tên (e.g., "XXN-QUES", "image_{n}")
            start_number: Số bắt đầu
            subcount_pattern: Pattern cho subcount (e.g., "12.{n}")
            
        Returns:
            List dict với thêm field 'new_name'
        """
        results = []
        
        for idx, img in enumerate(images):
            current_number = start_number + idx
            
            # Replace placeholders in pattern
            new_name = pattern
            
            # {n} - số thứ tự
            new_name = new_name.replace('{n}', str(current_number))
            
            # {nn} - số thứ tự với leading zero (2 digits)
            new_name = new_name.replace('{nn}', f"{current_number:02d}")
            
            # {nnn} - số thứ tự với leading zero (3 digits)
            new_name = new_name.replace('{nnn}', f"{current_number:03d}")
            
            # Subcount pattern (e.g., 12.1, 12.2, ...)
            if subcount_pattern:
                subcount = subcount_pattern.replace('{n}', str(current_number))
                new_name = new_name.replace('{subcount}', subcount)
            
            # Add extension if not present
            if not new_name.endswith(img['extension']):
                new_name += img['extension']
            
            result = img.copy()
            result['new_name'] = new_name
            result['number'] = current_number
            results.append(result)
        
        return results
    
    def preview_rename(self, images_with_new_names: List[Dict]) -> List[Tuple[str, str]]:
        """
        Preview rename operation
        
        Args:
            images_with_new_names: List từ generate_new_names()
            
        Returns:
            List of tuples (old_name, new_name)
        """
        return [(img['original_name'], img['new_name']) 
                for img in images_with_new_names]
    
    def validate_rename(self, images_with_new_names: List[Dict]) -> Dict:
        """
        Validate rename operation để phát hiện conflicts
        
        Args:
            images_with_new_names: List từ generate_new_names()
            
        Returns:
            Dict với validation results
        """
        validation = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'duplicates': []
        }
        
        # Check for duplicate new names
        new_names = [img['new_name'] for img in images_with_new_names]
        seen = set()
        duplicates = set()
        
        for name in new_names:
            if name in seen:
                duplicates.add(name)
            seen.add(name)
        
        if duplicates:
            validation['valid'] = False
            validation['duplicates'] = list(duplicates)
            validation['errors'].append(f"Phát hiện {len(duplicates)} tên trùng lặp")
        
        # Check for invalid characters in filenames
        invalid_chars = r'[<>:"/\\|?*]'
        for img in images_with_new_names:
            if re.search(invalid_chars, img['new_name']):
                validation['valid'] = False
                validation['errors'].append(
                    f"Tên file không hợp lệ: {img['new_name']} (chứa ký tự đặc biệt)"
                )
        
        # Check if new names already exist in folder
        folder = Path(images_with_new_names[0]['original_path']).parent
        existing_files = {f.name for f in folder.iterdir() if f.is_file()}
        
        conflicts = []
        for img in images_with_new_names:
            if img['new_name'] in existing_files and img['new_name'] != img['original_name']:
                conflicts.append(img['new_name'])
        
        if conflicts:
            validation['warnings'].append(
                f"Cảnh báo: {len(conflicts)} file đã tồn tại và sẽ bị ghi đè"
            )
        
        return validation
    
    def execute_rename(self, images_with_new_names: List[Dict], 
                      backup: bool = True) -> Dict:
        """
        Thực hiện rename operation
        
        Args:
            images_with_new_names: List từ generate_new_names()
            backup: Có tạo backup trước khi rename không
            
        Returns:
            Dict với kết quả rename
        """
        results = {
            'success': 0,
            'failed': 0,
            'errors': [],
            'renamed_files': []
        }
        
        # Validate trước khi rename
        validation = self.validate_rename(images_with_new_names)
        if not validation['valid']:
            results['errors'] = validation['errors']
            return results
        
        # Create backup if requested
        if backup:
            backup_folder = Path(images_with_new_names[0]['original_path']).parent / 'backup_before_rename'
            backup_folder.mkdir(exist_ok=True)
        
        # Execute rename
        rename_operations = []
        
        for img in images_with_new_names:
            try:
                old_path = Path(img['original_path'])
                new_path = old_path.parent / img['new_name']
                
                # Backup if requested
                if backup:
                    backup_path = backup_folder / old_path.name
                    shutil.copy2(old_path, backup_path)
                
                # Rename
                old_path.rename(new_path)
                
                # Record operation for undo
                rename_operations.append({
                    'old_path': str(old_path),
                    'new_path': str(new_path),
                    'backup_path': str(backup_path) if backup else None
                })
                
                results['success'] += 1
                results['renamed_files'].append({
                    'old_name': img['original_name'],
                    'new_name': img['new_name']
                })
                
                logger.info(f"Renamed: {img['original_name']} → {img['new_name']}")
                
            except Exception as e:
                results['failed'] += 1
                error_msg = f"Lỗi khi rename {img['original_name']}: {str(e)}"
                results['errors'].append(error_msg)
                logger.error(error_msg)
        
        # Save rename history for undo
        if rename_operations:
            self.rename_history.append({
                'timestamp': os.path.getmtime(rename_operations[0]['new_path']),
                'operations': rename_operations,
                'backup_folder': str(backup_folder) if backup else None
            })
        
        return results
    
    def undo_last_rename(self) -> Dict:
        """
        Undo last rename operation
        
        Returns:
            Dict với kết quả undo
        """
        if not self.rename_history:
            return {
                'success': False,
                'message': 'Không có operation nào để undo'
            }
        
        last_operation = self.rename_history.pop()
        results = {
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        for op in last_operation['operations']:
            try:
                new_path = Path(op['new_path'])
                old_path = Path(op['old_path'])
                
                if new_path.exists():
                    new_path.rename(old_path)
                    results['success'] += 1
                    logger.info(f"Undo: {new_path.name} → {old_path.name}")
                else:
                    results['failed'] += 1
                    results['errors'].append(f"File không tồn tại: {new_path}")
                    
            except Exception as e:
                results['failed'] += 1
                error_msg = f"Lỗi khi undo {op['new_path']}: {str(e)}"
                results['errors'].append(error_msg)
                logger.error(error_msg)
        
        return results

