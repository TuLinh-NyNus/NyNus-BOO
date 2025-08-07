import { 
  getBadgeVariantByLevel, 
  getLevelLabel,
  getQuestionTypeColor,
  getQuestionTypeLabel 
} from '../question-helpers';

describe('Question Helpers', () => {
  describe('getBadgeVariantByLevel', () => {
    it('should return correct variant for EASY level', () => {
      expect(getBadgeVariantByLevel('EASY')).toBe('default');
      expect(getBadgeVariantByLevel('E')).toBe('default');
    });

    it('should return correct variant for MEDIUM level', () => {
      expect(getBadgeVariantByLevel('MEDIUM')).toBe('secondary');
      expect(getBadgeVariantByLevel('M')).toBe('secondary');
    });

    it('should return correct variant for HARD level', () => {
      expect(getBadgeVariantByLevel('HARD')).toBe('destructive');
      expect(getBadgeVariantByLevel('H')).toBe('destructive');
    });

    it('should return outline for unknown level', () => {
      expect(getBadgeVariantByLevel('UNKNOWN')).toBe('outline');
      expect(getBadgeVariantByLevel('')).toBe('outline');
    });

    it('should handle case insensitive input', () => {
      expect(getBadgeVariantByLevel('easy')).toBe('default');
      expect(getBadgeVariantByLevel('medium')).toBe('secondary');
      expect(getBadgeVariantByLevel('hard')).toBe('destructive');
    });

    it('should handle null/undefined input', () => {
      expect(getBadgeVariantByLevel(null as any)).toBe('outline');
      expect(getBadgeVariantByLevel(undefined as any)).toBe('outline');
    });
  });

  describe('getLevelLabel', () => {
    it('should return Vietnamese labels correctly', () => {
      expect(getLevelLabel('EASY')).toBe('Dễ');
      expect(getLevelLabel('MEDIUM')).toBe('Trung bình');
      expect(getLevelLabel('HARD')).toBe('Khó');
    });

    it('should handle short forms', () => {
      expect(getLevelLabel('E')).toBe('Dễ');
      expect(getLevelLabel('M')).toBe('Trung bình');
      expect(getLevelLabel('H')).toBe('Khó');
    });

    it('should handle case insensitive input', () => {
      expect(getLevelLabel('easy')).toBe('Dễ');
      expect(getLevelLabel('medium')).toBe('Trung bình');
      expect(getLevelLabel('hard')).toBe('Khó');
    });

    it('should return default message for unknown level', () => {
      expect(getLevelLabel('UNKNOWN')).toBe('UNKNOWN');
      expect(getLevelLabel('')).toBe('Không xác định');
    });

    it('should handle null/undefined input', () => {
      expect(getLevelLabel(null as any)).toBe('Không xác định');
      expect(getLevelLabel(undefined as any)).toBe('Không xác định');
    });
  });

  describe('getQuestionTypeColor', () => {
    it('should return correct colors for question types', () => {
      expect(getQuestionTypeColor('MC')).toBe('bg-blue-500 hover:bg-blue-600');
      expect(getQuestionTypeColor('TF')).toBe('bg-green-500 hover:bg-green-600');
      expect(getQuestionTypeColor('SA')).toBe('bg-yellow-500 hover:bg-yellow-600');
      expect(getQuestionTypeColor('ES')).toBe('bg-purple-500 hover:bg-purple-600');
      expect(getQuestionTypeColor('MA')).toBe('bg-red-500 hover:bg-red-600');
    });

    it('should handle case insensitive input', () => {
      expect(getQuestionTypeColor('mc')).toBe('bg-blue-500 hover:bg-blue-600');
      expect(getQuestionTypeColor('tf')).toBe('bg-green-500 hover:bg-green-600');
    });

    it('should return default color for unknown type', () => {
      expect(getQuestionTypeColor('UNKNOWN')).toBe('bg-gray-500 hover:bg-gray-600');
      expect(getQuestionTypeColor('')).toBe('bg-gray-500 hover:bg-gray-600');
    });

    it('should handle null/undefined input', () => {
      expect(getQuestionTypeColor(null as any)).toBe('bg-gray-500 hover:bg-gray-600');
      expect(getQuestionTypeColor(undefined as any)).toBe('bg-gray-500 hover:bg-gray-600');
    });
  });

  describe('getQuestionTypeLabel', () => {
    it('should return Vietnamese labels for question types', () => {
      expect(getQuestionTypeLabel('MC')).toBe('Trắc nghiệm');
      expect(getQuestionTypeLabel('TF')).toBe('Đúng/Sai');
      expect(getQuestionTypeLabel('SA')).toBe('Trả lời ngắn');
      expect(getQuestionTypeLabel('ES')).toBe('Tự luận');
      expect(getQuestionTypeLabel('MA')).toBe('Nhiều đáp án');
    });

    it('should handle case insensitive input', () => {
      expect(getQuestionTypeLabel('mc')).toBe('Trắc nghiệm');
      expect(getQuestionTypeLabel('tf')).toBe('Đúng/Sai');
    });

    it('should return default message for unknown type', () => {
      expect(getQuestionTypeLabel('UNKNOWN')).toBe('UNKNOWN');
      expect(getQuestionTypeLabel('')).toBe('Không xác định');
    });

    it('should handle null/undefined input', () => {
      expect(getQuestionTypeLabel(null as any)).toBe('Không xác định');
      expect(getQuestionTypeLabel(undefined as any)).toBe('Không xác định');
    });
  });
});
