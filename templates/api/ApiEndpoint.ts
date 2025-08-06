import { supabase } from '../../config/supabase';
import type { 
  PostgrestError,
  PostgrestSingleResponse,
  PostgrestResponse 
} from '@supabase/supabase-js';

/**
 * ENDPOINT_NAME API Template
 * 
 * This is a base template for creating API endpoint handlers.
 * Replace ENDPOINT_NAME with your actual endpoint name (e.g., MeditationAPI, UserAPI).
 * 
 * Features included:
 * - Full TypeScript support
 * - Request/response validation
 * - Error handling and logging
 * - Rate limiting considerations
 * - Caching strategies
 * - Authentication checks
 * - Input sanitization
 * - Response formatting
 */

// TODO: Define your API types
interface ENDPOINT_REQUEST_TYPE {
  /** Request parameters */
  id?: string;
  /** Query filters */
  filters?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
  };
  /** Request body data */
  data?: {
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
  };
  /** Authentication token */
  token?: string;
}

interface ENDPOINT_RESPONSE_TYPE {
  /** Response data */
  data: ENDPOINT_DATA_TYPE | ENDPOINT_DATA_TYPE[] | null;
  /** Success status */
  success: boolean;
  /** Error message if any */
  error?: string;
  /** Response metadata */
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
  /** Response timestamp */
  timestamp: string;
}

// TODO: Define your data model
interface ENDPOINT_DATA_TYPE {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  user_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// TODO: Define error types
interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * ENDPOINT_NAME API Class
 * 
 * TODO: Add detailed API description
 * TODO: Document all available methods
 * TODO: Add usage examples and authentication requirements
 */
export class ENDPOINT_NAME_API {
  private readonly tableName = 'ENDPOINT_TABLE_NAME'; // TODO: Replace with actual table name
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  /**
   * Validate authentication token
   */
  private async validateAuth(token?: string): Promise<{ user_id: string; email: string } | null> {
    if (!token) {
      throw new APIError('AUTH_REQUIRED', 'Authentication token is required');
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new APIError('INVALID_TOKEN', 'Invalid authentication token');
      }

      return {
        user_id: user.id,
        email: user.email || ''
      };

    } catch (error) {
      console.error('Auth validation error:', error);
      throw new APIError('AUTH_ERROR', 'Authentication validation failed');
    }
  }

  /**
   * Validate request data
   */
  private validateRequest(request: ENDPOINT_REQUEST_TYPE): void {
    // TODO: Add request validation logic
    if (request.data) {
      if (!request.data.name || typeof request.data.name !== 'string') {
        throw new APIError('INVALID_DATA', 'Name is required and must be a string');
      }

      if (request.data.name.length > 255) {
        throw new APIError('INVALID_DATA', 'Name must be less than 255 characters');
      }
    }

    if (request.filters) {
      if (request.filters.limit && (request.filters.limit < 1 || request.filters.limit > 100)) {
        throw new APIError('INVALID_FILTERS', 'Limit must be between 1 and 100');
      }

      if (request.filters.offset && request.filters.offset < 0) {
        throw new APIError('INVALID_FILTERS', 'Offset must be non-negative');
      }
    }
  }

