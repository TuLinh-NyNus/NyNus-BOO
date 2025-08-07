'use client';

import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface MathBackgroundProps {
  className?: string;
}

// Comprehensive list of mathematical symbols and formulas
const mathSymbols = [
  // Basic symbols
  '∑', '∫', '∂', '∆', '∇', '∞', '≈', '≠', '≤', '≥', '±', '∓', '×', '÷',
  
  // Greek letters
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω',
  'Α', 'Β', 'Γ', 'Δ', 'Θ', 'Λ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω',
  
  // Set theory
  '∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', '∅', '∀', '∃',
  
  // Logic
  '∧', '∨', '¬', '→', '↔', '⊕', '⊗',
  
  // Calculus
  'lim', 'sin', 'cos', 'tan', 'log', 'ln', 'exp',
  
  // Common formulas (as single units)
  'x²', 'x³', 'x⁴', 'y²', 'a²+b²', 'f(x)', 'g(x)', 'h(x)',
  'dx', 'dy', 'dt', 'dr', 'dθ',
  
  // Fractions and powers
  '½', '⅓', '¼', '¾', '⅔', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚',
  '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁰', '¹',
  
  // Geometry
  '∠', '∟', '⊥', '∥', '≅', '∼', '○', '△', '□', '◊',
  
  // Advanced symbols
  '∮', '∯', '∰', '∱', '∲', '∳', '⊕', '⊖', '⊗', '⊘', '⊙', '⊚', '⊛',
  
  // Number theory
  '≡', '≢', '|', '∤', '⊥', '∣',
  
  // Statistics
  'μ', 'σ²', 'χ²', 'ρ', 'Σx', 'x̄', 'ŷ',
];

// Complex mathematical expressions
const mathExpressions = [
  'f(x) = ax² + bx + c',
  '∫₀^∞ e^(-x²) dx',
  'lim[x→∞] (1+1/x)^x',
  '∑ᵢ₌₁^n xᵢ',
  '∂f/∂x',
  'sin²θ + cos²θ = 1',
  'e^(iπ) + 1 = 0',
  'a² + b² = c²',
  '√(x² + y²)',
  'log₂(x)',
  'x = (-b ± √(b²-4ac))/2a',
  'P(A∩B) = P(A)P(B|A)',
  'E[X] = ∑xP(x)',
  'σ = √(E[X²] - (E[X])²)',
];

export function MathBackground({ className }: MathBackgroundProps): JSX.Element {
  const [isClient, setIsClient] = useState(false);

  // Generate random positions and properties for symbols
  const floatingSymbols = useMemo(() => {
    if (!isClient) return []; // Return empty array on server

    const symbols = [];
    const totalSymbols = 60; // Increased number for better coverage

    for (let i = 0; i < totalSymbols; i++) {
      const isExpression = Math.random() < 0.15; // 15% chance for complex expressions
      const symbol = isExpression
        ? mathExpressions[Math.floor(Math.random() * mathExpressions.length)]
        : mathSymbols[Math.floor(Math.random() * mathSymbols.length)];

      symbols.push({
        id: i,
        symbol,
        x: Math.random() * 100, // Percentage position
        y: Math.random() * 100,
        size: isExpression
          ? Math.random() * 0.8 + 0.6 // 0.6-1.4rem for expressions
          : Math.random() * 1.2 + 0.8, // 0.8-2rem for symbols
        opacity: Math.random() * 0.4 + 0.1, // 0.1-0.5 opacity
        duration: Math.random() * 20 + 15, // 15-35s animation duration
        delay: Math.random() * 10, // 0-10s delay
        isExpression,
        // Random movement pattern
        moveX: (Math.random() - 0.5) * 100, // -50 to 50
        moveY: (Math.random() - 0.5) * 100, // -50 to 50
        rotate: Math.random() * 360, // 0-360 degrees
      });
    }

    return symbols;
  }, [isClient]);

  // Set client flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800" />
      
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="math-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="2" fill="white" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#math-grid)" />
        </svg>
      </div>

      {/* Floating mathematical symbols */}
      <div className="absolute inset-0">
        {floatingSymbols.map((item) => (
          <motion.div
            key={item.id}
            className={`absolute select-none ${
              item.isExpression 
                ? 'text-white/30 font-mono text-xs sm:text-sm whitespace-nowrap' 
                : 'text-white/40 font-serif'
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}rem`,
              opacity: item.opacity,
            }}
            initial={{
              x: 0,
              y: 0,
              rotate: 0,
              scale: 0.8,
            }}
            animate={{
              x: [0, item.moveX, 0],
              y: [0, item.moveY, 0],
              rotate: [0, item.rotate, 0],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            {item.symbol}
          </motion.div>
        ))}
      </div>

      {/* Enhanced floating geometric shapes with math theme */}
      <div className="absolute inset-0 hidden sm:block">
        {/* Large integral symbol shape */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 opacity-10"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl" />
        </motion.div>

        {/* Pi symbol inspired shape */}
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 opacity-15"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-300/30 to-transparent rounded-lg blur-lg" />
        </motion.div>

        {/* Sigma summation inspired shape */}
        <motion.div
          className="absolute bottom-20 left-1/4 w-40 h-40 opacity-8"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-2xl" />
        </motion.div>

        {/* Delta triangle shape */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-28 h-28 opacity-12"
          animate={{
            x: [0, -15, 0],
            y: [0, 25, 0],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-yellow-300/25 to-transparent transform rotate-45 blur-lg" />
        </motion.div>
      </div>

      {/* Subtle radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
    </div>
  );
}
