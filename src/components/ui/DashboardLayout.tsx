import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Globe, BookOpen, User, Heart } from 'lucide-react';
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

// Enhanced 2025 Navigation with Meditation-focused Design
const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: <Home className="w-5 h-5" />
  },
  {
    id: 'explore', 
    label: 'Explore',
    path: '/explore',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'journal',
    label: 'Journal',
    path: '/journal', 
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: <User className="w-5 h-5" />
  }
];

// Enhanced 2025 Dashboard Layout with Glassmorphic Navigation
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
      <main className={`flex-1 ${showBottomNav ? 'pb-24' : 'pb-6'}`}>
        <div className="max-w-7xl mx-auto relative">
          {children}
        </div>
      </main>

      {/* Enhanced Bottom Navigation with 2025 Design */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40"
          >
            {/* Enhanced Glassmorphic Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/70 backdrop-blur-2xl border-t border-white/20" />
            
            {/* Floating Navigation Container */}
            <div className="relative max-w-sm mx-auto px-4 py-3">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg p-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="flex items-center justify-around">
                  {navigationItems.map((item, index) => {
                    const active = isActive(item.path);
                    
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          relative flex flex-col items-center justify-center p-3 rounded-2xl
                          transition-all duration-300 group
                          focus:outline-none focus:ring-2 focus:ring-meditation-zen-500/20
                          ${active ? 'text-meditation-zen-600' : 'text-gray-500'}
                        `}
                        style={{
                          background: active 
                            ? 'linear-gradient(135deg, rgba(106,143,111,0.15) 0%, rgba(106,143,111,0.05) 100%)'
                            : 'transparent'
                        }}
                      >
                        {/* Enhanced Icon Container with Glow */}
                        <div className="relative mb-2">
                          <motion.div 
                            className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}
                            animate={active ? { 
                              filter: 'drop-shadow(0 0 8px rgba(106,143,111,0.4))' 
                            } : {}}
                          >
                            {item.icon}
                          </motion.div>
                          
                          {/* Enhanced Active Indicator */}
                          <AnimatePresence>
                            {active && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                              >
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-meditation-zen-400 to-meditation-focus-400 shadow-lg" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Enhanced Label */}
                        <motion.span 
                          className={`text-xs font-medium transition-all duration-300 ${
                            active ? 'opacity-100 font-semibold' : 'opacity-70'
                          }`}
                          animate={active ? { scale: 1.05 } : { scale: 1 }}
                        >
                          {item.label}
                        </motion.span>
                        
                        {/* Floating Heart Animation for Active State */}
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0], 
                                y: -20, 
                                scale: [0, 1, 0] 
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatDelay: 3,
                                ease: "easeOut"
                              }}
                              className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                            >
                              <Heart className="w-3 h-3 text-meditation-zen-400 fill-current" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Enhanced Ripple Effect */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-meditation-zen-400/0 via-meditation-zen-400/5 to-meditation-zen-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
            
            {/* Enhanced Safe Area with Gradient */}
            <div 
              className="bg-gradient-to-t from-white/95 to-white/70 backdrop-blur-xl" 
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
            />

            {/* Subtle Ambient Glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at bottom center, rgba(106,143,111,0.1) 0%, transparent 70%)',
                borderRadius: 'inherit'
              }}
            />
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};