import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, FileText, Users, BarChart3, Database, Shield,
  Download, Upload, RefreshCw, Bell, Calendar, Zap,
  TrendingUp, Activity, Clock, Star, HelpCircle
} from 'lucide-react';
import { Card, Button, DashboardLayout } from '../components/ui';
import { ContentManagementDashboard } from '../components/admin/ContentManagementDashboard';

interface AdminPanelProps {
  className?: string;
}

type AdminTab = 'overview' | 'content' | 'users' | 'analytics' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');

  const adminStats = {
    totalUsers: 2847,
    activeToday: 156,
    totalContent: 87,
    publishedContent: 62,
    avgSessionTime: 12.4,
    userGrowth: 18.5,
    contentEngagement: 84.2,
    systemHealth: 99.2
  };

  const recentActivity = [
    { id: 1, type: 'content', action: 'Published new meditation', time: '2 menit yang lalu', user: 'Admin' },
    { id: 2, type: 'user', action: 'New user registered', time: '15 menit yang lalu', user: 'System' },
    { id: 3, type: 'content', action: 'Updated breathing exercise', time: '1 jam yang lalu', user: 'Admin' },
    { id: 4, type: 'analytics', action: 'Weekly report generated', time: '3 jam yang lalu', user: 'System' },
    { id: 5, type: 'content', action: 'New quote added', time: '5 jam yang lalu', user: 'Admin' }
  ];

  const AdminOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{adminStats.userGrowth}% bulan ini
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktif Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.activeToday}</p>
              <p className="text-xs text-gray-500 mt-1">Rata-rata {adminStats.avgSessionTime} menit/sesi</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Konten</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalContent}</p>
              <p className="text-xs text-blue-600 mt-1">{adminStats.publishedContent} dipublikasi</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.contentEngagement}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Star className="w-3 h-3 mr-1" />
                Rating tinggi
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="flex items-center justify-center space-x-2 p-4 h-auto"
            onClick={() => setActiveTab('content')}
          >
            <FileText className="w-5 h-5" />
            <span>Kelola Konten</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 p-4 h-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Import Konten</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 p-4 h-auto"
          >
            <Download className="w-5 h-5" />
            <span>Ekspor Data</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2 p-4 h-auto"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Lihat Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'content' ? 'bg-blue-100' :
                  activity.type === 'user' ? 'bg-green-100' :
                  activity.type === 'analytics' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'content' ? <FileText className="w-4 h-4 text-blue-600" /> :
                   activity.type === 'user' ? <Users className="w-4 h-4 text-green-600" /> :
                   activity.type === 'analytics' ? <BarChart3 className="w-4 h-4 text-purple-600" /> :
                   <Clock className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Status Sistem</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Server Status</span>
              </div>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Uptime</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{adminStats.systemHealth}%</span>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Last Backup</span>
                <span className="text-gray-900">2 jam yang lalu</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-700">Next Maintenance</span>
                <span className="text-gray-900">Minggu, 3:00 AM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const AdminUsers = () => (
    <Card className="p-8 text-center">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
      <p className="text-gray-600 mb-4">
        Kelola pengguna, izin, dan aktivitas akan segera tersedia.
      </p>
      <Button variant="outline">Coming Soon</Button>
    </Card>
  );

  const AdminAnalytics = () => (
    <Card className="p-8 text-center">
      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
      <p className="text-gray-600 mb-4">
        Analytics mendalam tentang penggunaan aplikasi dan engagement pengguna.
      </p>
      <Button variant="outline">Coming Soon</Button>
    </Card>
  );

  const AdminSettings = () => (
    <Card className="p-8 text-center">
      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
      <p className="text-gray-600 mb-4">
        Konfigurasi sistem, notifikasi, dan pengaturan aplikasi lainnya.
      </p>
      <Button variant="outline">Coming Soon</Button>
    </Card>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, component: AdminOverview },
    { id: 'content', label: 'Konten', icon: FileText, component: () => <ContentManagementDashboard /> },
    { id: 'users', label: 'Pengguna', icon: Users, component: AdminUsers },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, component: AdminAnalytics },
    { id: 'settings', label: 'Pengaturan', icon: Settings, component: AdminSettings }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminOverview;

  return (
    <DashboardLayout>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola konten dan pengaturan aplikasi Sembalun
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Bantuan
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mt-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 py-6"
        >
          <ActiveComponent />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};