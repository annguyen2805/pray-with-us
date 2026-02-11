/**
 * Environment variable validation
 */

export const validateEnvironment = (): { isValid: boolean; message?: string } => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
    return {
      isValid: false,
      message: 'GEMINI_API_KEY is not configured. Please set it in .env.local file. Some features may not work properly.'
    };
  }

  return { isValid: true };
};

export const showEnvWarning = () => {
  const validation = validateEnvironment();
  if (!validation.isValid && validation.message) {
    console.warn('⚠️ Environment Warning:', validation.message);
    // In production, you might want to show a user-friendly message
    // For now, we'll just log it to console
  }
};