  /**
   * Sanitize input data
   */
  private sanitizeInput(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Basic HTML/SQL injection prevention
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/['";]/g, '')
          .trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check cache for data
   */
  private getCachedData(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Store data in cache
   */
  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Format success response
   */
  private formatResponse(
    data: ENDPOINT_DATA_TYPE | ENDPOINT_DATA_TYPE[] | null,
    metadata?: ENDPOINT_RESPONSE_TYPE['metadata']
  ): ENDPOINT_RESPONSE_TYPE {
    return {
      data,
      success: true,
      metadata,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format error response
   */
  private formatError(error: APIError | Error): ENDPOINT_RESPONSE_TYPE {
    const apiError = error instanceof APIError 
      ? error 
      : new APIError('INTERNAL_ERROR', error.message);

    return {
      data: null,
      success: false,
      error: apiError.message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET - Retrieve records
   */
  async get(request: ENDPOINT_REQUEST_TYPE): Promise<ENDPOINT_RESPONSE_TYPE> {
    try {
      console.log(`${this.tableName} GET request:`, request);

      // Validate request
      this.validateRequest(request);

      // Check authentication if required
      const auth = await this.validateAuth(request.token);

      // Check cache first
      const cacheKey = `get-${JSON.stringify(request.filters || {})}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${this.tableName}:`, cacheKey);
        return this.formatResponse(cachedData as ENDPOINT_DATA_TYPE[]);
      }

      // Build query
      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (request.filters) {
        const { search, status, limit = 50, offset = 0 } = request.filters;

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        if (status) {
          query = query.eq('status', status);
        }

        // Add user filter if authenticated
        if (auth) {
          query = query.eq('user_id', auth.user_id);
        }

        // Apply pagination
        query = query
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false });
      }

      // Execute query
      const { data, error, count }: PostgrestResponse<ENDPOINT_DATA_TYPE> = await query;

      if (error) {
        console.error(`${this.tableName} GET error:`, error);
        throw new APIError('DATABASE_ERROR', `Failed to retrieve ${this.tableName}: ${error.message}`);
      }

      // Cache the results
      this.setCachedData(cacheKey, data);

      // Format response with metadata
      const metadata = {
        total: count || data?.length || 0,
        page: Math.floor((request.filters?.offset || 0) / (request.filters?.limit || 50)) + 1,
        limit: request.filters?.limit || 50,
        hasMore: (data?.length || 0) === (request.filters?.limit || 50)
      };

      console.log(`${this.tableName} GET success:`, data?.length, 'records');
      return this.formatResponse(data || [], metadata);

    } catch (error) {
      console.error(`${this.tableName} GET error:`, error);
      return this.formatError(error as Error);
    }
  }

  /**
   * GET BY ID - Retrieve single record
   */
  async getById(id: string, token?: string): Promise<ENDPOINT_RESPONSE_TYPE> {
    try {
      console.log(`${this.tableName} GET BY ID:`, id);

      if (!id) {
        throw new APIError('INVALID_ID', 'ID is required');
      }

      // Check authentication if required
      const auth = await this.validateAuth(token);

      // Check cache first
      const cacheKey = `getById-${id}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${this.tableName}:`, cacheKey);
        return this.formatResponse(cachedData as ENDPOINT_DATA_TYPE);
      }

      // Build query
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id);

      // Add user filter if authenticated
      if (auth) {
        query = query.eq('user_id', auth.user_id);
      }

      const { data, error }: PostgrestSingleResponse<ENDPOINT_DATA_TYPE> = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new APIError('NOT_FOUND', `${this.tableName} not found`);
        }
        console.error(`${this.tableName} GET BY ID error:`, error);
        throw new APIError('DATABASE_ERROR', `Failed to retrieve ${this.tableName}: ${error.message}`);
      }

      // Cache the result
      this.setCachedData(cacheKey, data);

