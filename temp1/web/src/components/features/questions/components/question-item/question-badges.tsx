import { memo } from 'react';

import { Badge } from "@/components/ui/display/badge";
import { getBadgeVariantByLevel, getLevelLabel } from '@/lib/utils/question-helpers';

interface QuestionBadgesProps {
  question: {
    questionID?: {
      subject?: {
        value?: string;
        description?: string;
      };
      grade?: {
        value?: string;
        description?: string;
      };
      level?: {
        value?: string;
        description?: string;
      };
    };
    subject?: string;
    grade?: string;
  };
  className?: string;
}

/**
 * Component hiển thị các badges cho câu hỏi (subject, grade, level)
 * Extracted từ QuestionItem để improve maintainability
 */
export const QuestionBadges = memo(function QuestionBadges({ 
  question, 
  className = "flex flex-wrap gap-2 mb-1" 
}: QuestionBadgesProps) {
  return (
    <div className={className}>
      {/* Subject Badge */}
      {question.questionID?.subject?.value && (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          {question.subject || 
           question.questionID.subject.description || 
           question.questionID.subject.value}
        </Badge>
      )}
      
      {/* Grade Badge */}
      {question.questionID?.grade?.value && (
        <Badge variant="outline">
          Lớp {question.grade || 
                question.questionID.grade.description || 
                question.questionID.grade.value}
        </Badge>
      )}
      
      {/* Level Badge */}
      {question.questionID?.level?.value && (
        <Badge variant={getBadgeVariantByLevel(question.questionID.level.value)}>
          {getLevelLabel(question.questionID.level.value)}
        </Badge>
      )}
    </div>
  );
});

QuestionBadges.displayName = 'QuestionBadges';
