/**
 * CONFIG_NAME Configuration Template
 * 
 * This is a base template for creating configuration files in the Sembalun app.
 * Replace CONFIG_NAME with your actual config name (e.g., DatabaseConfig, APIConfig).
 * 
 * Features included:
 * - Environment variable handling
 * - Type-safe configuration
 * - Validation and defaults
 * - Development vs production settings
 * - Security considerations
 * - Configuration caching
 * - Error handling
 */

// TODO: Define your configuration interface
interface CONFIG_NAME_Config {
  /** API Configuration */
  api: {
    /** Base URL for API calls */
    baseUrl: string;
    /** API timeout in milliseconds */
    timeout: number;
    /** API rate limit settings */
    rateLimit: {
      maxRequests: number;
      windowMs: number;
    };
    /** Retry configuration */
    retry: {
      attempts: number;
      delay: number;
      backoff: 'linear' | 'exponential';
    };
  };

  /** Database Configuration */
  database: {
    /** Connection URL */
    url: string;
    /** Connection pool settings */
    pool: {
      min: number;
      max: number;
      idleTimeout: number;
    };
    /** SSL configuration */
    ssl: boolean;
    /** Query timeout */
    queryTimeout: number;
  };

  /** Authentication Configuration */
  auth: {
    /** JWT secret key */
    jwtSecret: string;
    /** Token expiration time */
    tokenExpiry: string;
    /** Refresh token expiry */
    refreshTokenExpiry: string;
    /** OAuth providers */
    providers: {
      google: {
        clientId: string;
        clientSecret: string;
        enabled: boolean;
      };
      apple: {
        clientId: string;
        teamId: string;
        keyId: string;
        privateKey: string;
        enabled: boolean;
      };
    };
  };

  /** Storage Configuration */
  storage: {
    /** Storage provider */
    provider: 'supabase' | 'aws' | 'gcp' | 'local';
    /** Bucket/container name */
    bucket: string;
    /** Max file size in bytes */
    maxFileSize: number;
    /** Allowed file types */
    allowedTypes: string[];
    /** CDN URL */
    cdnUrl?: string;
  };

  /** Cache Configuration */
  cache: {
    /** Cache provider */
    provider: 'memory' | 'redis' | 'local';
    /** Default TTL in seconds */
    defaultTtl: number;
    /** Max cache size */
    maxSize: number;
    /** Cache key prefix */
    keyPrefix: string;
  };

  /** Logging Configuration */
  logging: {
    /** Log level */
    level: 'error' | 'warn' | 'info' | 'debug';
    /** Enable file logging */
    fileLogging: boolean;
    /** Log file path */
    logFile?: string;
    /** Enable console logging */
    consoleLogging: boolean;
    /** Structured logging */
    structured: boolean;
  };

  /** Feature Flags */
  features: {
    /** Enable analytics */
    analytics: boolean;
    /** Enable offline mode */
    offline: boolean;
    /** Enable push notifications */
    pushNotifications: boolean;
    /** Enable real-time features */
    realtime: boolean;
    /** Enable experimental features */
    experimental: boolean;
  };

  /** Application Configuration */
  app: {
    /** Application name */
    name: string;
    /** Version */
    version: string;
    /** Environment */
    environment: 'development' | 'staging' | 'production';
    /** Debug mode */
    debug: boolean;
    /** Base URL */
    baseUrl: string;
    /** Default language */
    defaultLanguage: 'en' | 'id';
    /** Supported languages */
    supportedLanguages: string[];
  };
}

// TODO: Define environment variable mappings
interface EnvVariables {
  // API
  VITE_API_BASE_URL?: string;
  VITE_API_TIMEOUT?: string;
  
  // Database (Supabase)
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Authentication
  VITE_JWT_SECRET?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  VITE_APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  
  // Storage
  VITE_STORAGE_BUCKET?: string;
  STORAGE_MAX_FILE_SIZE?: string;
  VITE_CDN_URL?: string;
  
  // Cache
  REDIS_URL?: string;
  CACHE_TTL?: string;
  
