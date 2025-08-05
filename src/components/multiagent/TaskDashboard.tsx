import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type {
  TaskStatus,
  TaskPriority,
  TaskMetrics
} from '../../types/multiagent';
import { useMultiagentSystem } from '../../hooks/useMultiagentSystem';

interface TaskDashboardProps {
  userId?: string;
  className?: string;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ 
  userId, 
  className = '' 
}) => {
  // Use the multiagent system hook
  const [state, actions] = useMultiagentSystem({ userId, autoRefresh: true, refreshInterval: 30000 });
  
  const {
    tasks,
    taskMetrics,
    systemHealth,
    loading,
    error,
    taskFilters,
    taskSorting,
    selectedTask
  } = state;
  
  const {
    cancelTask,
    retryTask,
    setSelectedTask,
    setTaskFilters,
    setTaskSorting,
    refresh,
    clearError
  } = actions;

  // Create metrics object from the loaded data
  const metrics = useMemo(() => {
    if (!taskMetrics || !systemHealth) return null;
    
    return {
      timestamp: new Date(),
      orchestrator: {
        activeTasks: (taskMetrics as TaskMetrics).byStatus.in_progress + (taskMetrics as TaskMetrics).byStatus.assigned,
        queuedTasks: (taskMetrics as TaskMetrics).byStatus.pending + (taskMetrics as TaskMetrics).byStatus.queued,
        completedTasksPerHour: (taskMetrics as TaskMetrics).total / 24, // Simplified calculation
        averageProcessingTime: (taskMetrics as TaskMetrics).averageExecutionTime,
        errorRate: (taskMetrics as TaskMetrics).byStatus.failed / Math.max((taskMetrics as TaskMetrics).total, 1)
      },
      agents: systemHealth,
      resources: {
        memoryUsage: 65, // Mock data - would come from actual monitoring
        cpuUsage: 45,
        networkLatency: 120,
        storageUsage: 30
      },
      cultural: {
        adaptationRequests: 0,
        validationFailures: 0,
        culturalAccuracyScore: 0.95
      },
      quality: {
        averageQualityScore: 0.88,
        validationPassRate: 0.94,
        userSatisfactionScore: 0.92
      }
    };
  }, [taskMetrics, systemHealth]);

  // Computed metrics
  const tasksByStatus = useMemo(() => {
    const statusCounts: Record<TaskStatus, number> = {
      pending: 0,
      queued: 0,
      assigned: 0,
      in_progress: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      timeout: 0,
      retrying: 0
    };

    tasks.forEach(task => {
      statusCounts[task.status]++;
    });

    return statusCounts;
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter(task => task.status === 'in_progress' || task.status === 'completed' || task.status === 'failed')
      .slice(0, 10);
  }, [tasks]);

  // Event handlers
  const handleFilterChange = (newFilters: Partial<typeof taskFilters>) => {
    setTaskFilters(newFilters);
  };

  const handleSortChange = (field: string) => {
    setTaskSorting({
      field: field as any,
      direction: taskSorting.field === field && taskSorting.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const handleTaskAction = async (taskId: string, action: 'cancel' | 'retry') => {
    try {
      if (action === 'cancel') {
        await cancelTask(taskId);
      } else if (action === 'retry') {
        await retryTask(taskId);
      }
    } catch (err) {
      // Error is handled by the hook
      console.error(`Failed to ${action} task:`, err);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading && tasks.length === 0) {
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
        <h2 className="text-2xl font-bold text-gray-900">Multiagent Task Dashboard</h2>
        <div className="flex gap-2">
          <Button
            onClick={refresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.orchestrator.activeTasks}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">⚡</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queued Tasks</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.orchestrator.queuedTasks}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.agents?.activeAgents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🤖</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(((metrics?.agents as any)?.healthScore || 0) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💚</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Status Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(tasksByStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status as TaskStatus)}`}>
                {status.replace('_', ' ')}
              </div>
              <p className="text-2xl font-bold mt-2">{count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Tasks */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <div className="flex gap-2">
            <select
              className="text-sm border border-gray-300 rounded px-2 py-1"
              value={taskFilters.status?.[0] || ''}
              onChange={(e) => handleFilterChange({ 
                status: e.target.value ? [e.target.value as TaskStatus] : undefined 
              })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              className="text-sm border border-gray-300 rounded px-2 py-1"
              value={taskSorting.field}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Task</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {task.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {task.completedAt && task.startedAt ? 
                      formatDuration(task.completedAt.getTime() - task.startedAt.getTime()) :
                      task.startedAt ? 
                        formatDuration(Date.now() - task.startedAt.getTime()) :
                        '-'
                    }
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedTask(task)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        View
                      </Button>
                      {task.status === 'failed' && (
                        <Button
                          onClick={() => handleTaskAction(task.id, 'retry')}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          Retry
                        </Button>
                      )}
                      {['pending', 'queued', 'assigned', 'in_progress'].includes(task.status) && (
                        <Button
                          onClick={() => handleTaskAction(task.id, 'cancel')}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching the current filters.
          </div>
        )}
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedTask.title}</h3>
                <Button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900">{selectedTask.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Agent</label>
                    <p className="text-gray-900">{selectedTask.assignedAgentId || 'Not assigned'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{selectedTask.createdAt.toLocaleString()}</p>
                </div>

                {selectedTask.error && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Error</label>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-900 font-medium">{selectedTask.error.message}</p>
                      {(selectedTask.error?.details as any) && (
                        <pre className="text-red-700 text-sm mt-2 overflow-x-auto">
                          {JSON.stringify(selectedTask.error.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {selectedTask.result && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Result</label>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="space-y-2">
                        <p><strong>Success:</strong> {selectedTask.result.success ? 'Yes' : 'No'}</p>
                        {selectedTask.result.confidence && (
                          <p><strong>Confidence:</strong> {Math.round(selectedTask.result.confidence * 100)}%</p>
                        )}
                        {selectedTask.result.qualityScore && (
                          <p><strong>Quality:</strong> {Math.round(selectedTask.result.qualityScore * 100)}%</p>
                        )}
                        {selectedTask.result.metadata.executionTime && (
                          <p><strong>Execution Time:</strong> {formatDuration(selectedTask.result.metadata.executionTime)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  {selectedTask.status === 'failed' && (
                    <Button
                      onClick={() => {
                        handleTaskAction(selectedTask.id, 'retry');
                        setSelectedTask(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Retry Task
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedTask(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};