import { useState, useEffect, useCallback } from 'react';
import type {
  AgentTask,
  Agent,
  TaskFilters,
  TaskSorting,
  TaskType,
  AgentStatus,
  AgentCapability
} from '../types/multiagent';
import { localMultiagentTaskService } from '../services/localMultiagentTaskService';
import { localMultiagentAgentService } from '../services/localMultiagentAgentService';

export interface UseMultiagentSystemOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  userId?: string;
}

export interface MultiagentSystemState {
  // Task data
  tasks: AgentTask[];
  selectedTask: AgentTask | null;
  taskMetrics: Record<string, unknown> | null;
  
  // Agent data
  agents: Agent[];
  selectedAgent: Agent | null;
  systemHealth: Record<string, unknown> | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Filters and sorting
  taskFilters: TaskFilters;
  taskSorting: TaskSorting;
}

export interface MultiagentSystemActions {
  // Task actions
  createTask: (taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AgentTask>;
  updateTask: (id: string, updates: Partial<AgentTask>) => Promise<void>;
  cancelTask: (id: string) => Promise<void>;
  retryTask: (id: string) => Promise<void>;
  setSelectedTask: (task: AgentTask | null) => void;
  
  // Agent actions
  findBestAgent: (taskType: TaskType, capabilities: AgentCapability[]) => Promise<Agent | null>;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
  setSelectedAgent: (agent: Agent | null) => void;
  
  // Filter and sort actions
  setTaskFilters: (filters: Partial<TaskFilters>) => void;
  setTaskSorting: (sorting: TaskSorting) => void;
  
  // Utility actions
  refresh: () => Promise<void>;
  clearError: () => void;
  initializeDemoData: () => void;
  clearAllData: () => void;
}

export const useMultiagentSystem = (
  options: UseMultiagentSystemOptions = {}
): [MultiagentSystemState, MultiagentSystemActions] => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    userId
  } = options;

  // State
  const [state, setState] = useState<MultiagentSystemState>({
    tasks: [],
    selectedTask: null,
    taskMetrics: null,
    agents: [],
    selectedAgent: null,
    systemHealth: null,
    loading: true,
    error: null,
    taskFilters: { userId },
    taskSorting: { field: 'createdAt', direction: 'desc' }
  });

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        tasks,
        taskMetrics,
        agents,
        systemHealth
      ] = await Promise.all([
        localMultiagentTaskService.listTasks(state.taskFilters, state.taskSorting),
        localMultiagentTaskService.getTaskMetrics(),
        localMultiagentAgentService.listAgents(),
        localMultiagentAgentService.getSystemHealth()
      ]);

      setState(prev => ({
        ...prev,
        tasks,
        taskMetrics,
        agents,
        systemHealth,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false
      }));
    }
  }, [state.taskFilters, state.taskSorting]);

  // Initialize and set up real-time updates
  useEffect(() => {
    // Initialize demo data if no data exists
    const initializeIfEmpty = async () => {
      const existingTasks = await localMultiagentTaskService.listTasks();
      const existingAgents = await localMultiagentAgentService.listAgents();
      
      if (existingTasks.length === 0) {
        localMultiagentTaskService.initializeDemoData();
      }
      
      if (existingAgents.length === 0) {
        localMultiagentAgentService.initializeDemoData();
      }
      
      // Load data after initialization
      await loadData();
    };

    initializeIfEmpty();

    // Subscribe to real-time updates
    const unsubscribeTask = localMultiagentTaskService.subscribeToTaskUpdates(() => {
      loadData();
    });

    const unsubscribeAgent = localMultiagentAgentService.subscribeToAgentUpdates(() => {
      loadData();
    });

    // Set up auto-refresh
    let refreshTimer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshTimer = setInterval(loadData, refreshInterval);
    }

    return () => {
      unsubscribeTask();
      unsubscribeAgent();
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [loadData, autoRefresh, refreshInterval]);

  // Actions
  const actions: MultiagentSystemActions = {
    // Task actions
    createTask: async (taskData) => {
      try {
        const task = await localMultiagentTaskService.createTask(taskData);
        await loadData(); // Refresh data
        return task;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to create task'
        }));
        throw error;
      }
    },

    updateTask: async (id, updates) => {
      try {
        await localMultiagentTaskService.updateTask(id, updates);
        await loadData(); // Refresh data
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to update task'
        }));
        throw error;
      }
    },

    cancelTask: async (id) => {
      try {
        await localMultiagentTaskService.cancelTask(id);
        await loadData(); // Refresh data
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to cancel task'
        }));
        throw error;
      }
    },

    retryTask: async (id) => {
      try {
        await localMultiagentTaskService.retryTask(id);
        await loadData(); // Refresh data
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to retry task'
        }));
        throw error;
      }
    },

    setSelectedTask: (task) => {
      setState(prev => ({ ...prev, selectedTask: task }));
    },

    // Agent actions
    findBestAgent: async (taskType, capabilities) => {
      try {
        return await localMultiagentAgentService.findBestAgent(taskType, capabilities);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to find agent'
        }));
        throw error;
      }
    },

    updateAgentStatus: async (id, status) => {
      try {
        await localMultiagentAgentService.updateAgentStatus(id, status);
        await loadData(); // Refresh data
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to update agent status'
        }));
        throw error;
      }
    },

    setSelectedAgent: (agent) => {
      setState(prev => ({ ...prev, selectedAgent: agent }));
    },

    // Filter and sort actions
    setTaskFilters: (filters) => {
      setState(prev => ({
        ...prev,
        taskFilters: { ...prev.taskFilters, ...filters }
      }));
    },

    setTaskSorting: (sorting) => {
      setState(prev => ({ ...prev, taskSorting: sorting }));
    },

    // Utility actions
    refresh: loadData,

    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    },

    initializeDemoData: () => {
      localMultiagentTaskService.initializeDemoData();
      localMultiagentAgentService.initializeDemoData();
      loadData();
    },

    clearAllData: () => {
      localMultiagentTaskService.clearAllData();
      localMultiagentAgentService.clearAllData();
      setState(prev => ({
        ...prev,
        tasks: [],
        agents: [],
        taskMetrics: null,
        systemHealth: null,
        selectedTask: null,
        selectedAgent: null
      }));
    }
  };

  return [state, actions];
};

