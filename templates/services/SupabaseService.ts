import { supabase } from '../config/supabase';
import type { 
  PostgrestError,
  PostgrestSingleResponse,
  PostgrestResponse 
} from '@supabase/supabase-js';

/**
 * SERVICE_NAME Service Template
 * 
 * This is a base template for creating new Supabase service classes.
 * Replace SERVICE_NAME with your actual service name (e.g., UserService, MeditationService).
 * 
 * Features included:
 * - Full TypeScript support
 * - Error handling and logging
 * - CRUD operations template
 * - Real-time subscriptions
 * - Caching strategies
 * - Offline support considerations
 */

// TODO: Define your data types
interface SERVICE_DATA_TYPE {
  id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  // Add your specific fields here
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  metadata?: Record<string, unknown>;
}

// TODO: Define your service options
interface SERVICE_NAME_Options {
  enableCache?: boolean;
  enableRealtime?: boolean;
  batchSize?: number;
}

// TODO: Define your filter/query options
interface SERVICE_NAME_Filters {
  user_id?: string;
  status?: SERVICE_DATA_TYPE['status'];
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: keyof SERVICE_DATA_TYPE;
  order_direction?: 'asc' | 'desc';
}

/**
 * SERVICE_NAME Service Class
 * 
 * TODO: Add detailed service description
 * TODO: Document all public methods
 * TODO: Add usage examples
 */
export class SERVICE_NAME_Service {
  private readonly tableName = 'SERVICE_TABLE_NAME'; // TODO: Replace with actual table name
  private cache: Map<string, SERVICE_DATA_TYPE> = new Map();
  private options: SERVICE_NAME_Options;

  constructor(options: SERVICE_NAME_Options = {}) {
    this.options = {
      enableCache: true,
      enableRealtime: false,
      batchSize: 50,
      ...options
    };

    // Initialize real-time subscriptions if enabled
    if (this.options.enableRealtime) {
      this.initializeRealtime();
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<SERVICE_DATA_TYPE, 'id' | 'created_at' | 'updated_at'>): Promise<SERVICE_DATA_TYPE> {
    try {
      console.log(`Creating new ${this.tableName} record:`, data);

      const { data: result, error }: PostgrestSingleResponse<SERVICE_DATA_TYPE> = await supabase
        .from(this.tableName)
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error(`Error creating ${this.tableName}:`, error);
        throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
      }

      if (!result) {
        throw new Error(`No data returned after creating ${this.tableName}`);
      }

      // Update cache if enabled
      if (this.options.enableCache) {
        this.cache.set(result.id, result);
      }

      console.log(`Successfully created ${this.tableName}:`, result.id);
      return result;

    } catch (error) {
      console.error(`SERVICE_NAME_Service.create error:`, error);
      throw error;
    }
  }

