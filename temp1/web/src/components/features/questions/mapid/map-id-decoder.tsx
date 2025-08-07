"use client";

import { UnifiedMapIDDecoder } from './unified-map-id-decoder';

/**
 * Legacy MapIDDecoder component - now uses UnifiedMapIDDecoder internally
 * @deprecated Use UnifiedMapIDDecoder instead
 */
export default function MapIDDecoderComponent(): JSX.Element {
  return <UnifiedMapIDDecoder mode="standalone" />;
}
