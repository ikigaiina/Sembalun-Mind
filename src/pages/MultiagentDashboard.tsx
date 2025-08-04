// Multiagent Dashboard Page
// Main page for multiagent system management and monitoring

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TaskDashboard } from '../components/multiagent/TaskDashboard';
import { AgentManagement } from '../components/multiagent/AgentManagement';
import { useMultiagentSystem, useTaskCreation } from '../hooks/useMultiagentSystem';

export const MultiagentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'agents' | 'create'>('tasks');
  const [state, actions] = useMultiagentSystem({ autoRefresh: true });
  const taskCreation = useTaskCreation();

  // Demo task creation for testing
  const handleCreateDemoTask = async (type: 'content' | 'analysis' | 'recommendation') => {
    try {
      const userId = 'demo_user_' + Math.random().toString(36).substr(2, 6);
      
      switch (type) {
        case 'content':
          await taskCreation.createMeditationContentTask(userId, 'mindfulness', 15, 'beginner');
          break;
        case 'analysis':
          await taskCreation.createProgressAnalysisTask(userId, '30days');
          break;
        case 'recommendation':
          await taskCreation.createRecommendationTask(userId, 'stress-reduction', 5);
          break;
      }
    } catch (error) {
      console.error('Failed to create demo task:', error);
    }
  };

  const tabs = [
    { id: 'tasks' as const, label: 'Task Dashboard', icon: '📊' },
    { id: 'agents' as const, label: 'Agent Management', icon: '🤖' },
    { id: 'create' as const, label: 'Create Tasks', icon: '➕' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Claude Code Multiagent System
          </h1>
          <p className="text-gray-600">
            Manage and monitor multiagent tasks and system performance
          </p>
        </div>

        {/* System Status */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
              {state.taskMetrics && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Active Tasks: {state.taskMetrics?.byStatus?.in_progress || 0}</span>
                  <span>Total Agents: {state.systemHealth?.totalAgents || 0}</span>
                  <span>Success Rate: {Math.round((state.taskMetrics?.successRate || 0) * 100)}%</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={actions.initializeDemoData}
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                Initialize Demo Data
              </Button>
              <Button
                onClick={actions.clearAllData}
                className="bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Clear All Data
              </Button>
              <Button
                onClick={actions.refresh}
                disabled={state.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {state.loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{state.error}</span>
            <Button
              onClick={actions.clearError}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ✕
            </Button>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'tasks' && (
            <TaskDashboard className="w-full" />
          )}

          {activeTab === 'agents' && (
            <AgentManagement className="w-full" />
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Create Demo Tasks</h3>
                <p className="text-gray-600 mb-6">
                  Create sample tasks to test the multiagent system functionality.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <h4 className="font-medium mb-2">Content Generation</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate a 15-minute mindfulness meditation session for beginners
                      </p>
                      <Button
                        onClick={() => handleCreateDemoTask('content')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Create Content Task
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-medium mb-2">Progress Analysis</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Analyze user meditation progress and patterns over 30 days
                      </p>
                      <Button
                        onClick={() => handleCreateDemoTask('analysis')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Create Analysis Task
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate 5 personalized stress-reduction recommendations
                      </p>
                      <Button
                        onClick={() => handleCreateDemoTask('recommendation')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Create Recommendation Task
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Task Types Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: 'content_generation', name: 'Content Generation', desc: 'Generate meditation sessions and scripts' },
                    { type: 'progress_analysis', name: 'Progress Analysis', desc: 'Analyze user meditation progress' },
                    { type: 'recommendation', name: 'Recommendations', desc: 'Personalized content recommendations' },
                    { type: 'insight_generation', name: 'Insight Generation', desc: 'Generate insights from user data' },
                    { type: 'personalization', name: 'Personalization', desc: 'Customize user experience' },
                    { type: 'cultural_adaptation', name: 'Cultural Adaptation', desc: 'Adapt content for Indonesian culture' },
                    { type: 'siy_coaching', name: 'SIY Coaching', desc: 'Search Inside Yourself coaching' },
                    { type: 'emotional_analysis', name: 'Emotional Analysis', desc: 'Analyze emotional patterns' },
                    { type: 'habit_analysis', name: 'Habit Analysis', desc: 'Analyze meditation habits' }
                  ].map((taskType) => (
                    <div key={taskType.type} className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium text-sm mb-1">{taskType.name}</h5>
                      <p className="text-xs text-gray-600">{taskType.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Agent Types Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: 'content_specialist', name: 'Content Specialist', desc: 'Specialized in generating meditation content' },
                    { type: 'analytics_specialist', name: 'Analytics Specialist', desc: 'Data analysis and insights generation' },
                    { type: 'personalization_agent', name: 'Personalization Agent', desc: 'User experience personalization' },
                    { type: 'cultural_advisor', name: 'Cultural Advisor', desc: 'Indonesian cultural context expertise' },
                    { type: 'siy_coach', name: 'SIY Coach', desc: 'Search Inside Yourself methodology' },
                    { type: 'emotional_ai', name: 'Emotional AI', desc: 'Emotional intelligence and empathy' }
                  ].map((agentType) => (
                    <div key={agentType.type} className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium text-sm mb-1">{agentType.name}</h5>
                      <p className="text-xs text-gray-600">{agentType.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 py-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Claude Code Multiagent Task Management System</p>
            <p className="mt-1">
              Development Mode - Using Local Storage |{' '}
              <span className="text-blue-600">
                {state.tasks.length} tasks • {state.agents.length} agents
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};