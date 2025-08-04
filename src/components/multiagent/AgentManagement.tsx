import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type {
  Agent,
  AgentType,
  AgentStatus,
  AgentCapability,
  AgentPerformance
} from '../../types/multiagent';
import { multiagentAgentService } from '../../services/multiagentAgentService';

interface AgentManagementProps {
  className?: string;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({ 
  className = '' 
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<Record<string, AgentPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<AgentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AgentStatus | 'all'>('all');

  // Load agents and their performance data
  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const agentsData = await multiagentAgentService.listAgents(
        filterType !== 'all' ? filterType : undefined
      );

      // Filter by status if specified
      const filteredAgents = filterStatus !== 'all' 
        ? agentsData.filter(agent => agent.status === filterStatus)
        : agentsData;

      setAgents(filteredAgents);

      // Load performance data for each agent
      const performancePromises = filteredAgents.map(async (agent) => {
        try {
          return {
            id: agent.id,
            performance: await multiagentAgentService.getAgentPerformance(agent.id)
          };
        } catch (err) {
          console.warn(`Failed to load performance for agent ${agent.id}:`, err);
          return null;
        }
      });

      const performanceResults = await Promise.all(performancePromises);
      const performanceMap: Record<string, AgentPerformance> = {};
      
      performanceResults.forEach(result => {
        if (result) {
          performanceMap[result.id] = result.performance;
        }
      });

      setAgentPerformance(performanceMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  // Initialize data loading and real-time updates
  useEffect(() => {
    loadAgents();

    // Subscribe to agent updates
    const unsubscribe = multiagentAgentService.subscribeToAgentUpdates(() => {
      // Reload agents when changes occur
      loadAgents();
    });

    // Set up periodic refresh
    const interval = setInterval(loadAgents, 60000); // Refresh every minute

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadAgents]);

  // Computed metrics
  const systemMetrics = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => ['active', 'busy', 'idle'].includes(a.status)).length;
    const averageLoad = totalAgents > 0 ? 
      agents.reduce((sum, agent) => sum + agent.currentLoad, 0) / totalAgents : 0;
    
    const healthScore = totalAgents > 0 ? 
      agents.reduce((sum, agent) => {
        let health = 1.0;
        if (agent.status === 'error' || agent.status === 'offline') health = 0.0;
        else if (agent.status === 'overloaded') health = 0.3;
        else if (agent.status === 'degraded') health = 0.6;
        else if (agent.status === 'maintenance') health = 0.5;
        return sum + health;
      }, 0) / totalAgents : 0;

    return {
      totalAgents,
      activeAgents,
      averageLoad,
      healthScore
    };
  }, [agents]);

  // Event handlers
  const handleAgentAction = async (agentId: string, action: 'activate' | 'deactivate' | 'maintenance') => {
    try {
      let newStatus: AgentStatus;
      switch (action) {
        case 'activate':
          newStatus = 'active';
          break;
        case 'deactivate':
          newStatus = 'offline';
          break;
        case 'maintenance':
          newStatus = 'maintenance';
          break;
      }

      await multiagentAgentService.updateAgentStatus(agentId, newStatus);
      await loadAgents(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} agent`);
    }
  };

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-blue-600 bg-blue-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-400 bg-gray-50';
      case 'overloaded': return 'text-orange-600 bg-orange-100';
      case 'degraded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLoadColor = (load: number): string => {
    if (load >= 90) return 'text-red-600 bg-red-100';
    if (load >= 70) return 'text-orange-600 bg-orange-100';
    if (load >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatCapabilities = (capabilities: AgentCapability[]): string => {
    return capabilities.slice(0, 3).join(', ') + 
      (capabilities.length > 3 ? ` +${capabilities.length - 3} more` : '');
  };

  const formatUptime = (lastActive: Date): string => {
    const now = Date.now();
    const diff = now - lastActive.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading && agents.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={loadAgents}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.totalAgents}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-xl">🤖</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-green-600">
                {systemMetrics.activeAgents}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Load</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(systemMetrics.averageLoad)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(systemMetrics.healthScore * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💚</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AgentType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="orchestrator">Orchestrator</option>
            <option value="content_specialist">Content Specialist</option>
            <option value="analytics_specialist">Analytics Specialist</option>
            <option value="personalization_agent">Personalization</option>
            <option value="cultural_advisor">Cultural Advisor</option>
            <option value="siy_coach">SIY Coach</option>
            <option value="emotional_ai">Emotional AI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AgentStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Agent List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Agents</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Load</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const performance = agentPerformance[agent.id];
                return (
                  <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCapabilities(agent.capabilities)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Tasks: {agent.assignedTasks.length}/{agent.maxConcurrentTasks}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {agent.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getLoadColor(agent.currentLoad)}`}>
                          {agent.currentLoad}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              agent.currentLoad >= 90 ? 'bg-red-500' :
                              agent.currentLoad >= 70 ? 'bg-orange-500' :
                              agent.currentLoad >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${agent.currentLoad}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {performance ? (
                        <div className="text-sm">
                          <div>Success: {Math.round(performance.successRate * 100)}%</div>
                          <div>Quality: {Math.round(performance.qualityScore * 100)}%</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Loading...</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatUptime(agent.lastActiveAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedAgent(agent)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          View
                        </Button>
                        {agent.status === 'offline' ? (
                          <Button
                            onClick={() => handleAgentAction(agent.id, 'activate')}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700"
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAgentAction(agent.id, 'deactivate')}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700"
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          onClick={() => handleAgentAction(agent.id, 'maintenance')}
                          className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                        >
                          Maintenance
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No agents found matching the current filters.
          </div>
        )}
      </Card>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
                <Button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900">{selectedAgent.type.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Load</label>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getLoadColor(selectedAgent.currentLoad)}`}>
                        {selectedAgent.currentLoad}%
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedAgent.currentLoad >= 90 ? 'bg-red-500' :
                            selectedAgent.currentLoad >= 70 ? 'bg-orange-500' :
                            selectedAgent.currentLoad >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedAgent.currentLoad}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Capabilities</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.capabilities.map(capability => (
                        <span key={capability} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Specializations</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.specializations.map(spec => (
                        <span key={spec} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Active Tasks</label>
                    <p className="text-gray-900">
                      {selectedAgent.assignedTasks.length} / {selectedAgent.maxConcurrentTasks}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Performance Metrics</label>
                    {agentPerformance[selectedAgent.id] ? (
                      <div className="bg-gray-50 rounded p-3 space-y-2">
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{Math.round(agentPerformance[selectedAgent.id].successRate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Score:</span>
                          <span>{Math.round(agentPerformance[selectedAgent.id].qualityScore * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span>{Math.round(agentPerformance[selectedAgent.id].efficiencyRating * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Response Time:</span>
                          <span>{Math.round(agentPerformance[selectedAgent.id].averageResponseTime)}ms</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Loading performance data...</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Statistics</label>
                    <div className="bg-gray-50 rounded p-3 space-y-2">
                      <div className="flex justify-between">
                        <span>Completed Tasks:</span>
                        <span>{selectedAgent.completedTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Tasks:</span>
                        <span>{selectedAgent.failedTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Execution Time:</span>
                        <span>{Math.round(selectedAgent.averageExecutionTime)}ms</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Timestamps</label>
                    <div className="bg-gray-50 rounded p-3 space-y-2">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{selectedAgent.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Active:</span>
                        <span>{selectedAgent.lastActiveAt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => setSelectedAgent(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};