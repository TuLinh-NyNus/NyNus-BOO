/**
 * MapCode System Demo Page
 * Showcase tất cả MapCode components và functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Separator } from '@/components/ui/display/separator';
import { 
  MapCodeBadge, 
  CompactMapCodeBadge, 
  FullMapCodeBadge, 
  InteractiveMapCodeBadge 
} from '@/components/ui/display/mapcode-badge';
import { MapCodeDisplay } from '@/components/ui/display/mapcode-display';
import { 
  MapCodeTooltip, 
  SimpleMapCodeTooltip, 
  HelpMapCodeTooltip 
} from '@/components/ui/display/mapcode-tooltip';
import { MapCodeTranslationService } from '@/lib/utils/question-code';
import { Code, Palette, Info, HelpCircle, CheckCircle } from 'lucide-react';

// ===== SAMPLE DATA =====

const SAMPLE_CODES = [
  '0P1N1',      // Valid ID5
  '0P1N1-2',    // Valid ID6
  '1L2H3',      // Valid ID5
  '2H3V4-1',    // Valid ID6
  'INVALID',    // Invalid code
  '0X1N1',      // Invalid subject
];

// ===== MAIN COMPONENT =====

export default function MapCodeDemoPage() {
  const [testCode, setTestCode] = useState('0P1N1');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Handle copy success
  const handleCopySuccess = (code: string) => {
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">MapCode System Demo</h1>
        <p className="text-gray-600">
          Showcase tất cả MapCode components và functionality trong NyNus system
        </p>
      </div>

      {/* Interactive Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Interactive Test
          </CardTitle>
          <CardDescription>
            Nhập MapCode để test các components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập MapCode (VD: 0P1N1, 0P1N1-2)"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="font-mono"
            />
            <Button 
              variant="outline"
              onClick={() => setTestCode('0P1N1')}
            >
              Reset
            </Button>
          </div>
          
          {copySuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Đã copy: {copySuccess}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MapCode Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            MapCode Badges
          </CardTitle>
          <CardDescription>
            Các variant của MapCode Badge component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Size Variants */}
          <div className="space-y-3">
            <h3 className="font-medium">Size Variants</h3>
            <div className="flex items-center gap-3">
              <MapCodeBadge code={testCode} size="sm" />
              <MapCodeBadge code={testCode} size="md" />
              <MapCodeBadge code={testCode} size="lg" />
            </div>
          </div>

          <Separator />

          {/* Color Variants */}
          <div className="space-y-3">
            <h3 className="font-medium">Color Variants</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <MapCodeBadge code={testCode} variant="default" />
              <MapCodeBadge code={testCode} variant="secondary" />
              <MapCodeBadge code={testCode} variant="destructive" />
              <MapCodeBadge code={testCode} variant="outline" />
            </div>
          </div>

          <Separator />

          {/* Component Variants */}
          <div className="space-y-3">
            <h3 className="font-medium">Component Variants</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Compact:</span>
                <CompactMapCodeBadge code={testCode} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Full:</span>
                <FullMapCodeBadge code={testCode} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Interactive:</span>
                <InteractiveMapCodeBadge 
                  code={testCode} 
                  onCodeClick={handleCopySuccess}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MapCode Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            MapCode Display
          </CardTitle>
          <CardDescription>
            Detailed MapCode display với breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout Variants */}
          <div className="space-y-4">
            <h3 className="font-medium">Layout: Card (Default)</h3>
            <MapCodeDisplay 
              code={testCode} 
              onCopy={handleCopySuccess}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Layout: Inline</h3>
            <MapCodeDisplay 
              code={testCode} 
              layout="inline"
              onCopy={handleCopySuccess}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Layout: Compact</h3>
            <MapCodeDisplay 
              code={testCode} 
              layout="compact"
              onCopy={handleCopySuccess}
            />
          </div>
        </CardContent>
      </Card>

      {/* MapCode Tooltips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            MapCode Tooltips
          </CardTitle>
          <CardDescription>
            Tooltip system với help và examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Tooltip Variants</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <MapCodeTooltip code={testCode} mode="hover">
                <Badge className="cursor-help">
                  Hover Tooltip
                </Badge>
              </MapCodeTooltip>

              <MapCodeTooltip code={testCode} mode="click">
                <Badge className="cursor-pointer">
                  Click Tooltip
                </Badge>
              </MapCodeTooltip>

              <SimpleMapCodeTooltip code={testCode}>
                <Badge className="cursor-help">
                  Simple Tooltip
                </Badge>
              </SimpleMapCodeTooltip>

              <HelpMapCodeTooltip>
                <Badge className="cursor-help">
                  Help Tooltip
                </Badge>
              </HelpMapCodeTooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Service Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Translation Service
          </CardTitle>
          <CardDescription>
            MapCodeTranslationService functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const translation = MapCodeTranslationService.getFullTranslation(testCode);
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Original Code:</span>
                    <Badge className="ml-2 font-mono">{translation.code}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Translation:</span>
                    <span className="ml-2 text-sm">{translation.translation}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Format:</span>
                    <Badge variant="outline" className="ml-2">{translation.format}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Valid:</span>
                    <Badge 
                      variant={translation.isValid ? "default" : "destructive"} 
                      className="ml-2"
                    >
                      {translation.isValid ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                {translation.error && (
                  <div className="text-red-600 text-sm">
                    Error: {translation.error}
                  </div>
                )}

                {translation.isValid && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Components Breakdown:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(translation.components).map(([key, component]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Pos {component.position}
                            </Badge>
                            <span className="text-sm font-medium capitalize">{key}</span>
                          </div>
                          <div className="space-y-1">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                              {component.value}
                            </Badge>
                            <p className="text-xs text-gray-500">{component.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Sample Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Sample MapCodes</CardTitle>
          <CardDescription>
            Test với các MapCode mẫu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_CODES.map((code) => (
              <div key={code} className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestCode(code)}
                  className="w-full justify-start font-mono"
                >
                  {code}
                </Button>
                <MapCodeBadge code={code} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