  // Logging
  LOG_LEVEL?: string;
  LOG_FILE?: string;
  
  // App
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  NODE_ENV?: string;
  VITE_APP_BASE_URL?: string;
  
  // Feature flags
  VITE_ENABLE_ANALYTICS?: string;
  VITE_ENABLE_OFFLINE?: string;
  VITE_ENABLE_PUSH_NOTIFICATIONS?: string;
  VITE_ENABLE_REALTIME?: string;
  VITE_ENABLE_EXPERIMENTAL?: string;
}

/**
 * Configuration validation errors
 */
class ConfigValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate environment variable as string
 */
const validateString = (
  value: string | undefined,
  fieldName: string,
  required = true,
  defaultValue?: string
): string => {
  if (!value) {
    if (required && !defaultValue) {
      throw new ConfigValidationError(
        `Required environment variable ${fieldName} is missing`,
        fieldName,
        value
      );
    }
    return defaultValue || '';
  }
  return value.trim();
};

/**
 * Validate environment variable as number
 */
const validateNumber = (
  value: string | undefined,
  fieldName: string,
  required = true,
  defaultValue?: number,
  min?: number,
  max?: number
): number => {
  if (!value) {
    if (required && defaultValue === undefined) {
      throw new ConfigValidationError(
        `Required environment variable ${fieldName} is missing`,
        fieldName,
        value
      );
    }
    return defaultValue || 0;
  }

  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    throw new ConfigValidationError(
      `Environment variable ${fieldName} must be a valid number`,
      fieldName,
      value
    );
  }

  if (min !== undefined && numValue < min) {
    throw new ConfigValidationError(
      `Environment variable ${fieldName} must be at least ${min}`,
      fieldName,
      numValue
    );
  }

  if (max !== undefined && numValue > max) {
    throw new ConfigValidationError(
      `Environment variable ${fieldName} must be at most ${max}`,
      fieldName,
      numValue
    );
  }

  return numValue;
};

/**
 * Validate environment variable as boolean
 */
const validateBoolean = (
  value: string | undefined,
  fieldName: string,
  defaultValue = false
): boolean => {
  if (!value) return defaultValue;
  
  const lowerValue = value.toLowerCase().trim();
  if (['true', '1', 'yes', 'on'].includes(lowerValue)) return true;
  if (['false', '0', 'no', 'off'].includes(lowerValue)) return false;
  
  throw new ConfigValidationError(
    `Environment variable ${fieldName} must be a valid boolean`,
    fieldName,
    value
  );
};

/**
 * Validate environment variable as enum
 */
