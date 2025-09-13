/**
 * Decorative Elements
 * Visual elements và illustrations để làm sinh động trang questions
 * 
 * Features:
 * - Animated SVG patterns
 * - Math symbols decorations
 * - Gradient blobs
 * - Responsive scaling
 * 
 * @author NyNus Development Team
 * @created 2025-01-19
 */

'use client';

import { cn } from '@/lib/utils';

interface DecorativeElementsProps {
  variant?: 'hero' | 'section' | 'footer';
  className?: string;
}

export function DecorativeElements({ 
  variant = 'hero',
  className 
}: DecorativeElementsProps) {
  
  if (variant === 'hero') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
        {/* Animated Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Floating Math Symbols */}
        <div className="absolute top-10 left-10 text-8xl font-thin text-[hsl(243_75%_65%)]/10 animate-float select-none">
          ∮
        </div>
        <div className="absolute top-40 right-20 text-6xl font-thin text-[hsl(188_85%_65%)]/10 animate-float-delayed select-none">
          ∇
        </div>
        <div className="absolute bottom-20 left-1/3 text-7xl font-thin text-[hsl(267_84%_72%)]/10 animate-float select-none">
          ∂
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64">
          <div className="absolute inset-0 rounded-full border border-[hsl(243_75%_65%)]/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-[hsl(243_75%_65%)]/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-8 rounded-full border border-[hsl(243_75%_65%)]/3 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
        {/* Subtle Wave Pattern */}
        <svg
          className="absolute bottom-0 w-full h-32 opacity-5 dark:opacity-10"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="url(#wave-gradient)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(243, 75%, 65%)" />
              <stop offset="50%" stopColor="hsl(267, 84%, 72%)" />
              <stop offset="100%" stopColor="hsl(188, 85%, 65%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Dots */}
        <div className="absolute top-10 right-10">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(243_75%_65%)]/20 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[hsl(267_84%_72%)]/20 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 rounded-full bg-[hsl(188_85%_65%)]/20 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Gradient Mesh */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-r from-[hsl(243_75%_65%)]/5 to-[hsl(267_84%_72%)]/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-20 w-80 h-80 bg-gradient-to-r from-[hsl(188_85%_65%)]/5 to-[hsl(243_75%_65%)]/5 rounded-full blur-3xl" />
      
      {/* Math Formula */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm font-mono text-muted-foreground/20 select-none">
        E = mc²
      </div>
    </div>
  );
}

// Separate component for Question Card decorations
export function QuestionCardDecoration({ className }: { className?: string }) {
  return (
    <div className={cn('absolute -z-10 inset-0', className)}>
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[hsl(243_75%_65%)]/30 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-[hsl(243_75%_65%)]/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-[hsl(188_85%_65%)]/30 to-transparent" />
        <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-[hsl(188_85%_65%)]/30 to-transparent" />
      </div>
    </div>
  );
}

// Interactive Math Background
export function MathBackground({ className }: { className?: string }) {
  const mathSymbols = ['∫', '∑', 'π', '√', '∞', 'Δ', 'θ', 'λ', '∂', '∇'];
  
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {mathSymbols.map((symbol, index) => (
        <div
          key={index}
          className="absolute text-4xl font-light opacity-5 dark:opacity-10 animate-float select-none"
          style={{
            left: `${(index * 13) % 100}%`,
            top: `${(index * 17) % 100}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${10 + index * 2}s`
          }}
        >
          {symbol}
        </div>
      ))}
    </div>
  );
}

export default DecorativeElements;

