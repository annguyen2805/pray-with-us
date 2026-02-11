import React from 'react';
import { AppError } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`glass p-4 rounded-xl border border-rose-200 bg-rose-50/50 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>
        </div>
        <div className="flex-grow">
          <p className="text-[11px] font-bold text-rose-900 mb-1">
            {error.message}
          </p>
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="text-[9px] font-bold text-rose-700 uppercase tracking-wider hover:underline"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
