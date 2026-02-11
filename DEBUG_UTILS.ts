/**
 * Debug Utilities for Development
 * Import and use these utilities to help debug the app
 */

// Enable/disable debug mode
const DEBUG_MODE = import.meta.env.DEV; // true in development, false in production

/**
 * Enhanced console logging with context
 */
export const debugLog = {
  info: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (DEBUG_MODE) {
      console.error(`[ERROR] ${message}`, error || '');
      // In production, you might want to send this to an error tracking service
    }
  },
  warn: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  api: (endpoint: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`[API] ${endpoint}`, data || '');
    }
  },
  state: (component: string, state: any) => {
    if (DEBUG_MODE) {
      console.log(`[STATE] ${component}:`, state);
    }
  }
};

/**
 * Measure performance of async functions
 */
export const measurePerformance = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  if (!DEBUG_MODE) return fn();
  
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`⏱️ [PERF] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`⏱️ [PERF] ${label} (ERROR): ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Debug localStorage operations
 */
export const debugStorage = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      if (DEBUG_MODE) {
        console.log(`[STORAGE] GET ${key}:`, value ? JSON.parse(value) : null);
      }
      return value ? JSON.parse(value) : null;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error(`[STORAGE] GET ERROR ${key}:`, error);
      }
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      if (DEBUG_MODE) {
        console.log(`[STORAGE] SET ${key}:`, value);
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error(`[STORAGE] SET ERROR ${key}:`, error);
      }
    }
  },
  clear: (key?: string) => {
    if (key) {
      localStorage.removeItem(key);
      if (DEBUG_MODE) {
        console.log(`[STORAGE] CLEAR ${key}`);
      }
    } else {
      localStorage.clear();
      if (DEBUG_MODE) {
        console.log(`[STORAGE] CLEAR ALL`);
      }
    }
  },
  list: () => {
    if (DEBUG_MODE) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('lumina_'));
      console.log('[STORAGE] All lumina keys:', keys);
      keys.forEach(key => {
        try {
          console.log(`  ${key}:`, JSON.parse(localStorage.getItem(key) || '{}'));
        } catch {
          console.log(`  ${key}:`, localStorage.getItem(key));
        }
      });
    }
  }
};

/**
 * Debug API calls
 */
export const debugApi = {
  request: (url: string, options?: any) => {
    if (DEBUG_MODE) {
      console.log(`[API REQUEST] ${url}`, options || '');
    }
  },
  response: (url: string, response: any) => {
    if (DEBUG_MODE) {
      console.log(`[API RESPONSE] ${url}`, response);
    }
  },
  error: (url: string, error: any) => {
    if (DEBUG_MODE) {
      console.error(`[API ERROR] ${url}`, error);
    }
  }
};

/**
 * React hook for debugging component renders
 */
export const useDebugRender = (componentName: string, props?: any) => {
  if (DEBUG_MODE) {
    console.log(`[RENDER] ${componentName}`, props || '');
  }
};

/**
 * Check environment configuration
 */
export const checkEnvironment = () => {
  if (DEBUG_MODE) {
    console.group('🔍 Environment Check');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.log('API Key Set:', !!(process.env.API_KEY || process.env.GEMINI_API_KEY));
    console.log('API Key Length:', (process.env.API_KEY || process.env.GEMINI_API_KEY || '').length);
    debugStorage.list();
    console.groupEnd();
  }
};

// Auto-check on import in dev mode
if (DEBUG_MODE && typeof window !== 'undefined') {
  // Make debug utilities available globally for console access
  (window as any).debugUtils = {
    log: debugLog,
    storage: debugStorage,
    api: debugApi,
    checkEnv: checkEnvironment,
    measure: measurePerformance
  };
  
  console.log('🐛 Debug utilities available! Use window.debugUtils in console');
  console.log('   Example: window.debugUtils.storage.list()');
}
