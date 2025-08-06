import { supabase } from '../../config/supabaseClient';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  stack?: string;
}

export interface ErrorContext {
  service: string;
  method: string;
  userId?: string;
  requestId?: string;
  userAgent?: string;
  url?: string;
  parameters?: any;
  metadata?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  validation_errors?: ValidationError[];
  metadata?: {
    timestamp: string;
    request_id: string;
    version: string;
    rate_limit?: {
      remaining: number;
      reset: string;
    };
  };
}

export interface ErrorLog {
  id: string;
  error_code: string;
  message: string;
  severity: ApiError['severity'];
  context: ErrorContext;
  user_id?: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  occurrence_count: number;
  first_occurred: string;
  last_occurred: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationSchema {
  [field: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | string;
  };
}

export interface RateLimit {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export class ApiErrorService {
  private static instance: ApiErrorService;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  // Common error codes
  static readonly ERROR_CODES = {
    // Validation Errors (1000-1999)
    VALIDATION_FAILED: 'E1000',
    REQUIRED_FIELD_MISSING: 'E1001',
    INVALID_EMAIL_FORMAT: 'E1002',
    INVALID_PASSWORD_FORMAT: 'E1003',
    FIELD_TOO_SHORT: 'E1004',
    FIELD_TOO_LONG: 'E1005',
    INVALID_ENUM_VALUE: 'E1006',
    INVALID_NUMBER_RANGE: 'E1007',
    INVALID_DATE_FORMAT: 'E1008',
    INVALID_URL_FORMAT: 'E1009',

    // Authentication Errors (2000-2999)
    UNAUTHORIZED: 'E2000',
    INVALID_CREDENTIALS: 'E2001',
    TOKEN_EXPIRED: 'E2002',
    TOKEN_INVALID: 'E2003',
    SESSION_EXPIRED: 'E2004',
    INSUFFICIENT_PERMISSIONS: 'E2005',
    ACCOUNT_LOCKED: 'E2006',
    EMAIL_NOT_VERIFIED: 'E2007',

    // Resource Errors (3000-3999)
    RESOURCE_NOT_FOUND: 'E3000',
    RESOURCE_ALREADY_EXISTS: 'E3001',
    RESOURCE_DELETED: 'E3002',
    RESOURCE_LOCKED: 'E3003',
    RESOURCE_CONFLICT: 'E3004',

    // Rate Limiting (4000-4999)
    RATE_LIMIT_EXCEEDED: 'E4000',
    QUOTA_EXCEEDED: 'E4001',
    TOO_MANY_REQUESTS: 'E4002',

    // Database Errors (5000-5999)
    DATABASE_CONNECTION_FAILED: 'E5000',
    DATABASE_QUERY_FAILED: 'E5001',
    DATABASE_CONSTRAINT_VIOLATION: 'E5002',
    DATABASE_TIMEOUT: 'E5003',

    // External Service Errors (6000-6999)
    EXTERNAL_SERVICE_UNAVAILABLE: 'E6000',
    EXTERNAL_SERVICE_TIMEOUT: 'E6001',
    EXTERNAL_SERVICE_ERROR: 'E6002',

    // Business Logic Errors (7000-7999)
    BUSINESS_RULE_VIOLATION: 'E7000',
    INSUFFICIENT_BALANCE: 'E7001',
    INVALID_OPERATION_STATE: 'E7002',
    DEPENDENCY_NOT_MET: 'E7003',

    // System Errors (8000-8999)
    INTERNAL_SERVER_ERROR: 'E8000',
    SERVICE_UNAVAILABLE: 'E8001',
    CONFIGURATION_ERROR: 'E8002',
    MEMORY_LIMIT_EXCEEDED: 'E8003',

    // File Upload Errors (9000-9999)
    FILE_TOO_LARGE: 'E9000',
    INVALID_FILE_TYPE: 'E9001',
    FILE_UPLOAD_FAILED: 'E9002',
    FILE_CORRUPTED: 'E9003'
  } as const;

  static getInstance(): ApiErrorService {
    if (!ApiErrorService.instance) {
      ApiErrorService.instance = new ApiErrorService();
    }
    return ApiErrorService.instance;
  }

