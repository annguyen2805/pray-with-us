import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-amber-900/10 border-t-amber-600 rounded-full animate-spin`}></div>
      {text && (
        <p className="text-[10px] text-amber-900/40 font-medium uppercase tracking-widest">
          {text}
        </p>
      )}
    </div>
  );
};
