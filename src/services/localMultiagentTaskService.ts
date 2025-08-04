// Local Multiagent Task Service Implementation
// Core service for managing Claude Code multiagent tasks using local storage for development

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

export class LocalMultiagentTaskService implements TaskService {
  private readonly TASKS_KEY = 'multiagent_tasks';
  private readonly EVENTS_KEY = 'task_events';
  private eventListeners: Set<(event: TaskEvent) => void> = new Set();

  /**
   * Get all tasks from local storage
   */
  private getTasks(): AgentTask[] {
    try {
      const stored = localStorage.getItem(this.TASKS_KEY);
      if (!stored) return [];
      
      const tasks = JSON.parse(stored);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        scheduledAt: task.scheduledAt ? new Date(task.scheduledAt) : undefined,
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        failedAt: task.failedAt ? new Date(task.failedAt) : undefined
      }));
    } catch (error) {
      console.error('Error getting tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * Save tasks to local storage
   */
  private saveTasks(tasks: AgentTask[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit task event to listeners
   */
  private emitEvent(type: TaskEvent['type'], task: Partial<AgentTask>): void {
    const event: TaskEvent = {
      type,
      taskId: task.id!,
      timestamp: new Date(),
      data: task,
      agentId: task.assignedAgentId,
      userId: task.context?.userId
    };

    // Store event in localStorage
    try {
      const events = JSON.parse(localStorage.getItem(this.EVENTS_KEY) || '[]');
      events.unshift(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(100);
      }
      
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error storing event:', error);
    }

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Create a new multiagent task
   */
  async createTask(
    taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AgentTask> {
    const now = new Date();
    const task: AgentTask = {
      ...taskData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      maxRetries: taskData.maxRetries || 3,
      status: 'pending' as TaskStatus
    };

    const tasks = this.getTasks();
    tasks.unshift(task);
    this.saveTasks(tasks);

    // Emit task created event
    this.emitEvent('created', task);

    // Simulate task routing delay
    setTimeout(() => {
      this.routeTask(task);
    }, 100);

    return task;
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const currentTask = tasks[taskIndex];
    const updatedTask: AgentTask = {
      ...currentTask,
      ...updates,
      updatedAt: new Date()
    };

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);

    // Emit task updated event
    this.emitEvent('updated', updatedTask);

    // Handle status-specific logic
    if (updates.status && updates.status !== currentTask.status) {
      this.handleStatusChange(updatedTask, updates.status);
    }

    return updatedTask;
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<AgentTask | null> {
    const tasks = this.getTasks();
    return tasks.find(t => t.id === id) || null;
  }

  /**
   * List tasks with optional filtering and sorting
   */
  async listTasks(filters?: TaskFilters, sorting?: TaskSorting): Promise<AgentTask[]> {
    let tasks = this.getTasks();

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        tasks = tasks.filter(task => filters.status!.includes(task.status));
      }
      if (filters.type && filters.type.length > 0) {
        tasks = tasks.filter(task => filters.type!.includes(task.type));
      }
      if (filters.priority && filters.priority.length > 0) {
        tasks = tasks.filter(task => filters.priority!.includes(task.priority));
      }
      if (filters.agentId) {
        tasks = tasks.filter(task => task.assignedAgentId === filters.agentId);
      }
      if (filters.userId) {
        tasks = tasks.filter(task => task.context?.userId === filters.userId);
      }
      if (filters.culturalContext) {
        tasks = tasks.filter(task => task.metadata.culturalContext === filters.culturalContext);
      }
      if (filters.dateRange) {
        tasks = tasks.filter(task => 
          task.createdAt >= filters.dateRange!.start && 
          task.createdAt <= filters.dateRange!.end
        );
      }
    }

    // Apply sorting
    if (sorting) {
      tasks.sort((a, b) => {
        let aVal: any = (a as any)[sorting.field];
        let bVal: any = (b as any)[sorting.field];

        // Handle date fields
        if (aVal instanceof Date) aVal = aVal.getTime();
        if (bVal instanceof Date) bVal = bVal.getTime();

        // Handle string comparisons
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sorting.direction === 'desc' 
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal);
        }

        // Handle numeric comparisons
        if (sorting.direction === 'desc') {
          return bVal - aVal;
        }
        return aVal - bVal;
      });
    } else {
      // Default sorting by creation date (newest first)
      tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return tasks.slice(0, 100); // Limit results
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string): Promise<void> {
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

    this.emitEvent('cancelled', { ...task, status: 'cancelled' });
  }

  /**
   * Retry a failed task
   */
  async retryTask(id: string): Promise<AgentTask> {
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
    setTimeout(() => {
      this.routeTask(retryTask);
    }, this.calculateRetryDelay(task.retryCount));

    return retryTask;
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTaskUpdates(callback: (event: TaskEvent) => void): () => void {
    this.eventListeners.add(callback);

    return () => {
      this.eventListeners.delete(callback);
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
  }

  /**
   * Cleanup completed tasks older than specified days
   */
  async cleanupOldTasks(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const tasks = this.getTasks();
    const oldTasks = tasks.filter(task => 
      ['completed', 'cancelled'].includes(task.status) &&
      task.updatedAt < cutoffDate
    );

    const remainingTasks = tasks.filter(task => 
      !oldTasks.some(oldTask => oldTask.id === task.id)
    );

    this.saveTasks(remainingTasks);
    
    console.log(`Cleaned up ${oldTasks.length} old tasks`);
    return oldTasks.length;
  }

  /**
   * Private method to simulate task routing
   */
  private async routeTask(task: AgentTask): Promise<void> {
    try {
      // Simulate routing delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Update task status to queued
      await this.updateTask(task.id, {
        status: 'queued'
      });

      // Simulate agent assignment
      setTimeout(async () => {
        // Simulate finding an agent
        const mockAgentId = `agent_${task.type}_${Math.random().toString(36).substr(2, 6)}`;
        
        await this.updateTask(task.id, {
          status: 'assigned',
          assignedAgentId: mockAgentId
        });

        // Simulate task execution
        setTimeout(async () => {
          await this.updateTask(task.id, {
            status: 'in_progress',
            startedAt: new Date()
          });

          // Simulate task completion or failure
          setTimeout(async () => {
            const shouldSucceed = Math.random() > 0.1; // 90% success rate
            
            if (shouldSucceed) {
              const result: TaskResult = {
                success: true,
                data: { message: 'Task completed successfully', result: 'Mock result data' },
                confidence: 0.8 + Math.random() * 0.2,
                qualityScore: 0.7 + Math.random() * 0.3,
                insights: ['Generated mock insight'],
                recommendations: ['Mock recommendation'],
                metadata: {
                  executionTime: 2000 + Math.random() * 5000,
                  agentId: mockAgentId,
                  processingSteps: ['Input validation', 'Processing', 'Output generation']
                }
              };

              await this.updateTask(task.id, {
                status: 'completed',
                completedAt: new Date(),
                result
              });
            } else {
              const error: TaskError = {
                code: 'PROCESSING_ERROR',
                message: 'Mock task processing error',
                details: { error: 'Simulated failure for testing' },
                timestamp: new Date(),
                agentId: mockAgentId,
                retryable: true,
                severity: 'medium',
                category: 'processing'
              };

              await this.updateTask(task.id, {
                status: 'failed',
                failedAt: new Date(),
                error
              });
            }
          }, 2000 + Math.random() * 3000); // 2-5 seconds execution time
        }, 500 + Math.random() * 1000); // 0.5-1.5 seconds to start
      }, 1000 + Math.random() * 2000); // 1-3 seconds to assign
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
  private handleStatusChange(task: AgentTask, newStatus: TaskStatus): void {
    switch (newStatus) {
      case 'in_progress':
        this.emitEvent('started', task);
        break;
      case 'completed':
        this.emitEvent('completed', task);
        break;
      case 'failed':
        this.emitEvent('failed', task);
        // Handle retry logic if applicable
        if (task.retryCount < task.maxRetries && task.error?.retryable) {
          setTimeout(() => {
            this.retryTask(task.id).catch(console.error);
          }, this.calculateRetryDelay(task.retryCount));
        }
        break;
      case 'cancelled':
        this.emitEvent('cancelled', task);
        break;
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
   * Initialize demo data for development
   */
  initializeDemoData(): void {
    const existingTasks = this.getTasks();
    if (existingTasks.length > 0) return; // Don't overwrite existing data

    const demoTasks: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        type: 'content_generation',
        status: 'completed',
        priority: 'high',
        title: 'Generate meditation session content',
        description: 'Create a 15-minute mindfulness meditation session for beginners',
        context: {
          userId: 'demo_user_1',
          parameters: { duration: 15, difficulty: 'beginner', type: 'mindfulness' },
          constraints: { maxDuration: 30000, culturalSensitivity: true }
        },
        metadata: {
          source: 'user_request',
          version: '1.0',
          tags: ['meditation', 'beginner', 'mindfulness'],
          estimatedDuration: 20000,
          requiredCapabilities: ['content_generation', 'meditation_expertise'],
          culturalContext: 'indonesian'
        },
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
        assignedAgentId: 'agent_content_specialist_001',
        startedAt: new Date(Date.now() - 300000),
        completedAt: new Date(Date.now() - 60000),
        result: {
          success: true,
          data: { sessionContent: 'Generated meditation content...', audioScript: 'Script content...' },
          confidence: 0.92,
          qualityScore: 0.88,
          metadata: {
            executionTime: 240000,
            agentId: 'agent_content_specialist_001',
            processingSteps: ['Content planning', 'Script generation', 'Quality review']
          }
        }
      },
      {
        type: 'progress_analysis',
        status: 'in_progress',
        priority: 'medium',
        title: 'Analyze user meditation progress',
        description: 'Analyze user progress patterns and provide insights',
        context: {
          userId: 'demo_user_2',
          parameters: { timeframe: '30days', includeInsights: true },
          constraints: { maxDuration: 15000, privacyLevel: 'private' }
        },
        metadata: {
          source: 'system_trigger',
          version: '1.0',
          tags: ['progress', 'analytics', 'insights'],
          estimatedDuration: 12000,
          requiredCapabilities: ['data_analysis', 'progress_tracking'],
          culturalContext: 'global'
        },
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
        assignedAgentId: 'agent_analytics_specialist_001',
        startedAt: new Date(Date.now() - 30000)
      },
      {
        type: 'recommendation',
        status: 'pending',
        priority: 'low',
        title: 'Generate personalized recommendations',
        description: 'Create personalized session recommendations based on user preferences',
        context: {
          userId: 'demo_user_3',
          parameters: { category: 'stress-reduction', maxRecommendations: 5 },
          constraints: { maxDuration: 10000 }
        },
        metadata: {
          source: 'scheduled',
          version: '1.0',
          tags: ['recommendation', 'personalization'],
          estimatedDuration: 8000,
          requiredCapabilities: ['recommendation_engine', 'personalization'],
          culturalContext: 'indonesian'
        },
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      }
    ];

    // Create demo tasks
    demoTasks.forEach(taskData => {
      this.createTask(taskData).catch(console.error);
    });

    console.log('Demo task data initialized');
  }

  /**
   * Clear all data (for development)
   */
  clearAllData(): void {
    localStorage.removeItem(this.TASKS_KEY);
    localStorage.removeItem(this.EVENTS_KEY);
    console.log('All task data cleared');
  }
}

// Export singleton instance
export const localMultiagentTaskService = new LocalMultiagentTaskService();