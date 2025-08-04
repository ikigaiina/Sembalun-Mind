import React, { useState } from 'react';
import { achievementResetService, type ResetOptions } from '../../services/achievementResetService';
import { Button } from '../ui/Button';

interface ResetResult {
  success: boolean;
  message: string;
  deletedCounts?: {
    achievements: number;
    sessions: number;
    streaks: number;
    moodEntries: number;
    cairnProgress: number;
    courseProgress: number;
  };
  totalUsersAffected?: number;
  totalDeleted?: number;
}

interface FirestoreDocument {
  [key: string]: unknown;
}

interface PreviewData {
  totalDocuments: number;
  collections: {
    [key: string]: {
      count: number;
      sampleData: {
        data: FirestoreDocument;
      }[];
    };
  };
}

const AchievementResetPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [userId, setUserId] = useState('');
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    resetAchievements: true,
    resetProgress: true,
    resetStreaks: true,
    resetMoodEntries: true,
    resetCairnProgress: true,
    resetCourseProgress: true,
    confirmReset: false
  });

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const previewData = await achievementResetService.previewReset(userId || undefined);
      setPreview(previewData);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSingleUser = async () => {
    if (!userId.trim()) {
      setResult({
        success: false,
        message: 'User ID tidak boleh kosong'
      });
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin mereset semua data untuk user "${userId}"?\n\nData yang akan dihapus:\n- Pencapaian\n- Sesi meditasi\n- Streak\n- Mood entries\n- Cairn progress\n- Course progress\n\nTindakan ini TIDAK DAPAT dibatalkan!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      // Backup first
      const backup = await achievementResetService.backupUserData(userId);
      if (backup.success) {
        console.log('Data backup created:', backup.message);
      }

      // Then reset
      const resetResult = await achievementResetService.resetUserAchievements(userId, {
        ...resetOptions,
        confirmReset: true
      });
      
      setResult(resetResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAllUsers = async () => {
    const confirmMessage = `PERINGATAN KERAS!\n\nAnda akan mereset SEMUA DATA untuk SEMUA PENGGUNA!\n\nIni akan menghapus:\n- Semua pencapaian\n- Semua sesi meditasi\n- Semua streak\n- Semua mood entries\n- Semua cairn progress\n- Semua course progress\n\nTindakan ini TIDAK DAPAT dibatalkan dan akan mempengaruhi SELURUH DATABASE!\n\nApakah Anda BENAR-BENAR yakin?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const doubleConfirm = confirm('Konfirmasi sekali lagi - Anda akan menghapus SEMUA data pengguna. Lanjutkan?');
    if (!doubleConfirm) {
      return;
    }

    setIsLoading(true);
    try {
      const resetResult = await achievementResetService.resetAllUsersAchievements({
        ...resetOptions,
        confirmReset: true
      });
      
      setResult(resetResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (option: keyof ResetOptions) => {
    setResetOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          ⚠️ Panel Reset Pencapaian - DANGER ZONE
        </h2>
        <p className="text-gray-600">
          Panel admin untuk mereset pencapaian dan progress pengguna. 
          <strong className="text-red-500"> Gunakan dengan sangat hati-hati!</strong>
        </p>
      </div>

      {/* Reset Options */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Pilih Data yang Akan Direset:</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(resetOptions).map(([key, value]) => {
            if (key === 'confirmReset') return null;
            return (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={() => handleOptionChange(key as keyof ResetOptions)}
                  className="rounded"
                />
                <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Single User Reset */}
      <div className="border border-orange-200 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-orange-700 mb-3">Reset User Tunggal</h3>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            placeholder="Masukkan User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button
            onClick={handlePreview}
            disabled={isLoading}
            variant="secondary"
          >
            Preview
          </Button>
        </div>
        <Button
          onClick={handleResetSingleUser}
          disabled={isLoading || !userId.trim()}
          variant="primary"
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isLoading ? 'Memproses...' : 'Reset User Ini'}
        </Button>
      </div>

      {/* All Users Reset */}
      <div className="border border-red-300 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-red-700 mb-3">⚠️ Reset SEMUA User</h3>
        <p className="text-sm text-red-600 mb-3">
          Ini akan mereset data untuk SEMUA pengguna di database!
        </p>
        <Button
          onClick={handleResetAllUsers}
          disabled={isLoading}
          variant="primary"
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isLoading ? 'Memproses...' : 'RESET SEMUA USER (BAHAYA!)'}
        </Button>
      </div>

      {/* Preview Results */}
      {preview && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-700 mb-3">Preview Data:</h3>
          <p className="mb-2">Total dokumen yang akan dihapus: <strong>{preview.totalDocuments}</strong></p>
          <div className="space-y-2">
            {Object.entries(preview.collections).map(([collection, data]: [string, { count: number; sampleData: { data: FirestoreDocument; }[]; }]) => (
              <div key={collection} className="text-sm">
                <strong>{collection}:</strong> {data.count} dokumen
                {data.count > 0 && (
                  <div className="ml-4 text-xs text-gray-600">
                    Sample: {JSON.stringify(data.sampleData[0]?.data || {}, null, 2).substring(0, 100)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.success ? '✅ Berhasil' : '❌ Gagal'}
          </h3>
          <p className="mb-3">{result.message}</p>
          
          {result.deletedCounts && (
            <div className="text-sm">
              <p><strong>Detail penghapusan:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Achievements: {result.deletedCounts.achievements}</li>
                <li>Sessions: {result.deletedCounts.sessions}</li>
                <li>Streaks: {result.deletedCounts.streaks}</li>
                <li>Mood Entries: {result.deletedCounts.moodEntries}</li>
                <li>Cairn Progress: {result.deletedCounts.cairnProgress}</li>
                <li>Course Progress: {result.deletedCounts.courseProgress}</li>
              </ul>
            </div>
          )}

          {result.totalUsersAffected && (
            <p className="text-sm mt-2">
              <strong>Total pengguna terpengaruh:</strong> {result.totalUsersAffected}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-700 mb-2">📋 Petunjuk Penggunaan:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Untuk reset user tunggal: masukkan User ID dan klik "Preview" untuk melihat data</li>
          <li>Pilih jenis data yang ingin direset menggunakan checkbox di atas</li>
          <li>Data akan di-backup ke localStorage sebelum dihapus</li>
          <li>Untuk melihat backup: buka Developer Tools → Application → Local Storage</li>
          <li>Tindakan reset TIDAK DAPAT dibatalkan!</li>
        </ol>
      </div>
    </div>
  );
};

export default AchievementResetPanel;