  // Error Creation and Handling
  createError(
    code: string,
    message: string,
    context?: Partial<ErrorContext>,
    severity: ApiError['severity'] = 'medium',
    details?: any
  ): ApiError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      context: context as ErrorContext,
      severity
    };
  }

  createValidationError(field: string, message: string, code: string, value?: any): ValidationError {
    return { field, message, code, value };
  }

  async handleError(error: ApiError): Promise<void> {
    try {
      // Log error to database
      await this.logError(error);

      // Send to monitoring service if critical
      if (error.severity === 'critical') {
        await this.sendToMonitoring(error);
      }

      // Notify admin for high severity errors
      if (['high', 'critical'].includes(error.severity)) {
        await this.notifyAdmin(error);
      }
    } catch (loggingError) {
      console.error('Failed to handle error:', loggingError);
    }
  }

  private async logError(error: ApiError): Promise<void> {
    try {
      // Check if this error already exists
      const { data: existingError } = await supabase
        .from('error_logs')
        .select('*')
        .eq('error_code', error.code)
        .eq('message', error.message)
        .eq('user_id', error.user_id || null)
        .single();

      if (existingError) {
        // Update existing error
        await supabase
          .from('error_logs')
          .update({
            occurrence_count: existingError.occurrence_count + 1,
            last_occurred: error.timestamp,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingError.id);
      } else {
        // Create new error log
        await supabase
          .from('error_logs')
          .insert([{
            error_code: error.code,
            message: error.message,
            severity: error.severity,
            context: error.context || {},
            user_id: error.user_id,
            resolved: false,
            occurrence_count: 1,
            first_occurred: error.timestamp,
            last_occurred: error.timestamp
          }]);
      }
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }

  private async sendToMonitoring(error: ApiError): Promise<void> {
    // This would integrate with monitoring services like Sentry, LogRocket, etc.
    console.error('CRITICAL ERROR:', error);
  }

  private async notifyAdmin(error: ApiError): Promise<void> {
    // This would send notifications to admin via email, Slack, etc.
    console.warn('HIGH SEVERITY ERROR:', error);
  }

  // Validation
  validate<T = any>(data: any, schema: ValidationSchema): { isValid: boolean; errors: ValidationError[]; data?: T } {
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(this.createValidationError(
          field,
          `${field} is required`,
          ApiErrorService.ERROR_CODES.REQUIRED_FIELD_MISSING,
          value
        ));
        continue;
      }

      // Skip further validation if field is not required and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type && !this.validateType(value, rules.type)) {
        errors.push(this.createValidationError(
          field,
          `${field} must be of type ${rules.type}`,
          ApiErrorService.ERROR_CODES.VALIDATION_FAILED,
          value
        ));
        continue;
      }

      // String validations
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(this.createValidationError(
            field,
            `${field} must be at least ${rules.minLength} characters long`,
            ApiErrorService.ERROR_CODES.FIELD_TOO_SHORT,
            value
          ));
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(this.createValidationError(
            field,
            `${field} must be no more than ${rules.maxLength} characters long`,
            ApiErrorService.ERROR_CODES.FIELD_TOO_LONG,
            value
          ));
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(this.createValidationError(
            field,
            `${field} format is invalid`,
            ApiErrorService.ERROR_CODES.VALIDATION_FAILED,
            value
          ));
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(this.createValidationError(
            field,
            `${field} must be at least ${rules.min}`,
            ApiErrorService.ERROR_CODES.INVALID_NUMBER_RANGE,
            value
          ));
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(this.createValidationError(
            field,
            `${field} must be no more than ${rules.max}`,
            ApiErrorService.ERROR_CODES.INVALID_NUMBER_RANGE,
            value
          ));
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(this.createValidationError(
          field,
          `${field} must be one of: ${rules.enum.join(', ')}`,
          ApiErrorService.ERROR_CODES.INVALID_ENUM_VALUE,
          value
        ));
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(value);
        if (customResult !== true) {
          errors.push(this.createValidationError(
            field,
            typeof customResult === 'string' ? customResult : `${field} failed custom validation`,
            ApiErrorService.ERROR_CODES.VALIDATION_FAILED,
            value
          ));
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data as T : undefined
    };
  }

