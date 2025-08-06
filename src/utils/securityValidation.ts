/**
 * Security Validation Utilities
 * Comprehensive security validation functions for the Sembalun application
 */

import DOMPurify from 'dompurify';
import validator from 'validator';

// Security configuration constants
export const SECURITY_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_AGE_DAYS: 90,
    HISTORY_COUNT: 5,
  },
  SESSION: {
    MAX_IDLE_TIME: 30 * 60 * 1000, // 30 minutes
    MAX_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  },
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    PASSWORD_RESET: { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    API_REQUESTS: { max: 100, window: 60 * 1000 }, // 100 requests per minute
  },
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },
  CSP: {
    DIRECTIVES: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'https://*.supabase.co', 'https://*.googleapis.com'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },
} as const;

/**
 * Password Security Validation
 */
export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.PASSWORD.REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Password contains common patterns that are not secure');
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common and easily guessable');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static calculateStrength(password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // Bonus for good practices
    if (password.length >= 20) score += 1;
    if (/[^\w\s]/.test(password)) score += 1; // Non-standard symbols

    // Penalties
    if (this.hasCommonPatterns(password)) score -= 2;
    if (this.isCommonPassword(password)) score -= 3;
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters

    // Normalize score
    score = Math.max(0, Math.min(10, score));

    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 3) {
      level = 'weak';
      feedback.push('Consider using a longer password with mixed characters');
    } else if (score <= 5) {
      level = 'fair';
      feedback.push('Good start! Add more character variety for better security');
    } else if (score <= 7) {
      level = 'good';
      feedback.push('Strong password! Consider making it even longer');
    } else {
      level = 'strong';
      feedback.push('Excellent password security!');
    }

    return { score, level, feedback };
  }

  private static hasCommonPatterns(password: string): boolean {
    const patterns = [
      /123/,
      /abc/i,
      /qwe/i,
      /password/i,
      /admin/i,
      /user/i,
      /login/i,
      /\d{4,}/, // 4 or more consecutive digits
      /(.)\\1{3,}/, // 4 or more repeated characters
    ];

    return patterns.some(pattern => pattern.test(password));
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', '12345678',
      'qwerty', 'abc123', 'password1', '123456789', '12345',
      'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }
}

/**
 * Input Sanitization and Validation
 */
export class InputValidator {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  }

  static validateEmail(email: string): boolean {
    return validator.isEmail(email) && !this.isDisposableEmail(email);
  }

  static validatePhoneNumber(phone: string): boolean {
    return validator.isMobilePhone(phone, 'any', { strictMode: false });
  }

  static validateUrl(url: string): boolean {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    });
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  static validateJsonInput(input: string): { isValid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(input);
      
      // Check for potential JSON injection
      if (typeof data === 'string' && /__proto__|constructor|prototype/.test(data)) {
        return { isValid: false, error: 'Potentially malicious JSON detected' };
      }

      return { isValid: true, data };
    } catch (error) {
      return { isValid: false, error: 'Invalid JSON format' };
    }
  }

  private static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org',
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  static validateUserInput(input: {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    bio?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (input.displayName) {
      if (input.displayName.length < 2 || input.displayName.length > 50) {
        errors.displayName = 'Display name must be between 2 and 50 characters';
      }
      if (!/^[a-zA-Z0-9\s\u00C0-\u017F\u1E00-\u1EFF]+$/.test(input.displayName)) {
        errors.displayName = 'Display name contains invalid characters';
      }
    }

    if (input.email && !this.validateEmail(input.email)) {
      errors.email = 'Invalid email address or disposable email not allowed';
    }

    if (input.phoneNumber && !this.validatePhoneNumber(input.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    if (input.bio && input.bio.length > 500) {
      errors.bio = 'Bio must not exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

/**
 * Session Security Management
 */
export class SessionSecurity {
  private static sessions = new Map<string, {
    userId: string;
    createdAt: number;
    lastActivity: number;
    ipAddress: string;
    userAgent: string;
  }>();

  static createSession(userId: string, sessionId: string, metadata: {
    ipAddress: string;
    userAgent: string;
  }): void {
    const now = Date.now();
    this.sessions.set(sessionId, {
      userId,
      createdAt: now,
      lastActivity: now,
      ...metadata,
    });
  }

  static validateSession(sessionId: string): {
    isValid: boolean;
    reason?: 'expired' | 'idle' | 'not_found';
  } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { isValid: false, reason: 'not_found' };
    }

    const now = Date.now();
    
    // Check session age
    if (now - session.createdAt > SECURITY_CONFIG.SESSION.MAX_DURATION) {
      this.sessions.delete(sessionId);
      return { isValid: false, reason: 'expired' };
    }

    // Check idle time
    if (now - session.lastActivity > SECURITY_CONFIG.SESSION.MAX_IDLE_TIME) {
      this.sessions.delete(sessionId);
      return { isValid: false, reason: 'idle' };
    }

    return { isValid: true };
  }

  static updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  static revokeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  static revokeAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  static getActiveSessions(userId: string): Array<{
    sessionId: string;
    createdAt: number;
    lastActivity: number;
    ipAddress: string;
    userAgent: string;
  }> {
    const userSessions: any[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        userSessions.push({
          sessionId,
          ...session,
        });
      }
    }

    return userSessions.sort((a, b) => b.lastActivity - a.lastActivity);
  }
}

/**
 * Rate Limiting
 */
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, config: { max: number; window: number }): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + config.window });
      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime: now + config.window,
      };
    }

    if (record.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: config.max - record.count,
      resetTime: record.resetTime,
    };
  }

  static resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }

  static getLoginAttempts(identifier: string): number {
    const record = this.attempts.get(`login:${identifier}`);
    return record ? record.count : 0;
  }
}

