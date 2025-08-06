// Multiagent Agent Service Implementation
// Service for managing Claude Code multiagent system agents

import { typedSupabase as supabase } from '../config/supabase';
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

export class MultiagentAgentService implements AgentService {
  private readonly agentsCollection = 'multiagent_agents';
  private readonly agentEventsCollection = 'agent_events';
  private readonly performanceCollection = 'agent_performance';
  private listeners: Map<string, () => void> = new Map();

  /**
   * Register a new agent in the system
   */
  async registerAgent(
    agentData: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt'>
  ): Promise<Agent> {
    try {
      const now = new Date();
      const agent: Omit<Agent, 'id'> = {
        ...agentData,
        createdAt: now,
        lastActiveAt: now,
        currentLoad: 0,
        assignedTasks: [],
        completedTasks: 0,
        failedTasks: 0,
        averageExecutionTime: 0
      };

      const { data, error } = await supabase.from(this.agentsCollection).insert({
        ...agent,
        created_at: now.toISOString(),
        last_active_at: now.toISOString()
      }).select();

      if (error) throw error;
      const registeredAgent: Agent = {
        ...agent,
        id: data[0].id
      };

      // Emit agent registered event
      await this.emitAgentEvent('registered', registeredAgent);

      // Initialize performance tracking
      await this.initializeAgentPerformance(registeredAgent.id);

      return registeredAgent;
    } catch (error) {
      console.error('Error registering agent:', error);
      throw new Error(`Failed to register agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
    try {
      const { data: agentData, error: fetchError } = await supabase
        .from(this.agentsCollection)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !agentData) {
        throw new Error(`Agent with ID ${id} not found`);
      }

      const { error: updateError } = await supabase
        .from(this.agentsCollection)
        .update({
          status,
          last_active_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      const agent = { ...agentData, status } as Agent;

      // Emit status change event
      await this.emitAgentEvent('status_changed', agent);

      // Handle status-specific logic
      await this.handleStatusChange(agent, status);
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw new Error(`Failed to update agent status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from(this.agentsCollection)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found

      if (!data) {
        return null;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        lastActiveAt: new Date(data.last_active_at)
      } as Agent;
    } catch (error) {
      console.error('Error getting agent:', error);
      throw new Error(`Failed to get agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List agents with optional type filtering
   */
  async listAgents(type?: AgentType): Promise<Agent[]> {
    try {
      let query = supabase.from(this.agentsCollection).select('*').order('last_active_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      const agents: Agent[] = data.map(item => ({
        ...item,
        id: item.id,
        createdAt: new Date(item.created_at),
        lastActiveAt: new Date(item.last_active_at)
      })) as Agent[];

      return agents;
    } catch (error) {
      console.error('Error listing agents:', error);
      throw new Error(`Failed to list agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign a task to an agent
   */
  async assignTask(agentId: string, taskId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      if (agent.status !== 'active' && agent.status !== 'idle') {
        throw new Error(`Cannot assign task to agent in ${agent.status} status`);
      }

      if (agent.assignedTasks.length >= agent.maxConcurrentTasks) {
        throw new Error(`Agent has reached maximum concurrent tasks (${agent.maxConcurrentTasks})`);
      }

      // Update agent with new task assignment
      const updatedAssignedTasks = [...agent.assignedTasks, taskId];
      const newLoad = Math.round((updatedAssignedTasks.length / agent.maxConcurrentTasks) * 100);

      await supabase.from(this.agentsCollection).update({
        assigned_tasks: updatedAssignedTasks,
        current_load: newLoad,
        status: newLoad > 0 ? 'busy' : 'idle',
        last_active_at: new Date().toISOString()
      }).eq('id', agentId);

      // Emit task assignment event
      await this.emitAgentEvent('task_assigned', {
        ...agent,
        assignedTasks: updatedAssignedTasks,
        currentLoad: newLoad
      });
    } catch (error) {
      console.error('Error assigning task to agent:', error);
      throw new Error(`Failed to assign task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unassign a task from an agent
   */
  async unassignTask(agentId: string, taskId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      const updatedAssignedTasks = agent.assignedTasks.filter(id => id !== taskId);
      const newLoad = Math.round((updatedAssignedTasks.length / agent.maxConcurrentTasks) * 100);

      await supabase.from(this.agentsCollection).update({
        assigned_tasks: updatedAssignedTasks,
        current_load: newLoad,
        status: newLoad > 0 ? 'busy' : 'idle',
        last_active_at: new Date().toISOString()
      }).eq('id', agentId);

      // Update task completion counter
      await this.updateTaskCompletion(agentId, taskId);
    } catch (error) {
      console.error('Error unassigning task from agent:', error);
      throw new Error(`Failed to unassign task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(id: string): Promise<AgentPerformance> {
    try {
      const { data, error } = await supabase
        .from(this.performanceCollection)
        .select('*')
        .eq('agentId', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found

      if (!data) {
        // Initialize performance if it doesn't exist
        await this.initializeAgentPerformance(id);
        return await this.getAgentPerformance(id);
      }

      return {
        ...data,
        lastEvaluated: new Date(data.last_evaluated)
      } as AgentPerformance;
    } catch (error) {
      console.error('Error getting agent performance:', error);
      throw new Error(`Failed to get agent performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Subscribe to agent updates
   */
  subscribeToAgentUpdates(callback: (event: AgentEvent) => void): () => void {
    

    const channel = supabase.channel('agent_events_channel');

    const subscription = channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: this.agentEventsCollection },
        (payload) => {
          const eventData = payload.new;
          const event: AgentEvent = {
            type: eventData.type || 'status_changed',
            agentId: eventData.agent_id || '',
            timestamp: new Date(eventData.timestamp),
            data: eventData.data || {}
          };
          callback(event);
        }
      )
      .subscribe();

    const listenerId = Math.random().toString(36);
    this.listeners.set(listenerId, () => supabase.removeChannel(channel));

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Find the best agent for a specific task type
   */
  async findBestAgent(taskType: TaskType, capabilities: AgentCapability[]): Promise<Agent | null> {
    try {
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

      // Score agents based on various factors
      const scoredAgents = await Promise.all(
        suitableAgents.map(async (agent) => {
          const performance = await this.getAgentPerformance(agent.id);
          
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
        })
      );

      // Sort by score (highest first) and return the best agent
      scoredAgents.sort((a, b) => b.score - a.score);
      return scoredAgents[0].agent;
    } catch (error) {
      console.error('Error finding best agent:', error);
      return null;
    }
  }

  /**
   * Get agents by capability
   */
  async getAgentsByCapability(capability: AgentCapability): Promise<Agent[]> {
    try {
      const agents = await this.listAgents();
      return agents.filter(agent => agent.capabilities.includes(capability));
    } catch (error) {
      console.error('Error getting agents by capability:', error);
      throw new Error(`Failed to get agents by capability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    try {
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
    } catch (error) {
      console.error('Error getting system health:', error);
      throw new Error(`Failed to get system health: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfiguration(id: string, config: Partial<AgentConfiguration>): Promise<void> {
    try {
      const { error } = await supabase.from(this.agentsCollection).update({
        configuration: config,
        last_active_at: new Date().toISOString()
      }).eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating agent configuration:', error);
      throw new Error(`Failed to update agent configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deregister an agent
   */
  async deregisterAgent(id: string): Promise<void> {
    try {
      const agent = await this.getAgent(id);
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }

      if (agent.assignedTasks.length > 0) {
        throw new Error(`Cannot deregister agent with active tasks. Current tasks: ${agent.assignedTasks.length}`);
      }

      // Mark agent as offline first
      await this.updateAgentStatus(id, 'offline');

      // Remove from agents collection
      await supabase.from(this.agentsCollection).update({
        status: 'offline',
        deregistered_at: new Date().toISOString()
      }).eq('id', id);

      // Emit offline event
      await this.emitAgentEvent('offline', agent);
    } catch (error) {
      console.error('Error deregistering agent:', error);
      throw new Error(`Failed to deregister agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private method to emit agent events
   */
  private async emitAgentEvent(type: AgentEvent['type'], agent: Partial<Agent>): Promise<void> {
    try {
      const event: Omit<AgentEvent, 'timestamp'> = {
        type,
        agentId: agent.id!,
        data: agent
      };

      const { error } = await supabase.from(this.agentEventsCollection).insert({
        ...event,
        timestamp: new Date().toISOString()
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error emitting agent event:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Private method to initialize agent performance tracking
   */
  private async initializeAgentPerformance(agentId: string): Promise<void> {
    try {
      const performance: AgentPerformance = {
        averageResponseTime: 0,
        successRate: 1.0,
        qualityScore: 1.0,
        userSatisfactionScore: 1.0,
        efficiencyRating: 1.0,
        culturalAdaptationScore: 1.0,
        lastEvaluated: new Date(),
        trends: {
          responseTime: [],
          successRate: [],
          qualityScores: []
        },
        competencyAreas: {} as Record<TaskType, number>
      };

      const { error } = await supabase.from(this.performanceCollection).insert({
        ...performance,
        agent_id: agentId,
        last_evaluated: new Date().toISOString()
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error initializing agent performance:', error);
    }
  }

  /**
   * Private method to handle status changes
   */
  private async handleStatusChange(agent: Agent, newStatus: AgentStatus): Promise<void> {
    try {
      switch (newStatus) {
        case 'error':
          // Handle error state - maybe reassign tasks
          if (agent.assignedTasks.length > 0) {
            console.warn(`Agent ${agent.id} went into error state with ${agent.assignedTasks.length} active tasks`);
            // TODO: Implement task reassignment logic
          }
          break;
        case 'offline':
          // Handle offline state
          await this.emitAgentEvent('offline', agent);
          break;
        case 'overloaded':
          // Handle overload state
          console.warn(`Agent ${agent.id} is overloaded with load: ${agent.currentLoad}%`);
          break;
      }
    } catch (error) {
      console.error('Error handling status change:', error);
    }
  }

  /**
   * Private method to update task completion statistics
   */
  private async updateTaskCompletion(agentId: string, taskId: string): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) return;

      await supabase.from(this.agentsCollection).update({
        completed_tasks: agent.completedTasks + 1,
        last_active_at: new Date().toISOString()
      }).eq('id', agentId);
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
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
export const multiagentAgentService = new MultiagentAgentService();