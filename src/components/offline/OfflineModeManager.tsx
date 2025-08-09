import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, WifiOff, Download, RefreshCw, Clock, CheckCircle, 
  PlayCircle, Pause, RotateCcw, Settings, Trash2,
  Cloud, HardDrive, Activity, AlertCircle, Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOfflineMode } from '../../hooks/useOfflineMode';

interface Props {
  className?: string;
}

export const OfflineModeManager: React.FC<Props> = ({
  className = ''
}) => {
  const {
    isOnline,
    offlineData,
    isDownloading,
    downloadProgress,
    downloadSessionsForOffline,
    getOfflineSessions,
    syncOfflineData,
    clearOfflineData,
    getOfflineStats
  } = useOfflineMode();

  const [activeTab, setActiveTab] = useState<'status' | 'sessions' | 'settings'>('status');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const stats = getOfflineStats();
  const offlineSessions = getOfflineSessions();

  const handleDownloadSessions = async () => {
    try {
      const result = await downloadSessionsForOffline();
      if (result.success) {
        // Show success notification
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSync = async () => {
    setSyncError(null);
    try {
      const result = await syncOfflineData();
      if (result.success) {
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 3000);
      } else {
        setSyncError(result.error || 'Gagal sinkronisasi');
      }
    } catch (error) {
      setSyncError('Terjadi kesalahan saat sinkronisasi');
      console.error('Sync failed:', error);
    }
  };

  const handleClearOfflineData = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data offline? Data yang belum disinkronkan akan hilang.')) {
      clearOfflineData();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {isOnline ? 'Terhubung ke Internet' : 'Mode Offline'}
              </h3>
              <p className="text-sm text-gray-600">
                {isOnline 
                  ? 'Semua fitur tersedia'
                  : `${stats.totalSessions} sesi tersedia offline`
                }
              </p>
            </div>
          </div>
          
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isDownloading}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sinkronkan
            </Button>
          )}
        </div>

        {/* Download Progress */}
        <AnimatePresence>
          {isDownloading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-blue-50 rounded-lg"
            >
              <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                <span>Mengunduh sesi untuk offline...</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Success Notification */}
        <AnimatePresence>
          {showSyncSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-green-50 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Data berhasil disinkronkan
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Error */}
        <AnimatePresence>
          {syncError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-50 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{syncError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {[
            { id: 'status', label: 'Status', icon: Activity },
            { id: 'sessions', label: 'Sesi Offline', icon: HardDrive },
            { id: 'settings', label: 'Pengaturan', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Statistics */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Statistik Offline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalSessions}</div>
                  <div className="text-xs text-gray-600">Total Sesi</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{stats.completedSessions}</div>
                  <div className="text-xs text-green-600">Diselesaikan</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{stats.totalMinutes}</div>
                  <div className="text-xs text-blue-600">Menit Praktik</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{stats.availableForDownload}</div>
                  <div className="text-xs text-purple-600">Slot Tersisa</div>
                </div>
              </div>

              {stats.lastSync && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Terakhir disinkronkan: {stats.lastSync.toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleDownloadSessions}
                  disabled={!isOnline || isDownloading}
                  className="justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isOnline ? 'Unduh Sesi Baru' : 'Perlu Koneksi Internet'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={!isOnline}
                  className="justify-center text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  {isOnline ? 'Sinkronkan Data' : 'Perlu Koneksi Internet'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Sesi Tersedia Offline</h3>
                <div className="text-sm text-gray-600">
                  {offlineSessions.length} dari {stats.totalSessions} sesi
                </div>
              </div>

              <div className="space-y-3">
                {offlineSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {session.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {session.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{session.duration} menit</span>
                          </span>
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                            {session.difficulty}
                          </span>
                          <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {session.type}
                          </span>
                          {session.culturalRegion && (
                            <span className="capitalize bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {session.culturalRegion}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {session.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {offlineSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      Belum ada sesi yang diunduh untuk offline.<br />
                      Hubungkan ke internet untuk mengunduh sesi.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Pengaturan Mode Offline</h3>
              
              <div className="space-y-4">
                {/* Auto Download */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Unduh Otomatis</h4>
                    <div className="w-10 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unduh sesi baru secara otomatis saat terhubung ke WiFi
                  </p>
                </div>

                {/* Storage Management */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Manajemen Penyimpanan</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Kelola ruang penyimpanan untuk sesi offline
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearOfflineData}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Semua Data
                    </Button>
                  </div>
                </div>

                {/* Sync Settings */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Sinkronisasi</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Atur kapan data offline disinkronkan
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Sinkronkan otomatis saat terhubung</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Hanya dengan WiFi</span>
                    </label>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Tentang Mode Offline</h4>
                      <p className="text-sm text-blue-700">
                        Mode offline memungkinkan Anda bermeditasi tanpa koneksi internet. 
                        Sesi yang telah diunduh akan tersimpan di perangkat Anda dan dapat 
                        diakses kapan saja. Progress Anda akan disinkronkan otomatis saat 
                        kembali online.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};