// Helper hook for creating tasks with common patterns
export const useTaskCreation = () => {
  const [, actions] = useMultiagentSystem();

  const createMeditationContentTask = useCallback(async (
    userId: string,
    sessionType: string,
    duration: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    const taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'content_generation',
      status: 'pending',
      priority: 'medium',
      title: `Generate ${sessionType} meditation content`,
      description: `Create a ${duration}-minute ${sessionType} meditation session for ${difficulty} level`,
      context: {
        userId,
        parameters: {
          sessionType,
          duration,
          difficulty,
          language: 'id'
        },
        constraints: {
          maxDuration: 60000,
          culturalSensitivity: true,
          privacyLevel: 'private'
        }
      },
      metadata: {
        source: 'user_request',
        version: '1.0',
        tags: ['meditation', 'content', sessionType, difficulty],
        estimatedDuration: 30000,
        requiredCapabilities: ['content_generation', 'meditation_expertise', 'cultural_awareness'],
        culturalContext: 'indonesian'
      },
      dependencies: [],
      retryCount: 0,
      maxRetries: 3
    };

    return actions.createTask(taskData);
  }, [actions]);

  const createProgressAnalysisTask = useCallback(async (
    userId: string,
    timeframe: '7days' | '30days' | '90days'
  ) => {
    const taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'progress_analysis',
      status: 'pending',
      priority: 'low',
      title: 'Analyze meditation progress',
      description: `Analyze user progress over the last ${timeframe}`,
      context: {
        userId,
        parameters: {
          timeframe,
          includeInsights: true,
          includeTrends: true
        },
        constraints: {
          maxDuration: 45000,
          privacyLevel: 'private'
        }
      },
      metadata: {
        source: 'system_trigger',
        version: '1.0',
        tags: ['progress', 'analysis', 'insights'],
        estimatedDuration: 20000,
        requiredCapabilities: ['data_analysis', 'progress_tracking', 'pattern_recognition'],
        culturalContext: 'global'
      },
      dependencies: [],
      retryCount: 0,
      maxRetries: 3
    };

    return actions.createTask(taskData);
  }, [actions]);

  const createRecommendationTask = useCallback(async (
    userId: string,
    category: string,
    maxRecommendations: number = 5
  ) => {
    const taskData: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'recommendation',
      status: 'pending',
      priority: 'medium',
      title: 'Generate personalized recommendations',
      description: `Create ${maxRecommendations} personalized ${category} recommendations`,
      context: {
        userId,
        parameters: {
          category,
          maxRecommendations,
          includeReasons: true
        },
        constraints: {
          maxDuration: 25000,
          culturalSensitivity: true
        }
      },
      metadata: {
        source: 'user_request',
        version: '1.0',
        tags: ['recommendation', 'personalization', category],
        estimatedDuration: 15000,
        requiredCapabilities: ['recommendation_engine', 'personalization', 'user_behavior_analysis'],
        culturalContext: 'indonesian'
      },
      dependencies: [],
      retryCount: 0,
      maxRetries: 3
    };

    return actions.createTask(taskData);
  }, [actions]);

  return {
    createMeditationContentTask,
    createProgressAnalysisTask,
    createRecommendationTask
  };
};

// Helper hook for common agent operations
export const useAgentManagement = () => {
  const [, actions] = useMultiagentSystem();

  const findAgentForTask = useCallback(async (taskType: TaskType) => {
    const capabilityMap: Record<TaskType, AgentCapability[]> = {
      'content_generation': ['content_generation', 'meditation_expertise'],
      'progress_analysis': ['data_analysis', 'progress_tracking'],
      'recommendation': ['recommendation_engine', 'personalization'],
      'insight_generation': ['data_analysis', 'pattern_recognition'],
      'personalization': ['personalization', 'user_behavior_analysis'],
      'content_optimization': ['content_generation', 'quality_validation'],
      'user_assessment': ['data_analysis', 'emotional_intelligence'],
      'habit_analysis': ['data_analysis', 'habit_formation'],
      'emotional_analysis': ['emotional_intelligence', 'sentiment_analysis'],
      'siy_coaching': ['meditation_expertise', 'emotional_intelligence'],
      'cultural_adaptation': ['cultural_awareness', 'multilingual_support'],
      'social_ei_analysis': ['emotional_intelligence', 'social_skills'],
      'workplace_application': ['emotional_intelligence', 'mindfulness_coaching'],
      'session_optimization': ['content_generation', 'quality_validation'],
      'learning_path_creation': ['personalization', 'progress_tracking'],
      'community_insights': ['data_analysis', 'community_analysis'],
      'performance_analytics': ['data_analysis', 'predictive_analytics'],
      'content_moderation': ['content_generation', 'quality_validation'],
      'system_optimization': ['resource_optimization', 'performance_monitoring'],
      'data_sync': ['batch_processing', 'real_time_processing'],
      'notification_dispatch': ['notification_management', 'personalization']
    };

    const requiredCapabilities = capabilityMap[taskType] || [];
    return actions.findBestAgent(taskType, requiredCapabilities);
  }, [actions]);

  return {
    findAgentForTask
  };
};