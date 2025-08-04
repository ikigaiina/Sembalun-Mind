// Local Multiagent Agent Service Implementation
// Service for managing multiagent system agents using local storage for development

import type {
  Agent,
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentPerformance,
  AgentConfiguration,
  AgentEvent,
  AgentService,
  TaskType
} from '../types/multiagent';

export class LocalMultiagentAgentService implements AgentService {
  private readonly AGENTS_KEY = 'multiagent_agents';
  private readonly PERFORMANCE_KEY = 'agent_performance';
  private readonly EVENTS_KEY = 'agent_events';
  private eventListeners: Set<(event: AgentEvent) => void> = new Set();

  /**
   * Get all agents from local storage
   */
  private getAgents(): Agent[] {
    try {
      const stored = localStorage.getItem(this.AGENTS_KEY);
      if (!stored) return [];
      
      const agents = JSON.parse(stored);
      return agents.map((agent: any) => ({
        ...agent,
        createdAt: new Date(agent.createdAt),
        lastActiveAt: new Date(agent.lastActiveAt)
      }));
    } catch (error) {
      console.error('Error getting agents from localStorage:', error);
      return [];
    }
  }

  /**
   * Save agents to local storage
   */
  private saveAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
    } catch (error) {
      console.error('Error saving agents to localStorage:', error);
    }
  }

  /**
   * Get performance data from local storage
   */
  private getPerformanceData(): Record<string, AgentPerformance> {
    try {
      const stored = localStorage.getItem(this.PERFORMANCE_KEY);
      if (!stored) return {};
      
      const performance = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(performance).forEach(agentId => {
        if (performance[agentId].lastEvaluated) {
          performance[agentId].lastEvaluated = new Date(performance[agentId].lastEvaluated);
        }
      });
      
      return performance;
    } catch (error) {
      console.error('Error getting performance data from localStorage:', error);
      return {};
    }
  }

  /**
   * Save performance data to local storage
   */
  private savePerformanceData(performance: Record<string, AgentPerformance>): void {
    try {
      localStorage.setItem(this.PERFORMANCE_KEY, JSON.stringify(performance));
    } catch (error) {
      console.error('Error saving performance data to localStorage:', error);
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit agent event to listeners
   */
  private emitEvent(type: AgentEvent['type'], agent: Partial<Agent>): void {
    const event: AgentEvent = {
      type,
      agentId: agent.id!,
      timestamp: new Date(),
      data: agent
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
      console.error('Error storing agent event:', error);
    }

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in agent event listener:', error);
      }
    });
  }

  /**
   * Register a new agent in the system
   */
  async registerAgent(
    agentData: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt'>
  ): Promise<Agent> {
    const now = new Date();
    const agent: Agent = {
      ...agentData,
      id: this.generateId(),
      createdAt: now,
      lastActiveAt: now,
      currentLoad: 0,
      assignedTasks: [],
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0
    };

    const agents = this.getAgents();
    agents.push(agent);
    this.saveAgents(agents);

    // Initialize performance tracking
    this.initializeAgentPerformance(agent.id);

    // Emit agent registered event
    this.emitEvent('registered', agent);

    return agent;
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
    const agents = this.getAgents();
    const agentIndex = agents.findIndex(a => a.id === id);

    if (agentIndex === -1) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    const agent = agents[agentIndex];
    agent.status = status;
    agent.lastActiveAt = new Date();

    agents[agentIndex] = agent;
    this.saveAgents(agents);

    // Emit status change event
    this.emitEvent('status_changed', agent);

    // Handle status-specific logic
    this.handleStatusChange(agent, status);
  }

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<Agent | null> {
    const agents = this.getAgents();
    return agents.find(a => a.id === id) || null;
  }

  /**
   * List agents with optional type filtering
   */
  async listAgents(type?: AgentType): Promise<Agent[]> {
    let agents = this.getAgents();

    if (type) {
      agents = agents.filter(agent => agent.type === type);
    }

    // Sort by last active time (most recent first)
    agents.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());

    return agents;
  }

  /**
   * Assign a task to an agent
   */
  async assignTask(agentId: string, taskId: string): Promise<void> {
    const agents = this.getAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    const agent = agents[agentIndex];

    if (agent.status !== 'active' && agent.status !== 'idle') {
      throw new Error(`Cannot assign task to agent in ${agent.status} status`);
    }

    if (agent.assignedTasks.length >= agent.maxConcurrentTasks) {
      throw new Error(`Agent has reached maximum concurrent tasks (${agent.maxConcurrentTasks})`);
    }

    // Update agent with new task assignment
    agent.assignedTasks.push(taskId);
    agent.currentLoad = Math.round((agent.assignedTasks.length / agent.maxConcurrentTasks) * 100);
    agent.status = agent.currentLoad > 0 ? 'busy' : 'idle';
    agent.lastActiveAt = new Date();

    agents[agentIndex] = agent;
    this.saveAgents(agents);

    // Emit task assignment event
    this.emitEvent('task_assigned', agent);
  }

  /**
   * Unassign a task from an agent
   */
  async unassignTask(agentId: string, taskId: string): Promise<void> {
    const agents = this.getAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    const agent = agents[agentIndex];
    agent.assignedTasks = agent.assignedTasks.filter(id => id !== taskId);
    agent.currentLoad = Math.round((agent.assignedTasks.length / agent.maxConcurrentTasks) * 100);
    agent.status = agent.currentLoad > 0 ? 'busy' : 'idle';
    agent.lastActiveAt = new Date();

    // Update task completion counter
    agent.completedTasks++;

    agents[agentIndex] = agent;
    this.saveAgents(agents);

    // Emit task completion event
    this.emitEvent('task_completed', agent);
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(id: string): Promise<AgentPerformance> {
    const performanceData = this.getPerformanceData();
    
    if (!performanceData[id]) {
      // Initialize if not exists
      this.initializeAgentPerformance(id);
      return this.getAgentPerformance(id);
    }

    return performanceData[id];
  }

  /**
   * Subscribe to agent updates
   */
  subscribeToAgentUpdates(callback: (event: AgentEvent) => void): () => void {
    this.eventListeners.add(callback);

    return () => {
      this.eventListeners.delete(callback);
    };
  }

  /**
   * Find the best agent for a specific task type
   */
  async findBestAgent(taskType: TaskType, capabilities: AgentCapability[]): Promise<Agent | null> {
    const agents = await this.listAgents();
    
    // Filter agents that can handle the task type and have required capabilities
    const suitableAgents = agents.filter(agent => {
      return (
        agent.status === 'active' || agent.status === 'idle'
      ) && (
        agent.specializations.includes(taskType) ||
        capabilities.every(cap => agent.capabilities.includes(cap))
      ) && (
        agent.currentLoad < 100
      );
    });

    if (suitableAgents.length === 0) {
      return null;
    }

    const performanceData = this.getPerformanceData();

    // Score agents based on various factors
    const scoredAgents = suitableAgents.map(agent => {
      const performance = performanceData[agent.id] || this.createDefaultPerformance();
      
      // Calculate composite score
      const loadScore = (100 - agent.currentLoad) / 100; // Lower load is better
      const performanceScore = (
        performance.successRate * 0.3 +
        performance.qualityScore * 0.3 +
        performance.efficiencyRating * 0.2 +
        performance.userSatisfactionScore * 0.2
      );
      const experienceScore = agent.specializations.includes(taskType) ? 1.0 : 0.5;
      const responseTimeScore = Math.max(0, 1 - (performance.averageResponseTime / 10000)); // Normalize to 10s

      const totalScore = (
        loadScore * 0.25 +
        performanceScore * 0.4 +
        experienceScore * 0.25 +
        responseTimeScore * 0.1
      );

      return { agent, score: totalScore };
    });

    // Sort by score (highest first) and return the best agent
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0].agent;
  }

  /**
   * Get agents by capability
   */
  async getAgentsByCapability(capability: AgentCapability): Promise<Agent[]> {
    const agents = await this.listAgents();
    return agents.filter(agent => agent.capabilities.includes(capability));
  }

  /**
   * Get system health metrics for all agents
   */
  async getSystemHealth(): Promise<{
    totalAgents: number;
    activeAgents: number;
    averageLoad: number;
    healthScore: number;
    agentsByStatus: Record<AgentStatus, number>;
    agentsByType: Record<AgentType, number>;
  }> {
    const agents = await this.listAgents();
    
    const metrics = {
      totalAgents: agents.length,
      activeAgents: 0,
      averageLoad: 0,
      healthScore: 0,
      agentsByStatus: {} as Record<AgentStatus, number>,
      agentsByType: {} as Record<AgentType, number>
    };

    // Initialize counters
    const statuses: AgentStatus[] = ['active', 'busy', 'idle', 'maintenance', 'error', 'offline', 'overloaded', 'degraded'];
    statuses.forEach(status => metrics.agentsByStatus[status] = 0);

    let totalLoad = 0;
    let healthSum = 0;

    agents.forEach(agent => {
      // Count by status
      metrics.agentsByStatus[agent.status]++;

      // Count by type
      if (!metrics.agentsByType[agent.type]) {
        metrics.agentsByType[agent.type] = 0;
      }
      metrics.agentsByType[agent.type]++;

      // Calculate active agents
      if (agent.status === 'active' || agent.status === 'busy' || agent.status === 'idle') {
        metrics.activeAgents++;
      }

      // Sum load for average calculation
      totalLoad += agent.currentLoad;

      // Calculate health score (simple heuristic)
      let agentHealth = 1.0;
      if (agent.status === 'error') agentHealth = 0.0;
      else if (agent.status === 'offline') agentHealth = 0.0;
      else if (agent.status === 'overloaded') agentHealth = 0.3;
      else if (agent.status === 'degraded') agentHealth = 0.6;
      else if (agent.status === 'maintenance') agentHealth = 0.5;
      
      healthSum += agentHealth;
    });

    // Calculate averages
    metrics.averageLoad = agents.length > 0 ? totalLoad / agents.length : 0;
    metrics.healthScore = agents.length > 0 ? healthSum / agents.length : 0;

    return metrics;
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfiguration(id: string, config: Partial<AgentConfiguration>): Promise<void> {
    const agents = this.getAgents();
    const agentIndex = agents.findIndex(a => a.id === id);

    if (agentIndex === -1) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    const agent = agents[agentIndex];
    agent.configuration = { ...agent.configuration, ...config };
    agent.lastActiveAt = new Date();

    agents[agentIndex] = agent;
    this.saveAgents(agents);
  }

  /**
   * Deregister an agent
   */
  async deregisterAgent(id: string): Promise<void> {
    const agent = await this.getAgent(id);
    if (!agent) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    if (agent.assignedTasks.length > 0) {
      throw new Error(`Cannot deregister agent with active tasks. Current tasks: ${agent.assignedTasks.length}`);
    }

    // Mark agent as offline first
    await this.updateAgentStatus(id, 'offline');

    // Remove from agents list
    const agents = this.getAgents();
    const filteredAgents = agents.filter(a => a.id !== id);
    this.saveAgents(filteredAgents);

    // Remove performance data
    const performanceData = this.getPerformanceData();
    delete performanceData[id];
    this.savePerformanceData(performanceData);

    // Emit offline event
    this.emitEvent('offline', agent);
  }

  /**
   * Initialize agent performance tracking
   */
  private initializeAgentPerformance(agentId: string): void {
    const performanceData = this.getPerformanceData();
    
    if (!performanceData[agentId]) {
      performanceData[agentId] = this.createDefaultPerformance();
      this.savePerformanceData(performanceData);
    }
  }

  /**
   * Create default performance metrics
   */
  private createDefaultPerformance(): AgentPerformance {
    return {
      averageResponseTime: 2000 + Math.random() * 3000, // 2-5 seconds
      successRate: 0.85 + Math.random() * 0.15, // 85-100%
      qualityScore: 0.75 + Math.random() * 0.25, // 75-100%
      userSatisfactionScore: 0.8 + Math.random() * 0.2, // 80-100%
      efficiencyRating: 0.7 + Math.random() * 0.3, // 70-100%
      culturalAdaptationScore: 0.8 + Math.random() * 0.2, // 80-100%
      lastEvaluated: new Date(),
      trends: {
        responseTime: [],
        successRate: [],
        qualityScores: []
      },
      competencyAreas: {} as Record<TaskType, number>
    };
  }

  /**
   * Handle status changes
   */
  private handleStatusChange(agent: Agent, newStatus: AgentStatus): void {
    switch (newStatus) {
      case 'error':
        // Handle error state
        if (agent.assignedTasks.length > 0) {
          console.warn(`Agent ${agent.id} went into error state with ${agent.assignedTasks.length} active tasks`);
        }
        break;
      case 'offline':
        this.emitEvent('offline', agent);
        break;
      case 'overloaded':
        console.warn(`Agent ${agent.id} is overloaded with load: ${agent.currentLoad}%`);
        break;
    }
  }

  /**
   * Initialize demo data for development
   */
  initializeDemoData(): void {
    const existingAgents = this.getAgents();
    if (existingAgents.length > 0) return; // Don't overwrite existing data

    const demoAgents: any[] = [
      {
        name: 'Content Specialist Alpha',
        type: 'content_specialist',
        status: 'active',
        capabilities: ['content_generation', 'natural_language_processing', 'meditation_expertise', 'cultural_awareness'],
        specializations: ['content_generation', 'siy_coaching'],
        performance: this.createDefaultPerformance(),
        configuration: {
          modelSettings: {
            model: 'claude-3.5-sonnet',
            temperature: 0.7,
            maxTokens: 4000,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
          },
          behaviorSettings: {
            responseStyle: 'detailed',
            culturalSensitivity: 0.9,
            creativityLevel: 0.8,
            conservativeness: 0.7
          },
          resourceLimits: {
            maxMemoryUsage: 512,
            maxCpuUsage: 80,
            maxExecutionTime: 30000,
            maxConcurrentTasks: 3
          },
          specializedPrompts: {
            content_generation: 'Generate mindful meditation content with Indonesian cultural sensitivity',
            progress_analysis: 'Analyze user meditation progress and provide insights', 
            recommendation: 'Generate personalized meditation recommendations',
            insight_generation: 'Generate insights from user meditation data',
            personalization: 'Personalize meditation experience for user',
            content_optimization: 'Optimize meditation content effectiveness',
            user_assessment: 'Conduct user meditation assessments',
            habit_analysis: 'Analyze user meditation habits and patterns',
            emotional_analysis: 'Analyze emotional patterns from meditation data',
            siy_coaching: 'Provide Search Inside Yourself coaching guidance',
            cultural_adaptation: 'Adapt content for Indonesian culture',
            social_ei_analysis: 'Analyze social emotional intelligence patterns',
            workplace_application: 'Apply mindfulness techniques for workplace',
            session_optimization: 'Optimize meditation session effectiveness',
            learning_path_creation: 'Create personalized meditation learning paths',
            community_insights: 'Generate insights for meditation community',
            performance_analytics: 'Analyze meditation performance metrics',
            content_moderation: 'Moderate meditation content quality',
            system_optimization: 'Optimize meditation system performance',
            data_sync: 'Synchronize meditation data across devices',
            notification_dispatch: 'Dispatch smart meditation notifications'
          },
          culturalGuidelines: ['Respect Indonesian values', 'Consider religious sensitivities'],
          ethicalBoundaries: ['No harmful content', 'Cultural appropriateness']
        },
        version: '1.0.0',
        maxConcurrentTasks: 3,
        culturalExpertise: ['indonesian', 'mindfulness', 'meditation'],
        currentLoad: 0,
        assignedTasks: [],
        completedTasks: [],
        failedTasks: [],
        averageExecutionTime: 0
      },
      {
        name: 'Analytics Engine Beta',
        type: 'analytics_specialist',
        status: 'idle',
        capabilities: ['data_analysis', 'machine_learning', 'pattern_recognition', 'progress_tracking'],
        specializations: ['progress_analysis', 'habit_analysis', 'emotional_analysis'],
        performance: this.createDefaultPerformance(),
        configuration: {
          modelSettings: {
            model: 'claude-3.5-sonnet',
            temperature: 0.3,
            maxTokens: 3000,
            topP: 0.8,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0
          },
          behaviorSettings: {
            responseStyle: 'concise',
            culturalSensitivity: 0.8,
            creativityLevel: 0.4,
            conservativeness: 0.9
          },
          resourceLimits: {
            maxMemoryUsage: 1024,
            maxCpuUsage: 90,
            maxExecutionTime: 60000,
            maxConcurrentTasks: 5
          },
          specializedPrompts: {
            content_generation: 'Generate data-driven meditation content recommendations',
            progress_analysis: 'Analyze user meditation progress with statistical insights', 
            recommendation: 'Generate personalized recommendations based on data patterns',
            insight_generation: 'Generate insights from user meditation analytics',
            personalization: 'Personalize experience using machine learning',
            content_optimization: 'Optimize content using performance data',
            user_assessment: 'Conduct data-driven user assessments',
            habit_analysis: 'Analyze user meditation habits using advanced analytics',
            emotional_analysis: 'Analyze emotional patterns using data science',
            siy_coaching: 'Provide coaching guidance based on progress analytics',
            cultural_adaptation: 'Adapt content using cultural data insights',
            social_ei_analysis: 'Analyze social EI using behavioral data',
            workplace_application: 'Apply analytics for workplace mindfulness',
            session_optimization: 'Optimize sessions using performance data',
            learning_path_creation: 'Create learning paths using predictive analytics',
            community_insights: 'Generate community insights from aggregate data',
            performance_analytics: 'Analyze detailed performance metrics',
            content_moderation: 'Moderate content using quality metrics',
            system_optimization: 'Optimize system using performance analytics',
            data_sync: 'Synchronize and validate data integrity',
            notification_dispatch: 'Dispatch notifications using behavioral analytics'
          },
          culturalGuidelines: ['Privacy-first approach', 'Culturally neutral analysis'],
          ethicalBoundaries: ['Data privacy', 'No personal identifiers']
        },
        version: '1.0.0',
        maxConcurrentTasks: 5,
        currentLoad: 0,
        assignedTasks: [],
        completedTasks: [],
        failedTasks: [],
        averageExecutionTime: 0
      },
      {
        name: 'Personalization Agent Gamma',
        type: 'personalization_agent',
        status: 'busy',
        capabilities: ['personalization', 'recommendation_engine', 'user_behavior_analysis'],
        specializations: ['recommendation', 'personalization'],
        performance: this.createDefaultPerformance(),
        configuration: {
          modelSettings: {
            model: 'claude-3.5-sonnet',
            temperature: 0.5,
            maxTokens: 2500,
            topP: 0.85,
            frequencyPenalty: 0.2,
            presencePenalty: 0.1
          },
          behaviorSettings: {
            responseStyle: 'conversational',
            culturalSensitivity: 0.85,
            creativityLevel: 0.6,
            conservativeness: 0.8
          },
          resourceLimits: {
            maxMemoryUsage: 768,
            maxCpuUsage: 75,
            maxExecutionTime: 25000,
            maxConcurrentTasks: 4
          },
          specializedPrompts: {
            content_generation: 'Generate personalized meditation content',
            progress_analysis: 'Analyze progress with personalization insights', 
            recommendation: 'Generate highly personalized recommendations',
            insight_generation: 'Generate personalized insights from user data',
            personalization: 'Create personalized meditation experiences',
            content_optimization: 'Optimize content for individual preferences',
            user_assessment: 'Conduct personalized user assessments',
            habit_analysis: 'Analyze habits for personalized improvements',
            emotional_analysis: 'Analyze emotions for personalized support',
            siy_coaching: 'Provide personalized SIY coaching',
            cultural_adaptation: 'Adapt content for personal cultural background',
            social_ei_analysis: 'Analyze social EI with personal context',
            workplace_application: 'Apply personalized workplace mindfulness',
            session_optimization: 'Optimize sessions for individual needs',
            learning_path_creation: 'Create highly personalized learning paths',
            community_insights: 'Generate insights relevant to user',
            performance_analytics: 'Analyze performance with personalization',
            content_moderation: 'Moderate content considering personal preferences',
            system_optimization: 'Optimize system for individual usage patterns',
            data_sync: 'Synchronize personal data across devices',
            notification_dispatch: 'Dispatch personalized notifications'
          },
          culturalGuidelines: ['Personal preference respect', 'Cultural context awareness'],
          ethicalBoundaries: ['User consent', 'Beneficial recommendations only']
        },
        version: '1.0.0',
        maxConcurrentTasks: 4,
        currentLoad: 0,
        assignedTasks: [],
        completedTasks: [],
        failedTasks: [],
        averageExecutionTime: 0
      },
      {
        name: 'Cultural Advisor Delta',
        type: 'cultural_advisor',
        status: 'active',
        capabilities: ['cultural_awareness', 'multilingual_support', 'emotional_intelligence'],
        specializations: ['cultural_adaptation', 'content_optimization'],
        performance: this.createDefaultPerformance(),
        configuration: {
          modelSettings: {
            model: 'claude-3.5-sonnet',
            temperature: 0.6,
            maxTokens: 3500,
            topP: 0.9,
            frequencyPenalty: 0.1,
            presencePenalty: 0.2
          },
          behaviorSettings: {
            responseStyle: 'detailed',
            culturalSensitivity: 1.0,
            creativityLevel: 0.7,
            conservativeness: 0.9
          },
          resourceLimits: {
            maxMemoryUsage: 512,
            maxCpuUsage: 70,
            maxExecutionTime: 20000,
            maxConcurrentTasks: 2
          },
          specializedPrompts: {
            content_generation: 'Generate culturally appropriate meditation content for Indonesia',
            progress_analysis: 'Analyze progress with Indonesian cultural context', 
            recommendation: 'Generate culturally sensitive recommendations',
            insight_generation: 'Generate insights considering Indonesian values',
            personalization: 'Personalize with deep cultural understanding',
            content_optimization: 'Optimize content for Indonesian audience',
            user_assessment: 'Conduct culturally appropriate assessments',
            habit_analysis: 'Analyze habits within cultural context',
            emotional_analysis: 'Analyze emotions considering cultural expression',
            siy_coaching: 'Provide SIY coaching adapted for Indonesian culture',
            cultural_adaptation: 'Expert cultural adaptation for Indonesian context',
            social_ei_analysis: 'Analyze social EI with Indonesian cultural nuances',
            workplace_application: 'Apply mindfulness for Indonesian workplace culture',
            session_optimization: 'Optimize sessions for Indonesian cultural preferences',
            learning_path_creation: 'Create culturally adapted learning paths',
            community_insights: 'Generate insights for Indonesian meditation community',
            performance_analytics: 'Analyze performance considering cultural factors',
            content_moderation: 'Moderate content for cultural appropriateness',
            system_optimization: 'Optimize system for Indonesian user patterns',
            data_sync: 'Synchronize data respecting cultural privacy norms',
            notification_dispatch: 'Dispatch culturally appropriate notifications'
          },
          culturalGuidelines: ['Deep Indonesian cultural knowledge', 'Religious sensitivity'],
          ethicalBoundaries: ['Cultural respect', 'No stereotyping']
        },
        version: '1.0.0',
        maxConcurrentTasks: 2,
        culturalExpertise: ['indonesian', 'javanese', 'balinese', 'sundanese'],
        currentLoad: 0,
        assignedTasks: [],
        completedTasks: [],
        failedTasks: [],
        averageExecutionTime: 0
      }
    ];

    // Register demo agents
    demoAgents.forEach(agentData => {
      this.registerAgent(agentData).catch(console.error);
    });

    console.log('Demo agent data initialized');
  }

  /**
   * Clear all data (for development)
   */
  clearAllData(): void {
    localStorage.removeItem(this.AGENTS_KEY);
    localStorage.removeItem(this.PERFORMANCE_KEY);
    localStorage.removeItem(this.EVENTS_KEY);
    console.log('All agent data cleared');
  }
}

// Export singleton instance
export const localMultiagentAgentService = new LocalMultiagentAgentService();