/**
 * UTILITY_NAME Utility Functions Template
 * 
 * This is a base template for creating utility functions in the Sembalun app.
 * Replace UTILITY_NAME with your actual utility name (e.g., dateUtils, validationUtils).
 * 
 * Features included:
 * - Full TypeScript support
 * - Error handling
 * - Input validation
 * - Performance optimizations
 * - Memoization strategies
 * - Testing utilities
 * - Documentation examples
 */

// TODO: Define your utility types
interface UTILITY_OPTIONS {
  /** Enable strict validation */
  strict?: boolean;
  /** Custom formatter options */
  format?: 'short' | 'long' | 'full';
  /** Locale settings */
  locale?: 'en' | 'id';
  /** Cache results */
  cache?: boolean;
}

interface UTILITY_RESULT<T = unknown> {
  /** Result data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message if any */
  error?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

// TODO: Cache for memoization
const cache = new Map<string, { result: unknown; timestamp: number }>();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Clear expired cache entries
 */
const clearExpiredCache = (): void => {
  const now = Date.now();
  for (const [key, { timestamp }] of cache.entries()) {
    if (now - timestamp > CACHE_TIMEOUT) {
      cache.delete(key);
    }
  }
};

/**
 * Get cached result
 */
const getCachedResult = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TIMEOUT;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.result as T;
};

/**
 * Set cached result
 */
const setCachedResult = <T>(key: string, result: T): void => {
  clearExpiredCache();
  cache.set(key, {
    result,
    timestamp: Date.now()
  });
};

/**
 * Validate input parameters
 */
const validateInput = (value: unknown, type: string, required = true): void => {
  if (required && (value === null || value === undefined)) {
    throw new Error(`${type} is required`);
  }

  if (value !== null && value !== undefined) {
    const actualType = typeof value;
    if (actualType !== type) {
      throw new Error(`Expected ${type}, got ${actualType}`);
    }
  }
};

/**
 * Create a safe result wrapper
 */
const createResult = <T>(
  data: T, 
  success = true, 
  error?: string, 
  metadata?: Record<string, unknown>
): UTILITY_RESULT<T> => ({
  data,
  success,
  error,
  metadata
});

/**
 * Handle errors consistently
 */
const handleError = <T>(error: unknown, fallback: T): UTILITY_RESULT<T> => {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error('Utility function error:', message, error);
  
  return createResult(fallback, false, message);
};

// TODO: Main utility functions

/**
 * Format text with Indonesian locale support
 * 
 * @param text - Text to format
 * @param options - Formatting options
 * @returns Formatted text result
 */
export const formatText = (
  text: string, 
  options: UTILITY_OPTIONS = {}
): UTILITY_RESULT<string> => {
  try {
    validateInput(text, 'string');
    
    const { format = 'short', locale = 'id', cache: useCache = true } = options;
    
    // Check cache
    const cacheKey = `formatText-${text}-${format}-${locale}`;
    if (useCache) {
      const cached = getCachedResult<string>(cacheKey);
      if (cached) {
        return createResult(cached);
      }
    }

    let formatted = text.trim();

    // Apply formatting based on type
    switch (format) {
      case 'short':
        formatted = formatted.length > 50 
          ? formatted.substring(0, 47) + '...' 
          : formatted;
        break;
      
      case 'long':
        // Add proper sentence structure
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
          formatted += '.';
        }
        break;
      
      case 'full':
        // Full formatting with title case
        formatted = formatted
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
    }

    // Apply locale-specific formatting
    if (locale === 'id') {
      // Indonesian-specific text formatting
      formatted = formatted
        .replace(/\bdan\b/g, 'dan')
        .replace(/\batau\b/g, 'atau')
        .replace(/\bdengan\b/g, 'dengan');
    }

    // Cache result
    if (useCache) {
      setCachedResult(cacheKey, formatted);
    }

    return createResult(formatted, true, undefined, { 
      originalLength: text.length,
      formattedLength: formatted.length,
      format,
      locale
    });

  } catch (error) {
    return handleError(error, text);
  }
};

/**
 * Validate Indonesian phone number
 * 
 * @param phone - Phone number to validate
 * @param options - Validation options
 * @returns Validation result with formatted phone
 */
