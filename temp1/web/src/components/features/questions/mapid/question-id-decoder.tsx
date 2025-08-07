import React from 'react';

import { QuestionID } from '@/lib/types/question';

import { UnifiedMapIDDecoder } from './unified-map-id-decoder';

interface QuestionIDDecoderProps {
  questionID: QuestionID;
}

/**
 * Legacy QuestionIDDecoder component - now uses UnifiedMapIDDecoder internally
 * @deprecated Use UnifiedMapIDDecoder with mode="embedded" instead
 */
export function QuestionIDDecoder({ questionID }: QuestionIDDecoderProps): JSX.Element {
  return <UnifiedMapIDDecoder mode="embedded" questionID={questionID} />;
}
