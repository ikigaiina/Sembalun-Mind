import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import AchievementResetPanel from '../components/admin/AchievementResetPanel';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalContent: number;
  systemHealth: 'good' | 'warning' | 'critical';
  userGrowth: Array<{ month: string; users: number }>;
  sessionData: Array<{ date: string; sessions: number; users: number }>;
  contentUsage: Array<{ name: string; value: number; color: string }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'system' | 'reset'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from admin service
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 342,
        totalSessions: 15680,
        totalContent: 156,
        systemHealth: 'good',
        userGrowth: [
          { month: 'Jan', users: 1000 },
          { month: 'Feb', users: 1050 },
          { month: 'Mar', users: 1120 },
          { month: 'Apr', users: 1180 },
          { month: 'May', users: 1247 }
        ],
        sessionData: [
          { date: '2024-01-01', sessions: 120, users: 45 },
          { date: '2024-01-02', sessions: 135, users: 52 },
          { date: '2024-01-03', sessions: 115, users: 48 },
          { date: '2024-01-04', sessions: 145, users: 55 },
          { date: '2024-01-05', sessions: 158, users: 62 }
        ],
        contentUsage: [
          { name: 'Guided Meditations', value: 45, color: '#10B981' },
          { name: 'Breathing Exercises', value: 30, color: '#3B82F6' },
          { name: 'Courses', value: 15, color: '#F59E0B' },
          { name: 'Audio Content', value: 10, color: '#EF4444' }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'content', label: 'Content', icon: '📚' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'reset', label: 'Reset Panel', icon: '⚠️' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your meditation app</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                stats?.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
                stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                System: {stats?.systemHealth}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'content' | 'system' | 'reset')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">🟢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🧘‍♀️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalSessions.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Content Items</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalContent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.contentUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats?.contentUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Session Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Session Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.sessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#10B981" />
                  <Bar dataKey="users" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <p className="text-gray-600 mb-4">User management features coming soon...</p>
            <Button variant="primary">Export User Data</Button>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Content Management</h2>
            <p className="text-gray-600 mb-4">Content management features coming soon...</p>
            <div className="space-x-2">
              <Button variant="primary">Add New Content</Button>
              <Button variant="secondary">Manage Categories</Button>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Database</h3>
                  <p className="text-green-600">Healthy</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">API</h3>
                  <p className="text-green-600">Operational</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Storage</h3>
                  <p className="text-green-600">85% Used</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">System Actions</h2>
              <div className="space-x-2">
                <Button variant="secondary">Clear Cache</Button>
                <Button variant="secondary">Backup Data</Button>
                <Button variant="outline">View Logs</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reset' && (
          <AchievementResetPanel />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;