      console.log(`${this.tableName} GET BY ID success:`, id);
      return this.formatResponse(data);

    } catch (error) {
      console.error(`${this.tableName} GET BY ID error:`, error);
      return this.formatError(error as Error);
    }
  }

  /**
   * POST - Create new record
   */
  async post(request: ENDPOINT_REQUEST_TYPE): Promise<ENDPOINT_RESPONSE_TYPE> {
    try {
      console.log(`${this.tableName} POST request:`, request);

      // Validate request
      this.validateRequest(request);

      if (!request.data) {
        throw new APIError('INVALID_DATA', 'Request data is required');
      }

      // Check authentication
      const auth = await this.validateAuth(request.token);

      // Sanitize input data
      const sanitizedData = this.sanitizeInput(request.data);

      // Prepare data for insertion
      const insertData = {
        ...sanitizedData,
        user_id: auth.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Execute insertion
      const { data, error }: PostgrestSingleResponse<ENDPOINT_DATA_TYPE> = await supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error(`${this.tableName} POST error:`, error);
        throw new APIError('DATABASE_ERROR', `Failed to create ${this.tableName}: ${error.message}`);
      }

      if (!data) {
        throw new APIError('DATABASE_ERROR', `No data returned after creating ${this.tableName}`);
      }

      // Clear related cache
      this.cache.clear();

      console.log(`${this.tableName} POST success:`, data.id);
      return this.formatResponse(data);

    } catch (error) {
      console.error(`${this.tableName} POST error:`, error);
      return this.formatError(error as Error);
    }
  }

  /**
   * PUT - Update existing record
   */
  async put(id: string, request: ENDPOINT_REQUEST_TYPE): Promise<ENDPOINT_RESPONSE_TYPE> {
    try {
      console.log(`${this.tableName} PUT request:`, id, request);

      if (!id) {
        throw new APIError('INVALID_ID', 'ID is required');
      }

      // Validate request
      this.validateRequest(request);

      if (!request.data) {
        throw new APIError('INVALID_DATA', 'Request data is required');
      }

      // Check authentication
      const auth = await this.validateAuth(request.token);

      // Sanitize input data
      const sanitizedData = this.sanitizeInput(request.data);

      // Prepare data for update
      const updateData = {
        ...sanitizedData,
        updated_at: new Date().toISOString()
      };

      // Execute update
      let query = supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id);

      // Add user filter for security
      if (auth) {
        query = query.eq('user_id', auth.user_id);
      }

      const { data, error }: PostgrestSingleResponse<ENDPOINT_DATA_TYPE> = await query
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new APIError('NOT_FOUND', `${this.tableName} not found or access denied`);
        }
        console.error(`${this.tableName} PUT error:`, error);
        throw new APIError('DATABASE_ERROR', `Failed to update ${this.tableName}: ${error.message}`);
      }

      if (!data) {
        throw new APIError('DATABASE_ERROR', `No data returned after updating ${this.tableName}`);
      }

      // Clear related cache
      this.cache.clear();

      console.log(`${this.tableName} PUT success:`, id);
      return this.formatResponse(data);

    } catch (error) {
      console.error(`${this.tableName} PUT error:`, error);
      return this.formatError(error as Error);
    }
  }

  /**
   * DELETE - Remove record
   */
  async delete(id: string, token?: string): Promise<ENDPOINT_RESPONSE_TYPE> {
    try {
      console.log(`${this.tableName} DELETE request:`, id);

      if (!id) {
        throw new APIError('INVALID_ID', 'ID is required');
      }

      // Check authentication
      const auth = await this.validateAuth(token);

      // Execute deletion
      let query = supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      // Add user filter for security
      if (auth) {
        query = query.eq('user_id', auth.user_id);
      }

      const { error } = await query;

      if (error) {
        console.error(`${this.tableName} DELETE error:`, error);
        throw new APIError('DATABASE_ERROR', `Failed to delete ${this.tableName}: ${error.message}`);
      }

      // Clear related cache
      this.cache.clear();

      console.log(`${this.tableName} DELETE success:`, id);
      return this.formatResponse(null);

    } catch (error) {
      console.error(`${this.tableName} DELETE error:`, error);
      return this.formatError(error as Error);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log(`${this.tableName} cache cleared`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// TODO: Custom error class
class APIError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = 'APIError';
  }
}

// TODO: Export types and classes
export type {
  ENDPOINT_REQUEST_TYPE,
  ENDPOINT_RESPONSE_TYPE,
  ENDPOINT_DATA_TYPE,
  APIError
};

/**
 * Example Usage:
 * 
 * ```typescript
 * // Create API instance
 * const api = new ENDPOINT_NAME_API();
 * 
 * // GET all records
 * const response = await api.get({
 *   filters: { limit: 10, search: 'test' },
 *   token: 'user-auth-token'
 * });
 * 
 * // GET single record
 * const single = await api.getById('record-id', 'user-auth-token');
 * 
 * // POST new record
 * const created = await api.post({
 *   data: { name: 'New Record', status: 'active' },
 *   token: 'user-auth-token'
 * });
 * 
 * // PUT update record
 * const updated = await api.put('record-id', {
 *   data: { name: 'Updated Record' },
 *   token: 'user-auth-token'
 * });
 * 
 * // DELETE record
 * const deleted = await api.delete('record-id', 'user-auth-token');
 * ```
 */