  /**
   * Get a record by ID
   */
  async getById(id: string): Promise<SERVICE_DATA_TYPE | null> {
    try {
      // Check cache first
      if (this.options.enableCache && this.cache.has(id)) {
        console.log(`Cache hit for ${this.tableName}:`, id);
        return this.cache.get(id)!;
      }

      console.log(`Fetching ${this.tableName} by ID:`, id);

      const { data, error }: PostgrestSingleResponse<SERVICE_DATA_TYPE> = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`${this.tableName} not found:`, id);
          return null;
        }
        console.error(`Error fetching ${this.tableName}:`, error);
        throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
      }

      // Update cache if enabled
      if (this.options.enableCache && data) {
        this.cache.set(data.id, data);
      }

      return data;

    } catch (error) {
      console.error(`SERVICE_NAME_Service.getById error:`, error);
      throw error;
    }
  }

  /**
   * Get multiple records with filters
   */
  async getMany(filters: SERVICE_NAME_Filters = {}): Promise<SERVICE_DATA_TYPE[]> {
    try {
      console.log(`Fetching ${this.tableName} records with filters:`, filters);

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply ordering
      const orderBy = filters.order_by || 'created_at';
      const orderDirection = filters.order_direction || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error }: PostgrestResponse<SERVICE_DATA_TYPE> = await query;

      if (error) {
        console.error(`Error fetching ${this.tableName} records:`, error);
        throw new Error(`Failed to fetch ${this.tableName} records: ${error.message}`);
      }

      // Update cache if enabled
      if (this.options.enableCache && data) {
        data.forEach(item => this.cache.set(item.id, item));
      }

      console.log(`Successfully fetched ${data?.length || 0} ${this.tableName} records`);
      return data || [];

    } catch (error) {
      console.error(`SERVICE_NAME_Service.getMany error:`, error);
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id: string, updates: Partial<Omit<SERVICE_DATA_TYPE, 'id' | 'created_at'>>): Promise<SERVICE_DATA_TYPE> {
    try {
      console.log(`Updating ${this.tableName}:`, id, updates);

      const { data, error }: PostgrestSingleResponse<SERVICE_DATA_TYPE> = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${this.tableName}:`, error);
        throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
      }

      if (!data) {
        throw new Error(`No data returned after updating ${this.tableName}`);
      }

      // Update cache if enabled
      if (this.options.enableCache) {
        this.cache.set(data.id, data);
      }

      console.log(`Successfully updated ${this.tableName}:`, id);
      return data;

    } catch (error) {
      console.error(`SERVICE_NAME_Service.update error:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`Deleting ${this.tableName}:`, id);

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting ${this.tableName}:`, error);
        throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
      }

      // Remove from cache if enabled
      if (this.options.enableCache) {
        this.cache.delete(id);
      }

      console.log(`Successfully deleted ${this.tableName}:`, id);

    } catch (error) {
      console.error(`SERVICE_NAME_Service.delete error:`, error);
      throw error;
    }
  }

  /**
   * Initialize real-time subscriptions
   */
  private initializeRealtime(): void {
    console.log(`Initializing real-time subscriptions for ${this.tableName}`);
    
    supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName
        },
        (payload) => {
          console.log(`Real-time update for ${this.tableName}:`, payload);
          
          // Update cache based on the event
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as SERVICE_DATA_TYPE;
            if (this.options.enableCache) {
              this.cache.set(newData.id, newData);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as SERVICE_DATA_TYPE;
            if (this.options.enableCache) {
              this.cache.delete(oldData.id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${this.tableName}:`, status);
      });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log(`Cache cleared for ${this.tableName}`);
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

  /**
   * Batch operations (TODO: Implement based on your needs)
   */
  async batchCreate(items: Omit<SERVICE_DATA_TYPE, 'id' | 'created_at' | 'updated_at'>[]): Promise<SERVICE_DATA_TYPE[]> {
    // TODO: Implement batch create
    throw new Error('Batch create not implemented');
  }

  async batchUpdate(updates: Array<{ id: string; data: Partial<SERVICE_DATA_TYPE> }>): Promise<SERVICE_DATA_TYPE[]> {
    // TODO: Implement batch update
    throw new Error('Batch update not implemented');
  }

  async batchDelete(ids: string[]): Promise<void> {
    // TODO: Implement batch delete
    throw new Error('Batch delete not implemented');
  }
}

// TODO: Export types for use in other modules
export type {
  SERVICE_DATA_TYPE,
  SERVICE_NAME_Options,
  SERVICE_NAME_Filters
};

/**
 * Example Usage:
 * 
 * ```typescript
 * // Create service instance
 * const serviceNameService = new SERVICE_NAME_Service({
 *   enableCache: true,
 *   enableRealtime: true
 * });
 * 
 * // Create a new record
 * const newRecord = await serviceNameService.create({
 *   name: 'Example Record',
 *   status: 'active',
 *   user_id: 'user-123'
 * });
 * 
 * // Get record by ID
 * const record = await serviceNameService.getById(newRecord.id);
 * 
 * // Get multiple records with filters
 * const records = await serviceNameService.getMany({
 *   user_id: 'user-123',
 *   status: 'active',
 *   limit: 10
 * });
 * 
 * // Update record
 * const updated = await serviceNameService.update(record.id, {
 *   name: 'Updated Name'
 * });
 * 
 * // Delete record
 * await serviceNameService.delete(record.id);
 * ```
 */