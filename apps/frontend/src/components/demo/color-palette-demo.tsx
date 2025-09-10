'use client';

import React from 'react';

/**
 * Color Palette Demo Component
 * Hiển thị bảng màu mới của light theme với earth tones palette
 */
export function ColorPaletteDemo() {
  const colors = [
    { name: 'Background', var: '--color-background', hex: '#F5F4E8', description: 'Soft cream background' },
    { name: 'Foreground', var: '--color-foreground', hex: '#5D5B71', description: 'Dark olive text' },
    { name: 'Card', var: '--color-card', hex: '#E8E4A6', description: 'Light sage cards' },
    { name: 'Primary', var: '--color-primary', hex: '#F5D547', description: 'Vibrant golden yellow' },
    { name: 'Secondary', var: '--color-secondary', hex: '#D09758', description: 'Warm terracotta' },
    { name: 'Accent', var: '--color-accent', hex: '#E8A2B0', description: 'Soft dusty rose' },
    { name: 'Muted', var: '--color-muted', hex: '#F0EFE3', description: 'Subtle silver-beige' },
    { name: 'Destructive', var: '--color-destructive', hex: '#A38772', description: 'Rich taupe brown' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">NyNus Earth Tones Palette</h1>
        <p className="text-muted-foreground">Light Theme Color Showcase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colors.map((color) => (
          <div
            key={color.name}
            className="rounded-lg overflow-hidden shadow-md border"
          >
            <div
              className="h-24 w-full"
              style={{ backgroundColor: `var(${color.var})` }}
            />
            <div className="p-4 bg-card">
              <h3 className="font-semibold text-card-foreground">{color.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{color.hex}</p>
              <p className="text-xs text-muted-foreground mt-1">{color.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Component Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Button */}
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2 text-card-foreground">Primary Button</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              Nút Primary
            </button>
          </div>

          {/* Secondary Button */}
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2 text-card-foreground">Secondary Button</h3>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity">
              Nút Secondary
            </button>
          </div>

          {/* Accent Badge */}
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2 text-card-foreground">Accent Badge</h3>
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
              Badge Accent
            </span>
          </div>

          {/* Destructive Alert */}
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2 text-card-foreground">Destructive Alert</h3>
            <div className="p-3 bg-destructive text-destructive-foreground rounded-md">
              Thông báo lỗi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
