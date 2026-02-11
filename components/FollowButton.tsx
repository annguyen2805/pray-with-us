import React from 'react';
import { FollowItemType } from '../types';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onToggle,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-10 h-10 text-xs'
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all active:scale-90 ${className} ${
        isFollowing
          ? 'bg-amber-100 text-amber-700 border border-amber-300'
          : 'bg-white/50 text-slate-400 border border-slate-200 hover:bg-amber-50 hover:text-amber-600'
      }`}
      title={isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    >
      <i className={`fa-${isFollowing ? 'solid' : 'regular'} fa-bookmark`}></i>
    </button>
  );
};
