
import { scrollToTop } from '../../hooks/useScrollToTop';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBack }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {showBack && (
          <button
            onClick={() => {
              scrollToTop();
              onBack?.();
            }}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className={`font-heading text-lg text-gray-800 ${showBack ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
          {title}
        </h1>
        <div className="w-8"></div>
      </div>
    </header>
  );
};