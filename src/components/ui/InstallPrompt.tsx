import { usePWAInstall } from '../../hooks/usePWAInstall';
import { CairnIcon } from './CairnIcon';

export const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, promptInstall, dismissInstallPrompt } = usePWAInstall();

  if (!showInstallPrompt) return null;

  const handleInstall = async () => {
    const success = await promptInstall();
    if (!success) {
      // If browser prompt failed, still dismiss our custom prompt
      dismissInstallPrompt();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with Cairn */}
        <div className="text-center pt-8 pb-4">
          <div className="w-16 h-16 mx-auto mb-4 animate-in zoom-in duration-500 delay-150">
            <CairnIcon size={64} />
          </div>
          <h2 className="text-xl font-heading text-gray-800 mb-2">
            Tambahkan ke Layar Utama
          </h2>
          <p className="text-gray-600 font-body text-sm px-6 leading-relaxed">
            Akses Sembalun dengan mudah kapan saja. Seperti aplikasi asli, tapi lebih ringan.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-body">Akses offline untuk meditasi</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-body">Lebih cepat dan hemat data</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5 5V7z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-body">Notifikasi untuk pengingat lembut</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          <button
            onClick={handleInstall}
            className={`
              w-full py-3 px-4 rounded-xl font-medium text-white 
              bg-gradient-to-r from-green-600 to-green-700 
              hover:from-green-700 hover:to-green-800 
              active:scale-98 transform transition-all duration-200
              shadow-lg hover:shadow-xl
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
              </svg>
              <span>Tambahkan Sekarang</span>
            </div>
          </button>
          
          <button
            onClick={dismissInstallPrompt}
            className={`
              w-full py-3 px-4 rounded-xl font-medium text-gray-600 
              bg-gray-100 hover:bg-gray-200 
              active:scale-98 transform transition-all duration-200
            `}
          >
            Mungkin Nanti
          </button>
        </div>

        {/* Gentle note */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 text-center font-body">
            Pengingat ini tidak akan muncul lagi hari ini
          </p>
        </div>
      </div>
    </div>
  );
};