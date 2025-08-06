import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { progressReportsService } from '../../services/progressReportsService';
import type { ProgressReport, ReportSummary } from '../../services/progressReportsService';

interface ProgressReportsProps {
  className?: string;
}

export const ProgressReports: React.FC<ProgressReportsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'summary' | 'trends'>('reports');
  const [selectedType, setSelectedType] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');
  
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userReports, reportSummary] = await Promise.all([
        progressReportsService.getUserReports(user.uid, selectedType, 10),
        progressReportsService.getReportSummary(user.uid, selectedType)
      ]);

      setReports(userReports);
      setSummary(reportSummary);
      
      if (userReports.length > 0 && !selectedReport) {
        setSelectedReport(userReports[0]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedType, selectedReport]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedType, loadData]);

  const generateNewReport = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const newReport = await progressReportsService.generateProgressReport(user.uid, selectedType);
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      alert('Report berhasil dibuat!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal membuat report. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number): string => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getReportTypeLabel = (type: string): string => {
    switch (type) {
      case 'weekly': return 'Mingguan';
      case 'monthly': return 'Bulanan';
      case 'quarterly': return 'Kuartalan';
      case 'yearly': return 'Tahunan';
      default: return type;
    }
  };

  const renderMetricCard = (title: string, value: number | string, suffix: string = '', icon: string = '📊') => (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-blue-600">{value}{suffix}</div>
      <div className="text-sm text-blue-700">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Progress Reports</h3>
          <p className="text-gray-600">Laporan perkembangan meditasi Anda</p>
        </div>
        <div className="text-3xl">📈</div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Report Type Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedType === type
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getReportTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateNewReport} 
          disabled={generating}
          className="flex items-center space-x-2"
        >
          <span>{generating ? '⏳' : '📊'}</span>
          <span>{generating ? 'Generating...' : 'Generate Report'}</span>
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'reports', label: 'Reports', icon: '📄' },
          { id: 'summary', label: 'Summary', icon: '📊' },
          { id: 'trends', label: 'Trends', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'reports' | 'summary' | 'trends')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4">Report History</h4>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-600 text-sm">Belum ada report</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedReport?.id === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{report.period.label}</div>
                    <div className="text-sm text-gray-600">
                      {report.metrics.sessions.total} sesi • {formatDate(report.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-xl font-semibold text-gray-900">{selectedReport.period.label}</h4>
                  <p className="text-gray-600">
                    {formatDate(selectedReport.period.start)} - {formatDate(selectedReport.period.end)}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {renderMetricCard('Total Sesi', selectedReport.metrics.sessions.total, '', '🧘')}
                  {renderMetricCard('Durasi Rata-rata', selectedReport.metrics.sessions.avgDuration, ' min', '⏰')}
                  {renderMetricCard('Konsistensi', selectedReport.metrics.consistency.frequencyScore, '%', '📊')}
                  {renderMetricCard('Peningkatan Mood', selectedReport.metrics.wellbeing.moodImprovement, '', '😊')}
                </div>

                {/* Highlights */}
                {selectedReport.insights.highlights.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                      <span className="mr-2">🎉</span>
                      Highlights
                    </h5>
                    <ul className="space-y-1">
                      {selectedReport.insights.highlights.map((highlight, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start">
                          <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comparisons */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Perbandingan dengan Periode Sebelumnya
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Sesi', value: selectedReport.comparisons.previousPeriod.sessionsChange, suffix: '' },
                      { label: 'Durasi', value: selectedReport.comparisons.previousPeriod.durationChange, suffix: ' min' },
                      { label: 'Konsistensi', value: selectedReport.comparisons.previousPeriod.consistencyChange, suffix: '%' },
                      { label: 'Mood', value: selectedReport.comparisons.previousPeriod.moodChange, suffix: '' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-lg font-bold ${getChangeColor(item.value)}`}>
                          {getChangeIcon(item.value)} {item.value > 0 ? '+' : ''}{item.value}{item.suffix}
                        </div>
                        <div className="text-xs text-blue-700">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {selectedReport.insights.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h5 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      <span className="mr-2">💡</span>
                      Rekomendasi
                    </h5>
                    <ul className="space-y-1">
                      {selectedReport.insights.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Pilih report untuk melihat detail
                </h4>
                <p className="text-gray-600">
                  Klik pada report di sebelah kiri atau generate report baru
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-purple-600">{summary.totalReports}</div>
              <div className="text-sm text-purple-700">Total Reports</div>
            </div>
            
            {summary.latestReport && (
              <>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">🧘</div>
                  <div className="text-2xl font-bold text-green-600">
                    {summary.latestReport.metrics.sessions.total}
                  </div>
                  <div className="text-sm text-green-700">Sesi Terakhir</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.latestReport.metrics.consistency.frequencyScore}%
                  </div>
                  <div className="text-sm text-blue-700">Konsistensi</div>
                </div>
              </>
            )}
          </div>

          {/* Latest Report Summary */}
          {summary.latestReport && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Report Terbaru: {summary.latestReport.period.label}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">✨ Highlights</h5>
                  <ul className="space-y-2">
                    {summary.latestReport.insights.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">📈 Growth Areas</h5>
                  <ul className="space-y-2">
                    {summary.latestReport.comparisons.personal.growthAreas.slice(0, 3).map((area, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && summary && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Trend Analysis - {getReportTypeLabel(selectedType)}
            </h4>
            <p className="text-gray-600">
              Analisis tren berdasarkan {summary.totalReports} report terakhir
            </p>
          </div>

          {summary.trends.sessionsPerPeriod.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Sessions Trend */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🧘</span>
                  Sesi per Periode
                </h5>
                <div className="space-y-2">
                  {summary.trends.sessionsPerPeriod.slice(-5).map((sessions, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Periode {index + 1}</span>
                      <span className="font-medium">{sessions}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consistency Trend */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  Konsistensi (%)
                </h5>
                <div className="space-y-2">
                  {summary.trends.consistencyPerPeriod.slice(-5).map((consistency, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Periode {index + 1}</span>
                      <span className="font-medium">{Math.round(consistency)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Improvement Trend */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">😊</span>
                  Peningkatan Mood
                </h5>
                <div className="space-y-2">
                  {summary.trends.moodImprovementPerPeriod.slice(-5).map((mood, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Periode {index + 1}</span>
                      <span className="font-medium">+{mood.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum cukup data untuk trend analysis
              </h4>
              <p className="text-gray-600 mb-4">
                Generate beberapa report untuk melihat trend perkembangan
              </p>
              <Button onClick={generateNewReport}>
                📊 Generate Report
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};