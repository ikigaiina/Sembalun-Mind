// Multiagent Task Service Implementation
// Core service for managing Claude Code multiagent tasks

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
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

      // Add to Firestore
      const docRef = await addDoc(collection(db, this.tasksCollection), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const createdTask: AgentTask = {
        ...task,
        id: docRef.id
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
      const taskRef = doc(db, this.tasksCollection, id);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        throw new Error(`Task with ID ${id} not found`);
      }

      const currentTask = { id: taskSnap.id, ...taskSnap.data() } as AgentTask;
      
      // Prepare updates with timestamp
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Convert Date objects to Timestamps for Firestore
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] instanceof Date) {
          (updateData as any)[key] = Timestamp.fromDate((updateData as any)[key] as Date);
        }
      });

      await updateDoc(taskRef, updateData);

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
      const taskRef = doc(db, this.tasksCollection, id);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        return null;
      }

      const data = taskSnap.data();
      return {
        id: taskSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        failedAt: data.failedAt?.toDate()
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
      let q: any = collection(db, this.tasksCollection);

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          q = query(q, where('status', 'in', filters.status));
        }
        if (filters.type && filters.type.length > 0) {
          q = query(q, where('type', 'in', filters.type));
        }
        if (filters.priority && filters.priority.length > 0) {
          q = query(q, where('priority', 'in', filters.priority));
        }
        if (filters.agentId) {
          q = query(q, where('assignedAgentId', '==', filters.agentId));
        }
        if (filters.userId) {
          q = query(q, where('context.userId', '==', filters.userId));
        }
        if (filters.culturalContext) {
          q = query(q, where('metadata.culturalContext', '==', filters.culturalContext));
        }
        if (filters.dateRange) {
          q = query(
            q,
            where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
            where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
          );
        }
      }

      // Apply sorting
      if (sorting) {
        q = query(q, orderBy(sorting.field, sorting.direction));
      } else {
        // Default sorting by creation date (newest first)
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Limit results to prevent overwhelming
      q = query(q, limit(100));

      const querySnapshot = await getDocs(q);
      const tasks: AgentTask[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          scheduledAt: data.scheduledAt?.toDate(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          failedAt: data.failedAt?.toDate()
        } as AgentTask);
      });

      return tasks;
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
    const eventsQuery = query(
      collection(db, this.eventsCollection),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const eventData = change.doc.data() as any;
          const event: TaskEvent = {
            ...eventData,
            timestamp: eventData.timestamp?.toDate() || new Date()
          };
          callback(event);
        }
      });
    });

    const listenerId = Math.random().toString(36);
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
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

      const oldTasksQuery = query(
        collection(db, this.tasksCollection),
        where('status', 'in', ['completed', 'cancelled']),
        where('updatedAt', '<', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(oldTasksQuery);
      let deletedCount = 0;

      // Delete in batches to avoid overwhelming Firestore
      const batchPromises: Promise<void>[] = [];
      querySnapshot.forEach((doc) => {
        batchPromises.push(deleteDoc(doc.ref));
        deletedCount++;
      });

      await Promise.all(batchPromises);
      console.log(`Cleaned up ${deletedCount} old tasks`);
      
      return deletedCount;
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

      await addDoc(collection(db, this.eventsCollection), {
        ...event,
        timestamp: serverTimestamp()
      });
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