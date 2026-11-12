import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  variant?: 'white' | 'obsidian' | 'glass' | 'subtle';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function BentoCard({
  children,
  variant = 'white',
  className = '',
  padding = 'md',
}: BentoCardProps) {
  const variantClasses = {
    white: 'bg-white border border-[#E5DFD3] text-[#2A2421] shadow-2xs',
    obsidian: 'bg-[#231E1B] border border-[#3A322D] text-[#FAF8F5] shadow-lg',
    glass: 'bg-white/15 backdrop-blur-md border border-white/25 text-white',
    subtle: 'bg-[#EFECE4] border border-[#DFD8CC] text-[#2A2421]',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-7 sm:p-8',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
