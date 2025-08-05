import React from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const isGuest = !user;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading text-gray-800 mb-2">Pengaturan</h1>
        <p className="text-gray-600 font-body">Kelola preferensi aplikasi Anda</p>
      </div>

      {/* Profile Section */}
      <Card>
        <h2 className="text-lg font-heading text-gray-800 mb-4">Profil</h2>
        <div className="space-y-3">
          {!isGuest ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-800">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600">Terverifikasi</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Anda sedang menggunakan mode tamu</p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Masuk atau Daftar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* App Settings */}
      <Card>
        <h2 className="text-lg font-heading text-gray-800 mb-4">Pengaturan Aplikasi</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Notifikasi</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Suara</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mode Gelap</span>
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <h2 className="text-lg font-heading text-gray-800 mb-4">Privasi & Keamanan</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Ubah Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Pengaturan Privasi
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Ekspor Data
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="text-lg font-heading text-gray-800 mb-4">Tentang</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Versi</span>
            <span className="text-gray-800">1.0.0</span>
          </div>
          <Button variant="outline" className="w-full justify-start">
            Bantuan & Dukungan
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Kebijakan Privasi
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Syarat & Ketentuan
          </Button>
        </div>
      </Card>

      {/* Sign Out */}
      {!isGuest && (
        <Card>
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
          >
            Keluar
          </Button>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-gray-500 text-sm">
          Dibuat dengan ❤️ untuk komunitas meditasi Indonesia
        </p>
      </div>
    </div>
  );
};