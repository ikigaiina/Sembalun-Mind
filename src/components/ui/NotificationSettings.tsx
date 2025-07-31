import { useNotifications } from '../../hooks/useNotifications';
import { Button } from './Button';
import { Card } from './Card';

export const NotificationSettings: React.FC = () => {
  const {
    settings,
    permission,
    isSupported,
    requestPermission,
    disable,
    updateSetting,
    canShowNotifications
  } = useNotifications();

  if (!isSupported) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔕</span>
          </div>
          <p className="text-gray-600 font-body text-sm">
            Notifikasi tidak didukung di browser ini
          </p>
        </div>
      </Card>
    );
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (!granted) {
      // Could show a gentle message about benefits
      console.log('Notification permission not granted');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-gray-800 text-lg">
                Pengingat Lembut
              </h3>
              <p className="text-gray-600 font-body text-sm">
                Notifikasi tenang untuk membantu konsistensi meditasi
              </p>
            </div>
            
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${canShowNotifications ? 'bg-green-100' : 'bg-gray-100'}
            `}>
              <span className="text-xl">
                {canShowNotifications ? '🔔' : '🔕'}
              </span>
            </div>
          </div>

          {permission === 'default' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">💡</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">
                    Manfaat Pengingat Lembut
                  </h4>
                  <ul className="text-blue-700 text-xs space-y-1 font-body">
                    <li>• Membantu membangun kebiasaan meditasi</li>
                    <li>• Pengingat yang tidak mengganggu</li>
                    <li>• Motivasi untuk menjaga konsistensi</li>
                  </ul>
                  <Button
                    onClick={handleEnableNotifications}
                    size="small"
                    className="mt-3 text-xs px-3 py-1.5"
                  >
                    Aktifkan Pengingat
                  </Button>
                </div>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-orange-700 text-sm font-body">
                    Notifikasi diblokir. Kamu bisa mengaktifkannya di pengaturan browser.
                  </p>
                </div>
              </div>
            </div>
          )}

          {canShowNotifications && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              {/* Daily Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    Pengingat Harian
                  </h4>
                  <p className="text-gray-600 text-xs font-body">
                    Notifikasi lembut untuk meditasi rutin
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dailyReminder}
                    onChange={(e) => updateSetting('dailyReminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {settings.dailyReminder && (
                <div className="ml-4 pl-4 border-l border-gray-200">
                  <label className="block text-xs text-gray-700 font-body mb-2">
                    Waktu Pengingat
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Breathing Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    Pengingat Pernapasan
                  </h4>
                  <p className="text-gray-600 text-xs font-body">
                    Saran latihan pernapasan singkat
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.breathingReminder}
                    onChange={(e) => updateSetting('breathingReminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {/* Streak Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    Apresiasi Pencapaian
                  </h4>
                  <p className="text-gray-600 text-xs font-body">
                    Rayakan konsistensi meditasimu
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.streakReminder}
                    onChange={(e) => updateSetting('streakReminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {/* Disable Button */}
              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={disable}
                  variant="outline"
                  size="small"
                  className="text-xs text-gray-600 border-gray-300"
                >
                  Nonaktifkan Semua Pengingat
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Privacy Note */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <span className="text-sm mt-0.5">🔒</span>
          <p className="text-xs text-gray-600 font-body leading-relaxed">
            Semua pengingat bersifat lokal dan tidak mengirim data pribadi. 
            Pengaturan disimpan di perangkatmu saja.
          </p>
        </div>
      </div>
    </div>
  );
};