const validateEnum = <T extends string>(
  value: string | undefined,
  fieldName: string,
  allowedValues: readonly T[],
  defaultValue?: T,
  required = true
): T => {
  if (!value) {
    if (required && !defaultValue) {
      throw new ConfigValidationError(
        `Required environment variable ${fieldName} is missing`,
        fieldName,
        value
      );
    }
    return defaultValue as T;
  }

  if (!allowedValues.includes(value as T)) {
    throw new ConfigValidationError(
      `Environment variable ${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName,
      value
    );
  }

  return value as T;
};

/**
 * Get current environment variables
 */
const getEnvVars = (): EnvVariables => {
  // In browser environment, use import.meta.env
  if (typeof window !== 'undefined') {
    return import.meta.env as EnvVariables;
  }
  
  // In Node.js environment, use process.env
  return process.env as EnvVariables;
};

/**
 * Load and validate configuration
 */
const loadConfig = (): CONFIG_NAME_Config => {
  try {
    const env = getEnvVars();
    const isDevelopment = env.NODE_ENV === 'development';
    const isProduction = env.NODE_ENV === 'production';

    console.log(`Loading CONFIG_NAME configuration for ${env.NODE_ENV} environment`);

    const config: CONFIG_NAME_Config = {
      // API Configuration
      api: {
        baseUrl: validateString(
          env.VITE_API_BASE_URL,
          'VITE_API_BASE_URL',
          true,
          isDevelopment ? 'http://localhost:3000/api' : 'https://api.sembalun.app'
        ),
        timeout: validateNumber(env.VITE_API_TIMEOUT, 'VITE_API_TIMEOUT', false, 30000, 1000, 300000),
        rateLimit: {
          maxRequests: isDevelopment ? 1000 : 100,
          windowMs: 60 * 1000 // 1 minute
        },
        retry: {
          attempts: isDevelopment ? 1 : 3,
          delay: 1000,
          backoff: 'exponential'
        }
      },

      // Database Configuration
      database: {
        url: validateString(env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL', true),
        pool: {
          min: 2,
          max: isDevelopment ? 5 : 20,
          idleTimeout: 30000
        },
        ssl: isProduction,
        queryTimeout: validateNumber(env.VITE_API_TIMEOUT, 'DB_QUERY_TIMEOUT', false, 30000)
      },

      // Authentication Configuration
      auth: {
        jwtSecret: validateString(env.VITE_JWT_SECRET, 'VITE_JWT_SECRET', true),
        tokenExpiry: '1h',
        refreshTokenExpiry: '7d',
        providers: {
          google: {
            clientId: validateString(env.VITE_GOOGLE_CLIENT_ID, 'VITE_GOOGLE_CLIENT_ID', false, ''),
            clientSecret: validateString(env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET', false, ''),
            enabled: validateBoolean(env.VITE_GOOGLE_CLIENT_ID, 'google_enabled', false)
          },
          apple: {
            clientId: validateString(env.VITE_APPLE_CLIENT_ID, 'VITE_APPLE_CLIENT_ID', false, ''),
            teamId: validateString(env.APPLE_TEAM_ID, 'APPLE_TEAM_ID', false, ''),
            keyId: validateString(env.APPLE_KEY_ID, 'APPLE_KEY_ID', false, ''),
            privateKey: validateString(env.APPLE_PRIVATE_KEY, 'APPLE_PRIVATE_KEY', false, ''),
            enabled: validateBoolean(env.VITE_APPLE_CLIENT_ID, 'apple_enabled', false)
          }
        }
      },

      // Storage Configuration
      storage: {
        provider: 'supabase',
        bucket: validateString(env.VITE_STORAGE_BUCKET, 'VITE_STORAGE_BUCKET', false, 'sembalun-storage'),
        maxFileSize: validateNumber(env.STORAGE_MAX_FILE_SIZE, 'STORAGE_MAX_FILE_SIZE', false, 10 * 1024 * 1024), // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav'],
        cdnUrl: validateString(env.VITE_CDN_URL, 'VITE_CDN_URL', false)
      },

      // Cache Configuration
      cache: {
        provider: isDevelopment ? 'memory' : 'redis',
        defaultTtl: validateNumber(env.CACHE_TTL, 'CACHE_TTL', false, 300), // 5 minutes
        maxSize: 100,
        keyPrefix: 'sembalun:'
      },

      // Logging Configuration
      logging: {
        level: validateEnum(
          env.LOG_LEVEL,
          'LOG_LEVEL',
          ['error', 'warn', 'info', 'debug'] as const,
          isDevelopment ? 'debug' : 'info',
          false
        ),
        fileLogging: isProduction,
        logFile: validateString(env.LOG_FILE, 'LOG_FILE', false, '/tmp/sembalun.log'),
        consoleLogging: true,
        structured: isProduction
      },

      // Feature Flags
      features: {
        analytics: validateBoolean(env.VITE_ENABLE_ANALYTICS, 'VITE_ENABLE_ANALYTICS', isProduction),
        offline: validateBoolean(env.VITE_ENABLE_OFFLINE, 'VITE_ENABLE_OFFLINE', true),
        pushNotifications: validateBoolean(env.VITE_ENABLE_PUSH_NOTIFICATIONS, 'VITE_ENABLE_PUSH_NOTIFICATIONS', isProduction),
        realtime: validateBoolean(env.VITE_ENABLE_REALTIME, 'VITE_ENABLE_REALTIME', true),
        experimental: validateBoolean(env.VITE_ENABLE_EXPERIMENTAL, 'VITE_ENABLE_EXPERIMENTAL', isDevelopment)
      },

      // Application Configuration
      app: {
        name: validateString(env.VITE_APP_NAME, 'VITE_APP_NAME', false, 'Sembalun'),
        version: validateString(env.VITE_APP_VERSION, 'VITE_APP_VERSION', false, '1.0.0'),
        environment: validateEnum(
          env.NODE_ENV,
          'NODE_ENV',
          ['development', 'staging', 'production'] as const,
          'development',
          false
        ),
        debug: isDevelopment,
        baseUrl: validateString(
          env.VITE_APP_BASE_URL,
          'VITE_APP_BASE_URL',
          false,
          isDevelopment ? 'http://localhost:5173' : 'https://sembalun.app'
        ),
        defaultLanguage: 'id',
        supportedLanguages: ['en', 'id']
      }
    };

    // Validate configuration consistency
    validateConfiguration(config);

    console.log('CONFIG_NAME configuration loaded successfully');
    return config;

  } catch (error) {
    console.error('Failed to load CONFIG_NAME configuration:', error);
    throw error;
  }
};

/**
 * Validate configuration consistency
 */
const validateConfiguration = (config: CONFIG_NAME_Config): void => {
  // Validate API timeout is reasonable
  if (config.api.timeout < 1000) {
    console.warn('API timeout is very low, this might cause issues');
  }

  // Validate database URL format
  if (!config.database.url.startsWith('http')) {
    throw new ConfigValidationError(
      'Database URL must be a valid HTTP URL',
      'database.url',
      config.database.url
    );
  }

  // Validate JWT secret in production
  if (config.app.environment === 'production' && config.auth.jwtSecret.length < 32) {
    throw new ConfigValidationError(
      'JWT secret must be at least 32 characters in production',
      'auth.jwtSecret',
      config.auth.jwtSecret.length
    );
  }

  // Validate file size limits
  if (config.storage.maxFileSize > 50 * 1024 * 1024) { // 50MB
    console.warn('Large max file size setting detected, ensure your infrastructure can handle this');
  }

  // Validate cache TTL
  if (config.cache.defaultTtl < 60) {
    console.warn('Very short cache TTL detected, this might impact performance');
  }
};

// TODO: Cache configuration to avoid repeated parsing
let cachedConfig: CONFIG_NAME_Config | null = null;

/**
 * Get configuration instance (cached)
 */
export const getConfig = (): CONFIG_NAME_Config => {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
};

/**
 * Reload configuration (clears cache)
 */
export const reloadConfig = (): CONFIG_NAME_Config => {
  cachedConfig = null;
  return getConfig();
};

/**
 * Get specific configuration section
 */
export const getConfigSection = <K extends keyof CONFIG_NAME_Config>(
  section: K
): CONFIG_NAME_Config[K] => {
  return getConfig()[section];
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof CONFIG_NAME_Config['features']): boolean => {
  return getConfig().features[feature];
};

/**
 * Get environment-specific setting
 */
export const getEnvironmentSetting = <T>(
  development: T,
  staging: T,
  production: T
): T => {
  const env = getConfig().app.environment;
  switch (env) {
    case 'development':
      return development;
    case 'staging':
      return staging;
    case 'production':
      return production;
    default:
      return development;
  }
};

// TODO: Export types for use in other modules
export type {
  CONFIG_NAME_Config,
  EnvVariables
};

export {
  ConfigValidationError
};

/**
 * Example Usage:
 * 
 * ```typescript
 * // Get full configuration
 * const config = getConfig();
 * console.log(config.api.baseUrl);
 * 
 * // Get specific section
 * const apiConfig = getConfigSection('api');
 * console.log(apiConfig.timeout);
 * 
 * // Check feature flag
 * if (isFeatureEnabled('analytics')) {
 *   // Initialize analytics
 * }
 * 
 * // Environment-specific settings
 * const logLevel = getEnvironmentSetting('debug', 'info', 'warn');
 * 
 * // Reload configuration (useful for tests)
 * const newConfig = reloadConfig();
 * ```
 */