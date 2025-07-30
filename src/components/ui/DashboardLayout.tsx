import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scrollToTop } from '../../hooks/useScrollToTop';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )
  },
  {
    id: 'explore',
    label: 'Jelajah',
    path: '/explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    )
  },
  {
    id: 'journal',
    label: 'Jurnal',
    path: '/journal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    )
  },
  {
    id: 'profile',
    label: 'Profil',
    path: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  }
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showBottomNav = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    scrollToTop();
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`min-h-screen flex flex-col ${className}`} style={{backgroundColor: 'var(--color-background)'}}>
      {/* Main content area */}
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : 'pb-6'}`}>
        <div className="max-w-md mx-auto relative">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50" />
          
          {/* Navigation content */}
          <div className="relative max-w-md mx-auto px-4 py-2">
            <div className="flex items-center justify-around">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-xl
                      transition-all duration-300 transform-gpu
                      hover:scale-105 active:scale-95
                      focus:outline-none focus:ring-2 focus:ring-opacity-50
                      ${active ? 'text-current' : 'text-gray-500'}
                    `}
                    style={{
                      color: active ? 'var(--color-primary)' : undefined,
                      backgroundColor: active ? 'rgba(106, 143, 111, 0.1)' : 'transparent',
                    }}
                  >
                    {/* Icon container with active indicator */}
                    <div className="relative mb-1">
                      <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
                        {item.icon}
                      </div>
                      
                      {/* Active indicator dot */}
                      {active && (
                        <div 
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                    </div>
                    
                    {/* Label */}
                    <span 
                      className={`text-xs font-medium transition-all duration-300 ${
                        active ? 'opacity-100 font-semibold' : 'opacity-70'
                      }`}
                    >
                      {item.label}
                    </span>
                    
                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-xl" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Safe area padding for devices with bottom notch */}
          <div 
            className="bg-white/80 backdrop-blur-md" 
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          />
        </nav>
      )}
    </div>
  );
};