  private validateType(value: any, type: ValidationSchema[string]['type']): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  // Rate Limiting
  checkRateLimit(identifier: string, rateLimit: RateLimit): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `rateLimit:${identifier}`;
    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or initialize rate limit
      const resetTime = now + rateLimit.windowMs;
      this.rateLimitStore.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: rateLimit.maxRequests - 1, resetTime };
    }

    if (existing.count >= rateLimit.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: existing.resetTime };
    }

    // Increment count
    existing.count++;
    this.rateLimitStore.set(key, existing);
    return { allowed: true, remaining: rateLimit.maxRequests - existing.count, resetTime: existing.resetTime };
  }

  // Response Formatting
  successResponse<T>(data: T, metadata?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
        version: '1.0.0',
        ...metadata
      }
    };
  }

  errorResponse(error: ApiError, validationErrors?: ValidationError[]): ApiResponse {
    return {
      success: false,
      error,
      validation_errors: validationErrors,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  validationErrorResponse(errors: ValidationError[]): ApiResponse {
    return {
      success: false,
      error: this.createError(
        ApiErrorService.ERROR_CODES.VALIDATION_FAILED,
        'Validation failed',
        undefined,
        'low'
      ),
      validation_errors: errors,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  // Common Validation Schemas
  static readonly VALIDATION_SCHEMAS = {
    EMAIL: {
      email: { required: true, type: 'email' as const }
    },
    PASSWORD: {
      password: {
        required: true,
        type: 'string' as const,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
      }
    },
    USER_REGISTRATION: {
      email: { required: true, type: 'email' as const },
      password: {
        required: true,
        type: 'string' as const,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
      },
      display_name: { required: true, type: 'string' as const, minLength: 2, maxLength: 50 }
    },
    MEDITATION_SESSION: {
      type: {
        required: true,
        type: 'string' as const,
        enum: ['breathing', 'guided', 'silent', 'walking']
      },
      duration_minutes: { required: true, type: 'number' as const, min: 1, max: 120 },
      quality_rating: { required: false, type: 'number' as const, min: 1, max: 5 },
      mood_before: {
        required: false,
        type: 'string' as const,
        enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
      },
      mood_after: {
        required: false,
        type: 'string' as const,
        enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
      }
    },
    MOOD_ENTRY: {
      mood: {
        required: true,
        type: 'string' as const,
        enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
      },
      energy_level: { required: true, type: 'number' as const, min: 1, max: 5 },
      stress_level: { required: true, type: 'number' as const, min: 1, max: 5 },
      focus_level: { required: true, type: 'number' as const, min: 1, max: 5 },
      anxiety_level: { required: true, type: 'number' as const, min: 1, max: 5 },
      gratitude_level: { required: true, type: 'number' as const, min: 1, max: 5 },
      notes: { required: false, type: 'string' as const, maxLength: 500 }
    }
  };

  // Error Analytics
  async getErrorAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    total_errors: number;
    error_rate: number;
    top_errors: Array<{ code: string; message: string; count: number }>;
    severity_breakdown: { [severity: string]: number };
    resolution_rate: number;
    avg_resolution_time: number;
  }> {
    try {
      let dateFilter = '';
      const now = new Date();

      switch (timeframe) {
        case 'day': {
          const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          dateFilter = dayAgo.toISOString();
          break;
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString();
          break;
        }
      }

      const { data: errors, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', dateFilter);

      if (error) throw error;

      const total_errors = errors?.reduce((sum, e) => sum + e.occurrence_count, 0) || 0;

      // Calculate error rate (simplified - would need total requests for accurate rate)
      const error_rate = total_errors; // Placeholder

      // Top errors
      const errorCounts: { [key: string]: { count: number; message: string } } = {};
      errors?.forEach(e => {
        if (!errorCounts[e.error_code]) {
          errorCounts[e.error_code] = { count: 0, message: e.message };
        }
        errorCounts[e.error_code].count += e.occurrence_count;
      });

      const top_errors = Object.entries(errorCounts)
        .map(([code, { count, message }]) => ({ code, message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Severity breakdown
      const severity_breakdown: { [severity: string]: number } = {};
      errors?.forEach(e => {
        severity_breakdown[e.severity] = (severity_breakdown[e.severity] || 0) + e.occurrence_count;
      });

      // Resolution metrics
      const resolvedErrors = errors?.filter(e => e.resolved) || [];
      const resolution_rate = errors?.length > 0 ? (resolvedErrors.length / errors.length) * 100 : 0;

      // Calculate average resolution time
      const resolutionTimes = resolvedErrors
        .filter(e => e.resolved_at)
        .map(e => new Date(e.resolved_at!).getTime() - new Date(e.first_occurred).getTime());
      
      const avg_resolution_time = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
        : 0;

      return {
        total_errors,
        error_rate,
        top_errors,
        severity_breakdown,
        resolution_rate: Math.round(resolution_rate),
        avg_resolution_time: Math.round(avg_resolution_time / (1000 * 60 * 60)) // Convert to hours
      };
    } catch (error) {
      console.error('Error getting error analytics:', error);
      return {
        total_errors: 0,
        error_rate: 0,
        top_errors: [],
        severity_breakdown: {},
        resolution_rate: 0,
        avg_resolution_time: 0
      };
    }
  }

  // Utility methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      database: boolean;
      memory: boolean;
      error_rate: boolean;
    };
  }> {
    const checks = {
      database: false,
      memory: false,
      error_rate: false
    };

    try {
      // Database check
      const { error: dbError } = await supabase.from('error_logs').select('id').limit(1);
      checks.database = !dbError;

      // Memory check (simplified)
      checks.memory = process.memoryUsage().heapUsed < 1024 * 1024 * 1024; // Less than 1GB

      // Error rate check
      const analytics = await this.getErrorAnalytics('day');
      checks.error_rate = analytics.error_rate < 100; // Less than 100 errors per day

      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const status = healthyChecks === 3 ? 'healthy' : healthyChecks >= 2 ? 'degraded' : 'unhealthy';

      return { status, checks };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks
      };
    }
  }

  // Cleanup old errors
  async cleanupOldErrors(daysToKeep: number = 90): Promise<{ deleted: number; error?: any }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('error_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('resolved', true);

      if (error) throw error;

      return { deleted: data?.length || 0 };
    } catch (error) {
      console.error('Error cleaning up old errors:', error);
      return { deleted: 0, error };
    }
  }
}

export const apiErrorService = ApiErrorService.getInstance();

// Export common error creators for convenience
export const createError = (
  code: string,
  message: string,
  context?: Partial<ErrorContext>,
  severity: ApiError['severity'] = 'medium'
) => apiErrorService.createError(code, message, context, severity);

export const handleError = (error: ApiError) => apiErrorService.handleError(error);

export const validate = <T>(data: any, schema: ValidationSchema) => 
  apiErrorService.validate<T>(data, schema);

export const successResponse = <T>(data: T, metadata?: any) =>
  apiErrorService.successResponse(data, metadata);

export const errorResponse = (error: ApiError, validationErrors?: ValidationError[]) =>
  apiErrorService.errorResponse(error, validationErrors);

// Common error types
export const CommonErrors = {
  UNAUTHORIZED: () => createError(
    ApiErrorService.ERROR_CODES.UNAUTHORIZED,
    'You must be authenticated to access this resource',
    undefined,
    'medium'
  ),
  
  FORBIDDEN: () => createError(
    ApiErrorService.ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    'You do not have permission to access this resource',
    undefined,
    'medium'
  ),

  NOT_FOUND: (resource: string) => createError(
    ApiErrorService.ERROR_CODES.RESOURCE_NOT_FOUND,
    `${resource} not found`,
    undefined,
    'low'
  ),

  ALREADY_EXISTS: (resource: string) => createError(
    ApiErrorService.ERROR_CODES.RESOURCE_ALREADY_EXISTS,
    `${resource} already exists`,
    undefined,
    'low'
  ),

  RATE_LIMITED: () => createError(
    ApiErrorService.ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Please try again later',
    undefined,
    'medium'
  ),

  INTERNAL_ERROR: () => createError(
    ApiErrorService.ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An internal server error occurred',
    undefined,
    'high'
  )
};