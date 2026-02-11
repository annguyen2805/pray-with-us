/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  retryable?: boolean;
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: 'Không thể kết nối. Vui lòng kiểm tra kết nối internet.',
        code: 'NETWORK_ERROR',
        retryable: true
      };
    }

    // Check for API key errors
    if (error.message.includes('API_KEY') || error.message.includes('api key')) {
      return {
        message: 'Lỗi cấu hình API. Vui lòng kiểm tra GEMINI_API_KEY trong file .env.local',
        code: 'API_KEY_ERROR',
        retryable: false
      };
    }

    // Check for rate limiting
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return {
        message: 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.',
        code: 'RATE_LIMIT_ERROR',
        retryable: true
      };
    }

    return {
      message: error.message || 'Đã xảy ra lỗi không xác định.',
      code: 'UNKNOWN_ERROR',
      retryable: true
    };
  }

  return {
    message: 'Đã xảy ra lỗi không xác định.',
    code: 'UNKNOWN_ERROR',
    retryable: true
  };
};

export const showErrorToast = (error: AppError) => {
  // This could be integrated with a toast library in the future
  console.error('Error:', error);
  // For now, we'll rely on the UI to display errors
};