export const validatePhone = (
  phone: string, 
  options: UTILITY_OPTIONS = {}
): UTILITY_RESULT<{ isValid: boolean; formatted: string; type: string }> => {
  try {
    validateInput(phone, 'string');
    
    const { strict = false, cache: useCache = true } = options;
    
    // Check cache
    const cacheKey = `validatePhone-${phone}-${strict}`;
    if (useCache) {
      const cached = getCachedResult<{ isValid: boolean; formatted: string; type: string }>(cacheKey);
      if (cached) {
        return createResult(cached);
      }
    }

    // Clean phone number
    const cleaned = phone.replace(/\D/g, '');
    
    let isValid = false;
    let formatted = phone;
    let type = 'unknown';

    // Indonesian phone number patterns
    const patterns = {
      mobile: /^(08[1-9][0-9]{6,9}|628[1-9][0-9]{6,9})$/,
      landline: /^(021|022|024|031|061|0274|0341|0361|0411|0421|0431|0451|0471)[0-9]{6,8}$/,
      international: /^(\+62|0062)[0-9]{9,13}$/
    };

    // Check mobile numbers
    if (patterns.mobile.test(cleaned)) {
      isValid = true;
      type = 'mobile';
      
      // Format: 0812-3456-7890
      if (cleaned.startsWith('08')) {
        formatted = cleaned.replace(/^(08\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
      } else if (cleaned.startsWith('628')) {
        formatted = cleaned.replace(/^(628\d)(\d{4})(\d{4})/, '+62 $1-$2-$3');
      }
    }
    // Check landline numbers
    else if (patterns.landline.test(cleaned)) {
      isValid = true;
      type = 'landline';
      
      // Format based on area code
      if (cleaned.startsWith('021')) {
        formatted = cleaned.replace(/^(021)(\d{4})(\d{4})/, '$1-$2-$3');
      } else {
        formatted = cleaned.replace(/^(\d{3,4})(\d{3,4})(\d{3,4})/, '$1-$2-$3');
      }
    }
    // Check international format
    else if (patterns.international.test(cleaned)) {
      isValid = !strict; // In strict mode, require local format
      type = 'international';
      formatted = phone; // Keep original international format
    }

    const result = { isValid, formatted, type };
    
    // Cache result
    if (useCache) {
      setCachedResult(cacheKey, result);
    }

    return createResult(result, true, undefined, {
      originalPhone: phone,
      cleanedPhone: cleaned,
      strict
    });

  } catch (error) {
    return handleError(error, { isValid: false, formatted: phone, type: 'invalid' });
  }
};

/**
 * Format Indonesian currency (Rupiah)
 * 
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  options: UTILITY_OPTIONS = {}
): UTILITY_RESULT<string> => {
  try {
    validateInput(amount, 'number');
    
    const { format = 'short', locale = 'id', cache: useCache = true } = options;
    
    // Check cache
    const cacheKey = `formatCurrency-${amount}-${format}-${locale}`;
    if (useCache) {
      const cached = getCachedResult<string>(cacheKey);
      if (cached) {
        return createResult(cached);
      }
    }

    let formatted: string;

    if (locale === 'id') {
      // Indonesian Rupiah formatting
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      
      formatted = formatter.format(amount);
      
      // Apply format variations
      if (format === 'short') {
        // Convert to short format: Rp 1,2 jt
        if (amount >= 1000000000) {
          formatted = `Rp ${(amount / 1000000000).toFixed(1)} M`;
        } else if (amount >= 1000000) {
          formatted = `Rp ${(amount / 1000000).toFixed(1)} jt`;
        } else if (amount >= 1000) {
          formatted = `Rp ${(amount / 1000).toFixed(1)} rb`;
        }
      }
    } else {
      // English/USD formatting
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      formatted = formatter.format(amount);
    }

    // Cache result
    if (useCache) {
      setCachedResult(cacheKey, formatted);
    }

    return createResult(formatted, true, undefined, {
      originalAmount: amount,
      format,
      locale
    });

  } catch (error) {
    return handleError(error, `Rp ${amount.toLocaleString('id-ID')}`);
  }
};

/**
 * Generate slug from Indonesian text
 * 
 * @param text - Text to convert to slug
 * @param options - Slug generation options
 * @returns URL-friendly slug
 */
export const generateSlug = (
  text: string, 
  options: UTILITY_OPTIONS = {}
): UTILITY_RESULT<string> => {
  try {
    validateInput(text, 'string');
    
    const { cache: useCache = true } = options;
    
    // Check cache
    const cacheKey = `generateSlug-${text}`;
    if (useCache) {
      const cached = getCachedResult<string>(cacheKey);
      if (cached) {
        return createResult(cached);
      }
    }

    let slug = text
      .toLowerCase()
      .trim()
      // Replace Indonesian characters
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      // Remove special characters
      .replace(/[^\w\s-]/g, '')
      // Replace spaces and multiple dashes with single dash
      .replace(/[\s_-]+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '');

    // Ensure slug is not empty
    if (!slug) {
      slug = 'untitled';
    }

    // Limit length
    if (slug.length > 100) {
      slug = slug.substring(0, 100).replace(/-[^-]*$/, '');
    }

    // Cache result
    if (useCache) {
      setCachedResult(cacheKey, slug);
    }

    return createResult(slug, true, undefined, {
      originalText: text,
      slugLength: slug.length
    });

  } catch (error) {
    return handleError(error, 'untitled');
  }
};

/**
 * Debounce function calls
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function calls
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
};

/**
 * Check if object is empty
 * 
 * @param obj - Object to check
 * @returns True if object is empty
 */
export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Generate random ID
 * 
 * @param length - Length of ID (default: 8)
 * @returns Random alphanumeric ID
 */
export const generateId = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Clear all cached results
 */
export const clearCache = (): void => {
  cache.clear();
  console.log('Utility cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

// TODO: Export types
export type {
  UTILITY_OPTIONS,
  UTILITY_RESULT
};

/**
 * Example Usage:
 * 
 * ```typescript
 * // Format text
 * const { data: formatted } = formatText('hello world', { 
 *   format: 'long', 
 *   locale: 'id' 
 * });
 * console.log(formatted); // "Hello world."
 * 
 * // Validate phone
 * const { data: phoneResult } = validatePhone('08123456789');
 * console.log(phoneResult); // { isValid: true, formatted: "0812-3456-789", type: "mobile" }
 * 
 * // Format currency
 * const { data: price } = formatCurrency(1500000, { format: 'short' });
 * console.log(price); // "Rp 1,5 jt"
 * 
 * // Generate slug
 * const { data: slug } = generateSlug('Meditasi Pagi untuk Ketenangan');
 * console.log(slug); // "meditasi-pagi-untuk-ketenangan"
 * 
 * // Debounce search function
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Use in component
 * debouncedSearch('meditation'); // Will only execute after 300ms delay
 * ```
 */