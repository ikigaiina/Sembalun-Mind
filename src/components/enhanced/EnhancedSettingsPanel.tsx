import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notificationService';
import { performanceMonitoringService } from '../../services/performanceMonitoringService';
import { accessibilityService } from '../../services/accessibilityService';

export const EnhancedSettingsPanel: React.FC = () => {
  const [notificationPrefs, setNotificationPrefs] = useState(notificationService.getPreferences());
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(accessibilityService.getPreferences());
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    // Load performance data
    const perfData = performanceMonitoringService.getPerformanceReport();
    setPerformanceData(perfData);
    
    // Track feature usage
    performanceMonitoringService.trackFeatureUsage('enhanced-settings');
  }, []);

  const handleNotificationToggle = async () => {
    if (!notificationPrefs.enabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationPrefs(notificationService.getPreferences());
        accessibilityService.announce('Notifikasi diaktifkan', 'polite');
      }
    } else {
      notificationService.updatePreferences({ enabled: false });
      setNotificationPrefs(notificationService.getPreferences());
      accessibilityService.announce('Notifikasi dinonaktifkan', 'polite');
    }
  };

  const handleAccessibilityChange = (key: string, value: any) => {
    const newPrefs = { ...accessibilityPrefs, [key]: value };
    accessibilityService.updatePreferences(newPrefs);
    setAccessibilityPrefs(accessibilityService.getPreferences());
    
    // Announce the change
    accessibilityService.announce(`Pengaturan aksesibilitas diperbarui: ${key}`, 'polite');
  };

  const testNotification = async () => {
    await notificationService.testNotification();
    accessibilityService.announce('Notifikasi uji dikirim', 'polite');
  };

  const runAccessibilityAudit = () => {
    const audit = accessibilityService.runAccessibilityAudit();
    accessibilityService.announce(
      `Audit selesai. Skor: ${audit.score}%. ${audit.issues.length} masalah ditemukan.`,
      'assertive'
    );
    return audit;
  };

  const exportPerformanceData = () => {
    const data = performanceMonitoringService.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sembalun-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    accessibilityService.announce('Data performa diekspor', 'polite');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg" role="tablist">
        {[
          { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
          { id: 'accessibility', label: 'Aksesibilitas', icon: '♿' },
          { id: 'performance', label: 'Performa', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              accessibilityService.announce(`Tab ${tab.label} dipilih`, 'polite');
            }}
          >
            <span className="mr-2" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Panel */}
      {activeTab === 'notifications' && (
        <div role="tabpanel" id="notifications-panel" aria-labelledby="notifications-tab">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🔔</span>
              Pengaturan Notifikasi Cerdas
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Aktifkan Notifikasi
                  </label>
                  <p className="text-xs text-gray-500">
                    Izinkan notifikasi untuk pengingat meditasi dan kebijaksanaan harian
                  </p>
                </div>
                <Button
                  variant={notificationPrefs.enabled ? 'primary' : 'outline'}
                  onClick={handleNotificationToggle}
                  aria-pressed={notificationPrefs.enabled}
                >
                  {notificationPrefs.enabled ? 'Aktif' : 'Nonaktif'}
                </Button>
              </div>

              {notificationPrefs.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.meditationReminders}
                        onChange={(e) => {
                          notificationService.updatePreferences({ 
                            meditationReminders: e.target.checked 
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Pengingat Meditasi</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.wisdomQuotes}
                        onChange={(e) => {
                          notificationService.updatePreferences({ 
                            wisdomQuotes: e.target.checked 
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Kebijaksanaan Harian</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.culturalEvents}
                        onChange={(e) => {
                          notificationService.updatePreferences({ 
                            culturalEvents: e.target.checked 
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Acara Budaya</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.achievements}
                        onChange={(e) => {
                          notificationService.updatePreferences({ 
                            achievements: e.target.checked 
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Pencapaian</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jam Tenang
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={notificationPrefs.quietHours.start}
                        onChange={(e) => {
                          notificationService.updatePreferences({
                            quietHours: {
                              ...notificationPrefs.quietHours,
                              start: e.target.value
                            }
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      />
                      <span className="text-sm text-gray-500">sampai</span>
                      <input
                        type="time"
                        value={notificationPrefs.quietHours.end}
                        onChange={(e) => {
                          notificationService.updatePreferences({
                            quietHours: {
                              ...notificationPrefs.quietHours,
                              end: e.target.value
                            }
                          });
                          setNotificationPrefs(notificationService.getPreferences());
                        }}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <Button onClick={testNotification} variant="outline" size="sm">
                    🧪 Test Notifikasi
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Accessibility Panel */}
      {activeTab === 'accessibility' && (
        <div role="tabpanel" id="accessibility-panel" aria-labelledby="accessibility-tab">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">♿</span>
              Pengaturan Aksesibilitas
            </h3>
            
            <div className="space-y-6">
              {/* Visual Accessibility */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Visual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Kontras Tinggi</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.highContrast}
                      onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>

                  <div>
                    <label className="block text-sm mb-1">Ukuran Font</label>
                    <select
                      value={accessibilityPrefs.fontSize}
                      onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                      <option value="extra-large">Sangat Besar</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between">
                    <span className="text-sm">Kurangi Gerakan</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.reduceMotion}
                      onChange={(e) => handleAccessibilityChange('reduceMotion', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>

                  <div>
                    <label className="block text-sm mb-1">Mode Buta Warna</label>
                    <select
                      value={accessibilityPrefs.colorBlindnessMode}
                      onChange={(e) => handleAccessibilityChange('colorBlindnessMode', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full"
                    >
                      <option value="none">Tidak Ada</option>
                      <option value="protanopia">Protanopia</option>
                      <option value="deuteranopia">Deuteranopia</option>
                      <option value="tritanopia">Tritanopia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Motor Accessibility */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Motorik</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Target Klik Besar</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.largerClickTargets}
                      onChange={(e) => handleAccessibilityChange('largerClickTargets', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm">Mode Satu Tangan</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.oneHandedMode}
                      onChange={(e) => handleAccessibilityChange('oneHandedMode', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>
                </div>
              </div>

              {/* Cognitive Accessibility */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Kognitif</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Interface Sederhana</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.simplifiedInterface}
                      onChange={(e) => handleAccessibilityChange('simplifiedInterface', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm">Bantuan Memori</span>
                    <input
                      type="checkbox"
                      checked={accessibilityPrefs.memoryAids}
                      onChange={(e) => handleAccessibilityChange('memoryAids', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </label>
                </div>
              </div>

              {/* Language & Cultural */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Bahasa & Budaya</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Bahasa</label>
                    <select
                      value={accessibilityPrefs.language}
                      onChange={(e) => handleAccessibilityChange('language', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                      <option value="jv">Basa Jawa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Konteks Budaya</label>
                    <select
                      value={accessibilityPrefs.culturalContext}
                      onChange={(e) => handleAccessibilityChange('culturalContext', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full"
                    >
                      <option value="general">Umum</option>
                      <option value="balinese">Bali</option>
                      <option value="javanese">Jawa</option>
                      <option value="sundanese">Sunda</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={runAccessibilityAudit} variant="outline" size="sm">
                  🔍 Audit Aksesibilitas
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Performance Panel */}
      {activeTab === 'performance' && (
        <div role="tabpanel" id="performance-panel" aria-labelledby="performance-tab">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Monitor Performa
            </h3>
            
            {performanceData && (
              <div className="space-y-6">
                {/* Core Web Vitals */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Core Web Vitals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">LCP (Largest Contentful Paint)</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceData.currentMetrics.largestContentfulPaint 
                          ? `${Math.round(performanceData.currentMetrics.largestContentfulPaint)}ms`
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {performanceData.currentMetrics.largestContentfulPaint > 2500 ? '⚠️ Perlu Perbaikan' : '✅ Baik'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">FID (First Input Delay)</div>
                      <div className="text-2xl font-bold text-green-600">
                        {performanceData.currentMetrics.firstInputDelay 
                          ? `${Math.round(performanceData.currentMetrics.firstInputDelay)}ms`
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {performanceData.currentMetrics.firstInputDelay > 100 ? '⚠️ Perlu Perbaikan' : '✅ Baik'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">CLS (Cumulative Layout Shift)</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceData.currentMetrics.cumulativeLayoutShift 
                          ? performanceData.currentMetrics.cumulativeLayoutShift.toFixed(3)
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {performanceData.currentMetrics.cumulativeLayoutShift > 0.1 ? '⚠️ Perlu Perbaikan' : '✅ Baik'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Engagement */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Engagement Pengguna</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Sesi Meditasi Selesai</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {performanceData.engagementMetrics.completedSessions || 0}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Fitur yang Paling Digunakan</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {performanceData.engagementMetrics.mostUsedFeature || 'Belum ada'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Summary */}
                {performanceData.errorMetrics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Ringkasan Error</h4>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="text-sm text-red-800">
                        {performanceData.errorMetrics.length} error terdeteksi dalam sesi ini
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Error terbaru: {performanceData.errorMetrics[0]?.message.substring(0, 100)}...
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button onClick={exportPerformanceData} variant="outline" size="sm">
                    📥 Ekspor Data Performa
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};