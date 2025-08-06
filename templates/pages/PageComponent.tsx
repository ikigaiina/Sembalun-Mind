import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { scrollToTop } from '../hooks/useScrollToTop';

/**
 * PAGE_NAME Page Template
 * 
 * This is a base template for creating new page components in the Sembalun app.
 * Replace PAGE_NAME with your actual page name.
 * 
 * Features included:
 * - Full page layout structure
 * - Navigation integration
 * - Loading and error states
 * - Responsive design
 * - Indonesian language support
 * - SEO considerations
 * - Accessibility features
 */

// TODO: Define your page's data types
interface PAGE_DATA_TYPE {
  id: string;
  title: string;
  description?: string;
  status: 'loading' | 'success' | 'error';
  data?: unknown;
}

// TODO: Define page state interface
interface PAGE_NAME_State {
  isLoading: boolean;
  error: string | null;
  data: PAGE_DATA_TYPE[] | null;
  selectedTab: string;
  searchQuery: string;
  filters: Record<string, unknown>;
}

/**
 * PAGE_NAME Page Component
 * 
 * TODO: Add detailed page description
 * TODO: Document user flows and interactions
 * TODO: List required permissions or auth states
 */
export const PAGE_NAME: React.FC = () => {
  const navigate = useNavigate();
  
  // TODO: Add your page state
  const [state, setState] = useState<PAGE_NAME_State>({
    isLoading: true,
    error: null,
    data: null,
    selectedTab: 'main',
    searchQuery: '',
    filters: {}
  });

  // TODO: Add your data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // TODO: Replace with actual data fetching
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        const mockData: PAGE_DATA_TYPE[] = [
          {
            id: '1',
            title: 'Contoh Data 1',
            description: 'Deskripsi data pertama',
            status: 'success'
          },
          {
            id: '2',
            title: 'Contoh Data 2',
            description: 'Deskripsi data kedua',
            status: 'success'
          }
        ];

        setState(prev => ({
          ...prev,
          isLoading: false,
          data: mockData
        }));

      } catch (error) {
        console.error('Error fetching page data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Gagal memuat data. Silakan coba lagi.'
        }));
      }
    };

    fetchData();
  }, []);

  // TODO: Add your event handlers
  const handleTabChange = (tab: string) => {
    setState(prev => ({ ...prev, selectedTab: tab }));
  };

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleRefresh = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Re-trigger useEffect
    window.location.reload();
  };

  const handleNavigateBack = () => {
    scrollToTop();
    navigate(-1);
  };

  const handleNavigateTo = (path: string) => {
    scrollToTop();
    navigate(path);
  };

  // TODO: Add loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // TODO: Add error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="px-4 max-w-md mx-auto">
          <Card className="text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-heading text-gray-800 text-lg mb-2">
                  Oops, ada masalah
                </h3>
                <p className="text-gray-600 font-body text-sm mb-4">
                  {state.error}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleRefresh}
                  className="w-full"
                >
                  Coba Lagi
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNavigateBack}
                  className="w-full"
                >
                  Kembali
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // TODO: Replace with your page content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="small"
                onClick={handleNavigateBack}
                aria-label="Kembali"
              >
                ←
              </Button>
              <h1 className="font-heading text-gray-800 text-xl">
                TODO: Judul Halaman
              </h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="small"
                onClick={handleRefresh}
                aria-label="Refresh"
              >
                🔄
              </Button>
            </div>
          </div>

          {/* Search Bar (Optional) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200 font-body text-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Optional) */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-1">
            {['main', 'settings', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-lg font-body text-sm transition-all duration-200 ${
                  state.selectedTab === tab
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'main' ? 'Utama' : 
                 tab === 'settings' ? 'Pengaturan' : 'Riwayat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        
        {/* Main Content Cards */}
        {state.data?.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-heading text-gray-800 text-base mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-600 font-body text-sm">
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="ml-4">
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'success' ? 'bg-green-400' :
                  item.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {state.data?.length === 0 && (
          <Card className="text-center py-8">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📭</span>
              </div>
              <div>
                <h3 className="font-heading text-gray-700 text-base mb-1">
                  Belum ada data
                </h3>
                <p className="text-gray-500 font-body text-sm">
                  Data akan muncul di sini setelah Anda mulai menggunakan fitur ini
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Cards */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-primary text-xl">✨</span>
            </div>
            <div>
              <h3 className="font-heading text-gray-800 text-base mb-1">
                TODO: Aksi Utama
              </h3>
              <p className="text-gray-600 font-body text-sm mb-3">
                Deskripsi aksi yang dapat dilakukan pengguna
              </p>
            </div>
            <Button
              onClick={() => handleNavigateTo('/some-path')}
              className="w-full"
            >
              Mulai Sekarang
            </Button>
          </div>
        </Card>

        {/* Development Tools (only in dev mode) */}
        {import.meta.env?.DEV && (
          <Card padding="small" className="bg-yellow-50 border-yellow-200">
            <h4 className="font-heading text-yellow-800 mb-2 text-sm">Development Tools</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="small"
                onClick={() => console.log('Page state:', state)}
                className="w-full text-xs"
              >
                Log State
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => setState(prev => ({ ...prev, error: 'Test error message' }))}
                className="w-full text-xs"
              >
                Test Error State
              </Button>
            </div>
          </Card>
        )}

        {/* Bottom spacing for navigation */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

// TODO: Add display name
PAGE_NAME.displayName = 'PAGE_NAME';

/**
 * Example Usage:
 * 
 * Add to your router:
 * ```tsx
 * <Route path="/page-name" element={<PAGE_NAME />} />
 * ```
 * 
 * Navigate to page:
 * ```tsx
 * navigate('/page-name');
 * ```
 */