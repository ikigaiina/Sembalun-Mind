import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, FileText, Image, Share2, 
  Calendar, Clock, Heart, Award, BarChart3,
  CheckCircle, AlertCircle, Copy, Mail, MessageSquare
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMoodTracker } from '../../hooks/useMoodTracker';

interface ExportData {
  sessions: any[];
  moodHistory: any[];
  achievements: any[];
  progress: any;
  culturalData: any;
  preferences: any;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'image';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeData: {
    sessions: boolean;
    moods: boolean;
    achievements: boolean;
    progress: boolean;
    cultural: boolean;
  };
  privacy: 'full' | 'anonymous' | 'summary';
}

interface Props {
  className?: string;
}

export const SessionExporter: React.FC<Props> = ({
  className = ''
}) => {
  const { getMoodHistory, getMoodStats } = useMoodTracker();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    includeData: {
      sessions: true,
      moods: true,
      achievements: true,
      progress: true,
      cultural: true
    },
    privacy: 'full'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
    downloadUrl?: string;
    fileName?: string;
  } | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Collect all user data
  const collectExportData = useCallback(async (): Promise<ExportData> => {
    const { start, end } = exportOptions.dateRange;
    
    // Get mood history within date range
    const moodHistory = getMoodHistory().filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= start && entryDate <= end;
    });

    // Get session data (simulated - in real app, this would come from your session store)
    const sessions = JSON.parse(localStorage.getItem('sembalun-session-history') || '[]')
      .filter((session: any) => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= start && sessionDate <= end;
      });

    // Get achievements
    const achievements = JSON.parse(localStorage.getItem('sembalun-achievements') || '[]');

    // Get progress data
    const progress = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0),
      streakData: JSON.parse(localStorage.getItem('sembalun-streaks') || '{}'),
      skillProgress: JSON.parse(localStorage.getItem('sembalun-skill-progress') || '{}'),
      moodStats: getMoodStats()
    };

    // Get cultural data
    const culturalData = {
      regionProgress: JSON.parse(localStorage.getItem('sembalun-cultural-progress') || '{}'),
      completedPractices: JSON.parse(localStorage.getItem('sembalun-cultural-completed') || '[]'),
      wisdomQuotes: JSON.parse(localStorage.getItem('sembalun-saved-wisdom') || '[]')
    };

    // Get user preferences
    const preferences = JSON.parse(localStorage.getItem('sembalun-user-preferences') || '{}');

    return {
      sessions: exportOptions.includeData.sessions ? sessions : [],
      moodHistory: exportOptions.includeData.moods ? moodHistory : [],
      achievements: exportOptions.includeData.achievements ? achievements : [],
      progress: exportOptions.includeData.progress ? progress : {},
      culturalData: exportOptions.includeData.cultural ? culturalData : {},
      preferences
    };
  }, [exportOptions, getMoodHistory, getMoodStats]);

  // Apply privacy filters
  const applyPrivacyFilter = (data: ExportData): ExportData => {
    const { privacy } = exportOptions;

    if (privacy === 'anonymous') {
      return {
        ...data,
        sessions: data.sessions.map(session => ({
          ...session,
          id: 'anonymous',
          timestamp: Math.floor(new Date(session.timestamp).getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000), // Round to day
          notes: session.notes ? '[redacted]' : undefined
        })),
        moodHistory: data.moodHistory.map(mood => ({
          ...mood,
          timestamp: Math.floor(new Date(mood.timestamp).getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000),
          note: mood.note ? '[redacted]' : undefined
        })),
        preferences: {
          ...data.preferences,
          reminderEnabled: undefined,
          communitySharing: undefined
        }
      };
    }

    if (privacy === 'summary') {
      return {
        sessions: [],
        moodHistory: [],
        achievements: data.achievements.map(achievement => ({
          name: achievement.name,
          category: achievement.category,
          achieved: achievement.achieved,
          unlockedAt: achievement.unlockedAt
        })),
        progress: {
          totalSessions: data.progress.totalSessions,
          totalMinutes: data.progress.totalMinutes,
          moodStats: data.progress.moodStats
        },
        culturalData: {
          regionProgress: Object.keys(data.culturalData.regionProgress || {}),
          completedPracticesCount: data.culturalData.completedPractices?.length || 0
        },
        preferences: {
          experienceLevel: data.preferences.experienceLevel,
          meditationGoals: data.preferences.meditationGoals,
          preferredRegions: data.preferences.preferredRegions
        }
      };
    }

    return data;
  };

  // Export as JSON
  const exportAsJSON = (data: ExportData): Blob => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      format: 'sembalun-export-v1',
      dateRange: exportOptions.dateRange,
      privacy: exportOptions.privacy,
      data: applyPrivacyFilter(data)
    };

    return new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  };

  // Export as CSV
  const exportAsCSV = (data: ExportData): Blob => {
    const csvData: string[] = [];

    if (data.sessions.length > 0) {
      csvData.push('# Sesi Meditasi');
      csvData.push('Tanggal,Tipe,Durasi (menit),Rating,Catatan');
      data.sessions.forEach(session => {
        const date = new Date(session.timestamp).toLocaleDateString('id-ID');
        const notes = (session.notes || '').replace(/"/g, '""');
        csvData.push(`"${date}","${session.type}","${session.duration}","${session.rating || ''}","${notes}"`);
      });
      csvData.push('');
    }

    if (data.moodHistory.length > 0) {
      csvData.push('# Riwayat Mood');
      csvData.push('Tanggal,Mood,Intensitas,Catatan');
      data.moodHistory.forEach(mood => {
        const date = new Date(mood.timestamp).toLocaleDateString('id-ID');
        const note = (mood.note || '').replace(/"/g, '""');
        csvData.push(`"${date}","${mood.mood}","${mood.intensity || ''}","${note}"`);
      });
    }

    return new Blob([csvData.join('\n')], { type: 'text/csv;charset=utf-8' });
  };

  // Generate progress image
  const exportAsImage = async (data: ExportData): Promise<Blob> => {
    // Create a canvas for the progress summary
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Sembalun - Laporan Meditasi', canvas.width / 2, 60);

    // Date range
    ctx.font = '16px system-ui';
    ctx.fillStyle = '#6b7280';
    const startDate = exportOptions.dateRange.start.toLocaleDateString('id-ID');
    const endDate = exportOptions.dateRange.end.toLocaleDateString('id-ID');
    ctx.fillText(`${startDate} - ${endDate}`, canvas.width / 2, 90);

    // Statistics
    const stats = [
      { label: 'Total Sesi', value: data.sessions.length.toString() },
      { label: 'Total Menit', value: data.progress.totalMinutes?.toString() || '0' },
      { label: 'Pencapaian', value: data.achievements.filter((a: any) => a.achieved).length.toString() },
      { label: 'Mood Terdominasi', value: data.progress.moodStats?.mostFrequent || 'Netral' }
    ];

    let y = 160;
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px system-ui';
    ctx.fillStyle = '#1f2937';

    stats.forEach((stat, index) => {
      const x = 120 + (index % 2) * 360;
      if (index % 2 === 0 && index > 0) y += 100;
      
      // Stat box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 40, y - 30, 280, 70);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 40, y - 30, 280, 70);
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px system-ui';
      ctx.fillText(stat.label, x - 20, y - 10);
      
      // Value
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 28px system-ui';
      ctx.fillText(stat.value, x - 20, y + 20);
    });

    // Export watermark
    ctx.textAlign = 'center';
    ctx.font = '14px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Diekspor dari Sembalun', canvas.width / 2, canvas.height - 30);

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob!), 'image/png');
    });
  };

  // Main export function
  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const data = await collectExportData();
      let blob: Blob;
      let fileName: string;

      switch (exportOptions.format) {
        case 'json':
          blob = exportAsJSON(data);
          fileName = `sembalun-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          blob = exportAsCSV(data);
          fileName = `sembalun-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'image':
          blob = await exportAsImage(data);
          fileName = `sembalun-progress-${new Date().toISOString().split('T')[0]}.png`;
          break;
        default:
          throw new Error('Format tidak didukung');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportResult({
        success: true,
        message: 'Data berhasil diekspor',
        fileName
      });

    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        message: 'Gagal mengekspor data: ' + (error as Error).message
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import function
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (importData.format !== 'sembalun-export-v1') {
          throw new Error('Format file tidak didukung');
        }

        // Import data back to localStorage
        const { data } = importData;
        
        if (data.sessions?.length > 0) {
          const existingSessions = JSON.parse(localStorage.getItem('sembalun-session-history') || '[]');
          const mergedSessions = [...existingSessions, ...data.sessions];
          localStorage.setItem('sembalun-session-history', JSON.stringify(mergedSessions));
        }

        if (data.preferences && Object.keys(data.preferences).length > 0) {
          const existingPreferences = JSON.parse(localStorage.getItem('sembalun-user-preferences') || '{}');
          const mergedPreferences = { ...existingPreferences, ...data.preferences };
          localStorage.setItem('sembalun-user-preferences', JSON.stringify(mergedPreferences));
        }

        setExportResult({
          success: true,
          message: 'Data berhasil diimpor'
        });

        setImportModalOpen(false);
      } catch (error) {
        setExportResult({
          success: false,
          message: 'Gagal mengimpor data: ' + (error as Error).message
        });
      }
    };
    reader.readAsText(file);
  };

  const copyShareableText = () => {
    const stats = `🧘 Progres Meditasi Sembalun

📊 Statistik ${exportOptions.dateRange.start.toLocaleDateString('id-ID')} - ${exportOptions.dateRange.end.toLocaleDateString('id-ID')}:
• Total sesi: ${JSON.parse(localStorage.getItem('sembalun-session-history') || '[]').length}
• Total waktu: ${Math.round((JSON.parse(localStorage.getItem('sembalun-session-history') || '[]').reduce((sum: number, session: any) => sum + (session.duration || 0), 0) / 60) * 10) / 10} jam
• Pencapaian: ${JSON.parse(localStorage.getItem('sembalun-achievements') || '[]').filter((a: any) => a.achieved).length}

Mari bermeditasi bersama! 🌸
#Mindfulness #MeditasiIndonesia #Sembalun`;

    navigator.clipboard.writeText(stats).then(() => {
      setExportResult({
        success: true,
        message: 'Teks berhasil disalin ke clipboard!'
      });
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-800 mb-4">
          Ekspor & Impor Data
        </h2>
        <p className="text-gray-600 mb-6">
          Ekspor progress meditasi Anda atau impor data dari backup sebelumnya
        </p>

        {/* Export Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Format Ekspor</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'json', label: 'JSON', icon: FileText, desc: 'Data lengkap' },
                { id: 'csv', label: 'CSV', icon: BarChart3, desc: 'Untuk spreadsheet' },
                { id: 'image', label: 'Gambar', icon: Image, desc: 'Ringkasan visual' },
              ].map(format => (
                <button
                  key={format.id}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format.id as any }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    exportOptions.format === format.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <format.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-medium text-gray-800">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Rentang Waktu</h3>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                  }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sampai</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                  }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Data yang Disertakan</h3>
            <div className="space-y-2">
              {[
                { key: 'sessions', label: 'Sesi Meditasi', desc: 'Riwayat sesi dan rating' },
                { key: 'moods', label: 'Data Mood', desc: 'Tracking perasaan harian' },
                { key: 'achievements', label: 'Pencapaian', desc: 'Badge dan milestone' },
                { key: 'progress', label: 'Progress', desc: 'Statistik dan streak' },
                { key: 'cultural', label: 'Data Budaya', desc: 'Progress regional dan wisdom' }
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeData[item.key as keyof typeof exportOptions.includeData]}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeData: { ...prev.includeData, [item.key]: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy Options */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Tingkat Privasi</h3>
            <div className="space-y-2">
              {[
                { id: 'full', label: 'Lengkap', desc: 'Semua data termasuk catatan pribadi' },
                { id: 'anonymous', label: 'Anonim', desc: 'Data tanpa informasi pribadi' },
                { id: 'summary', label: 'Ringkasan', desc: 'Hanya statistik umum' }
              ].map(option => (
                <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="privacy"
                    checked={exportOptions.privacy === option.id}
                    onChange={() => setExportOptions(prev => ({ ...prev, privacy: option.id as any }))}
                  />
                  <div>
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Ekspor Data
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setImportModalOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Impor Data
          </Button>

          <Button
            variant="outline"
            onClick={() => setShareModalOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan Progress
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {exportResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
                exportResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {exportResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${
                  exportResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {exportResult.message}
                </p>
                {exportResult.fileName && (
                  <p className="text-xs text-green-700 mt-1">
                    File: {exportResult.fileName}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Import Modal */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setImportModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <Card className="p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Impor Data
                </h3>
                <p className="text-gray-600 mb-4">
                  Pilih file backup Sembalun (format JSON) untuk diimpor
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400"
                />
                <div className="flex space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setImportModalOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShareModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <Card className="p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Bagikan Progress
                </h3>
                <p className="text-gray-600 mb-4">
                  Bagikan pencapaian meditasi Anda dengan teman dan keluarga
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={copyShareableText}
                    className="w-full justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Salin teks ringkasan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExportOptions(prev => ({ ...prev, format: 'image' }));
                      handleExport();
                      setShareModalOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Buat gambar progress
                  </Button>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShareModalOpen(false)}
                    className="flex-1"
                  >
                    Tutup
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};