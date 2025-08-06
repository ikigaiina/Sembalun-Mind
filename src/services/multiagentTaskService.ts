// Multiagent Task Service Implementation
// Core service for managing Claude Code multiagent tasks

import { typedSupabase as supabase } from '../config/supabase';
import type {
  AgentTask,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskContext,
  TaskMetadata,
  TaskResult,
  TaskError,
  TaskFilters,
  TaskSorting,
  TaskEvent,
  TaskService
} from '../types/multiagent';

export class MultiagentTaskService implements TaskService {
  private readonly tasksCollection = 'multiagent_tasks';
  private readonly eventsCollection = 'task_events';
  private listeners: Map<string, () => void> = new Map();

  /**
   * Create a new multiagent task
   */
  async createTask(
    taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AgentTask> {
    try {
      const now = new Date();
      const task: Omit<AgentTask, 'id'> = {
        ...taskData,
        createdAt: now,
        updatedAt: now,
        retryCount: 0,
        maxRetries: taskData.maxRetries || 3,
        status: 'pending' as TaskStatus
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from(this.tasksCollection)
        .insert({
          ...task,
          created_at: task.createdAt.toISOString(),
          updated_at: task.updatedAt.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create task');

      const createdTask: AgentTask = {
        ...task,
        id: data.id
      };

      // Emit task created event
      await this.emitTaskEvent('created', createdTask);

      // Trigger task routing
      await this.routeTask(createdTask);

      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    try {
      const { data: currentTaskData, error: fetchError } = await supabase
        .from(this.tasksCollection)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentTaskData) throw new Error(`Task with ID ${id} not found`);

      const currentTask = currentTaskData as AgentTask;
      
      // Prepare updates with timestamp
      const updatePayload: any = {
        ...updates,
        updated_at: new Date().toISOString() // Supabase uses ISO strings for timestamps
      };

      // Convert Date objects to ISO strings for Supabase
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] instanceof Date) {
          updatePayload[key] = updatePayload[key].toISOString();
        }
      });

      const { error: updateError } = await supabase
        .from(this.tasksCollection)
        .update(updatePayload)
        .eq('id', id);

      if (updateError) throw updateError;

      const updatedTask: AgentTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date()
      };

      // Emit task updated event
      await this.emitTaskEvent('updated', updatedTask);

      // Handle status-specific logic
      if (updates.status) {
        await this.handleStatusChange(updatedTask, updates.status);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<AgentTask | null> {
    try {
      const { data, error } = await supabase
        .from(this.tasksCollection)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        type: data.type,
        status: data.status,
        priority: data.priority,
        context: data.context,
        metadata: data.metadata,
        result: data.result,
        error: data.error,
        retryCount: data.retry_count,
        maxRetries: data.max_retries,
        assignedAgentId: data.assigned_agent_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        failedAt: data.failed_at ? new Date(data.failed_at) : undefined
      } as AgentTask;
    } catch (error) {
      console.error('Error getting task:', error);
      throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List tasks with optional filtering and sorting
   */
  async listTasks(filters?: TaskFilters, sorting?: TaskSorting): Promise<AgentTask[]> {
    try {
      let queryBuilder = supabase.from(this.tasksCollection).select('*');

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          queryBuilder = queryBuilder.in('status', filters.status);
        }
        if (filters.type && filters.type.length > 0) {
          queryBuilder = queryBuilder.in('type', filters.type);
        }
        if (filters.priority && filters.priority.length > 0) {
          queryBuilder = queryBuilder.in('priority', filters.priority);
        }
        if (filters.agentId) {
          queryBuilder = queryBuilder.eq('assigned_agent_id', filters.agentId);
        }
        if (filters.userId) {
          queryBuilder = queryBuilder.eq('context->>userId', filters.userId); // Assuming context is JSONB
        }
        if (filters.culturalContext) {
          queryBuilder = queryBuilder.eq('metadata->>culturalContext', filters.culturalContext); // Assuming metadata is JSONB
        }
        if (filters.dateRange) {
          queryBuilder = queryBuilder
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }
      }

      // Apply sorting
      if (sorting) {
        queryBuilder = queryBuilder.order(sorting.field, { ascending: sorting.direction === 'asc' });
      } else {
        // Default sorting by creation date (newest first)
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      // Limit results
      queryBuilder = queryBuilder.limit(100);

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        type: row.type,
        status: row.status,
        priority: row.priority,
        context: row.context,
        metadata: row.metadata,
        result: row.result,
        error: row.error,
        retryCount: row.retry_count,
        maxRetries: row.max_retries,
        assignedAgentId: row.assigned_agent_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
        startedAt: row.started_at ? new Date(row.started_at) : undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        failedAt: row.failed_at ? new Date(row.failed_at) : undefined
      })) as AgentTask[];
    } catch (error) {
      console.error('Error listing tasks:', error);
      throw new Error(`Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string): Promise<void> {
    try {
      const task = await this.getTask(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }

      if (['completed', 'failed', 'cancelled'].includes(task.status)) {
        throw new Error(`Cannot cancel task in ${task.status} status`);
      }

      await this.updateTask(id, {
        status: 'cancelled',
        completedAt: new Date()
      });

      // Emit cancellation event
      await this.emitTaskEvent('cancelled', { ...task, status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling task:', error);
      throw new Error(`Failed to cancel task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retry a failed task
   */
  async retryTask(id: string): Promise<AgentTask> {
    try {
      const task = await this.getTask(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }

      if (task.status !== 'failed') {
        throw new Error(`Can only retry failed tasks. Current status: ${task.status}`);
      }

      if (task.retryCount >= task.maxRetries) {
        throw new Error(`Task has exceeded maximum retry attempts (${task.maxRetries})`);
      }

      const retryTask = await this.updateTask(id, {
        status: 'pending',
        retryCount: task.retryCount + 1,
        error: undefined,
        failedAt: undefined,
        assignedAgentId: undefined
      });

      // Re-route the task
      await this.routeTask(retryTask);

      return retryTask;
    } catch (error) {
      console.error('Error retrying task:', error);
      throw new Error(`Failed to retry task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTaskUpdates(callback: (event: TaskEvent) => void): () => void {
    // Supabase Realtime for complex queries is typically handled via Row Level Security (RLS)
    // and direct table subscriptions. For a general 'events' collection, you'd subscribe
    // to inserts. If filtering is needed, it's often done client-side or via a backend function.
    // This is a simplified example subscribing to inserts on the events table.

    const channel = supabase.channel('task_events_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: this.eventsCollection },
        (payload) => {
          const eventData = payload.new as any;
          const event: TaskEvent = {
            type: eventData.type,
            taskId: eventData.task_id,
            data: eventData.data,
            agentId: eventData.agent_id,
            userId: eventData.user_id,
            timestamp: new Date(eventData.timestamp)
          };
          callback(event);
        }
      )
      .subscribe();

    const listenerId = Math.random().toString(36);
    this.listeners.set(listenerId, () => {
      supabase.removeChannel(channel);
    });

    return () => {
      supabase.removeChannel(channel);
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Get tasks assigned to a specific agent
   */
  async getAgentTasks(agentId: string): Promise<AgentTask[]> {
    return this.listTasks({ agentId }, { field: 'updatedAt', direction: 'desc' });
  }

  /**
   * Get tasks by user
   */
  async getUserTasks(userId: string): Promise<AgentTask[]> {
    return this.listTasks({ userId }, { field: 'createdAt', direction: 'desc' });
  }

  /**
   * Get pending tasks that need assignment
   */
  async getPendingTasks(): Promise<AgentTask[]> {
    return this.listTasks({ status: ['pending'] }, { field: 'priority', direction: 'desc' });
  }

  /**
   * Get system metrics for tasks
   */
  async getTaskMetrics(): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    byType: Record<TaskType, number>;
    byPriority: Record<TaskPriority, number>;
    averageExecutionTime: number;
    successRate: number;
  }> {
    try {
      const tasks = await this.listTasks();
      
      const metrics = {
        total: tasks.length,
        byStatus: {} as Record<TaskStatus, number>,
        byType: {} as Record<TaskType, number>,
        byPriority: {} as Record<TaskPriority, number>,
        averageExecutionTime: 0,
        successRate: 0
      };

      // Initialize counters
      const statuses: TaskStatus[] = ['pending', 'queued', 'assigned', 'in_progress', 'paused', 'completed', 'failed', 'cancelled', 'timeout', 'retrying'];
      const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
      
      statuses.forEach(status => metrics.byStatus[status] = 0);
      priorities.forEach(priority => metrics.byPriority[priority] = 0);

      let totalExecutionTime = 0;
      let completedTasks = 0;
      let successfulTasks = 0;

      tasks.forEach(task => {
        // Count by status
        metrics.byStatus[task.status]++;

        // Count by type
        if (!metrics.byType[task.type]) {
          metrics.byType[task.type] = 0;
        }
        metrics.byType[task.type]++;

        // Count by priority
        metrics.byPriority[task.priority]++;

        // Calculate execution time for completed tasks
        if (task.completedAt && task.startedAt) {
          const executionTime = task.completedAt.getTime() - task.startedAt.getTime();
          totalExecutionTime += executionTime;
          completedTasks++;

          if (task.status === 'completed') {
            successfulTasks++;
          }
        }
      });

      // Calculate averages
      metrics.averageExecutionTime = completedTasks > 0 ? totalExecutionTime / completedTasks : 0;
      metrics.successRate = completedTasks > 0 ? successfulTasks / completedTasks : 0;

      return metrics;
    } catch (error) {
      console.error('Error getting task metrics:', error);
      throw new Error(`Failed to get task metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cleanup completed tasks older than specified days
   */
  async cleanupOldTasks(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { count, error } = await supabase
        .from(this.tasksCollection)
        .delete()
        .in('status', ['completed', 'cancelled'])
        .lt('updated_at', cutoffDate.toISOString())
        .select('id', { count: 'exact' });

      if (error) throw error;
      
      console.log(`Cleaned up ${count || 0} old tasks`);
      
      return count || 0;
    } catch (error) {
      console.error('Error cleaning up old tasks:', error);
      throw new Error(`Failed to cleanup old tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private method to emit task events
   */
  private async emitTaskEvent(type: TaskEvent['type'], task: Partial<AgentTask>): Promise<void> {
    try {
      const event: Omit<TaskEvent, 'timestamp'> = {
        type,
        taskId: task.id!,
        data: task,
        agentId: task.assignedAgentId,
        userId: task.context?.userId
      };

      const { error } = await supabase
        .from(this.eventsCollection)
        .insert({
          type: event.type,
          task_id: event.taskId,
          data: event.data,
          agent_id: event.agentId,
          user_id: event.userId,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error emitting task event:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Private method to route task to appropriate agent
   */
  private async routeTask(task: AgentTask): Promise<void> {
    try {
      // This would integrate with the agent management system
      // For now, we'll just update the task status to queued
      await this.updateTask(task.id, {
        status: 'queued'
      });

      // TODO: Implement actual agent routing logic
      // - Find available agents with required capabilities
      // - Consider agent load and performance
      // - Handle cultural context requirements
      // - Assign task to optimal agent
    } catch (error) {
      console.error('Error routing task:', error);
      await this.updateTask(task.id, {
        status: 'failed',
        error: {
          code: 'ROUTING_ERROR',
          message: 'Failed to route task to agent',
          details: error,
          timestamp: new Date(),
          retryable: true,
          severity: 'medium',
          category: 'processing'
        }
      });
    }
  }

  /**
   * Private method to handle status changes
   */
  private async handleStatusChange(task: AgentTask, newStatus: TaskStatus): Promise<void> {
    try {
      switch (newStatus) {
        case 'in_progress':
          await this.emitTaskEvent('started', task);
          break;
        case 'completed':
          await this.emitTaskEvent('completed', task);
          break;
        case 'failed':
          await this.emitTaskEvent('failed', task);
          // Handle retry logic if applicable
          if (task.retryCount < task.maxRetries && task.error?.retryable) {
            setTimeout(() => {
              this.retryTask(task.id).catch(console.error);
            }, this.calculateRetryDelay(task.retryCount));
          }
          break;
        case 'cancelled':
          await this.emitTaskEvent('cancelled', task);
          break;
      }
    } catch (error) {
      console.error('Error handling status change:', error);
    }
  }

  /**
   * Calculate retry delay using exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Export singleton instance
export const multiagentTaskService = new MultiagentTaskService();