/**
 * Security Headers Validator
 */
export class SecurityHeaders {
  static validateHeaders(headers: Record<string, string>): {
    isSecure: boolean;
    missing: string[];
    warnings: string[];
  } {
    const missing: string[] = [];
    const warnings: string[] = [];

    const requiredHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };

    for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
      if (!headers[header]) {
        missing.push(header);
      } else if (headers[header] !== expectedValue) {
        warnings.push(`${header} has unexpected value: ${headers[header]}`);
      }
    }

    // Check for HTTPS enforcement
    if (!headers['Strict-Transport-Security']) {
      missing.push('Strict-Transport-Security');
    }

    // Check for CSP
    if (!headers['Content-Security-Policy']) {
      missing.push('Content-Security-Policy');
    }

    return {
      isSecure: missing.length === 0,
      missing,
      warnings,
    };
  }

  static generateCSP(): string {
    const directives = SECURITY_CONFIG.CSP.DIRECTIVES;
    
    return Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}

/**
 * Audit Logging
 */
export class SecurityAuditLogger {
  private static logs: Array<{
    timestamp: number;
    event: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    details: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  static log(event: string, details: any, options: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  } = {}): void {
    this.logs.push({
      timestamp: Date.now(),
      event,
      details,
      severity: options.severity || 'low',
      ...options,
    });

    // In production, send to external logging service
    if (options.severity === 'critical' || options.severity === 'high') {
      console.error('Security Alert:', { event, details, ...options });
    }
  }

  static getRecentLogs(limit: number = 100): typeof SecurityAuditLogger.logs {
    return this.logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  static getLogsByUser(userId: string): typeof SecurityAuditLogger.logs {
    return this.logs.filter(log => log.userId === userId);
  }

  static getSecurityAlerts(): typeof SecurityAuditLogger.logs {
    return this.logs.filter(log => 
      log.severity === 'high' || log.severity === 'critical'
    );
  }
}

/**
 * Data Encryption Utilities (Enhanced)
 */
export class EnhancedEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptData(
    data: string,
    key: CryptoKey
  ): Promise<{ encrypted: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encodedData = this.encoder.encode(data);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  static async decryptData(
    encryptedData: string,
    iv: string,
    key: CryptoKey
  ): Promise<string> {
    const encrypted = this.base64ToArrayBuffer(encryptedData);
    const ivBuffer = this.base64ToArrayBuffer(iv);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      encrypted
    );

    return this.decoder.decode(decrypted);
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static async hashPassword(password: string, salt?: string): Promise<{
    hash: string;
    salt: string;
  }> {
    const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));
    const saltString = typeof actualSalt === 'string' ? actualSalt : this.arrayBufferToBase64(actualSalt);
    
    const passwordBuffer = this.encoder.encode(password + saltString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    
    return {
      hash: this.arrayBufferToBase64(hashBuffer),
      salt: saltString,
    };
  }

  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }
}

export default {
  PasswordValidator,
  InputValidator,
  SessionSecurity,
  RateLimiter,
  SecurityHeaders,
  SecurityAuditLogger,
  EnhancedEncryption,
  SECURITY_CONFIG,
};