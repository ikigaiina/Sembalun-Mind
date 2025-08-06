import React, { useState, useEffect } from 'react';
import { MeditationModal, INDONESIAN_COLORS } from './IndonesianModal';
import { Button } from './Button';
import { Input } from './Input';
import { useAuth } from '../../hooks/useAuth';
import { AuthError } from '../../utils/auth-error';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  darkMode?: boolean;
}

// Indonesian meditation-inspired authentication
export const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'signin',
  darkMode = false
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<{
    type: 'email' | 'google' | 'apple' | 'guest' | null;
    action: 'signin' | 'signup' | 'reset' | null;
  }>({ type: null, action: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [breathingGuide, setBreathingGuide] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, resetPassword, continueAsGuest } = useAuth();

  // Breathing animation for stress-free authentication
  useEffect(() => {
    if (loading && breathingGuide) {
      const interval = setInterval(() => {
        // Simple breathing guide animation
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading, breathingGuide]);

  const isFormValid = () => {
    if (mode === 'reset') {
      return formData.email.trim() !== '';
    }
    
    if (mode === 'signin') {
      return formData.email.trim() !== '' && formData.password.trim() !== '';
    }
    
    if (mode === 'signup') {
      return (
        formData.email.trim() !== '' &&
        formData.password.trim() !== '' &&
        formData.confirmPassword.trim() !== '' &&
        formData.displayName.trim() !== '' &&
        formData.password === formData.confirmPassword
      );
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setLoadingState({ type: 'email', action: mode });
    setBreathingGuide(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Password tidak cocok');
        }
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccess('Email reset password telah dikirim! Periksa kotak masuk Anda.');
      }
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setError(getIndonesianErrorMessage(err.code));
      } else {
        setError(getIndonesianErrorMessage((err as Error).message));
      }
    } finally {
      setLoading(false);
      setLoadingState({ type: null, action: null });
      setBreathingGuide(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(true);
    setLoadingState({ type: provider, action: 'signin' });
    setBreathingGuide(true);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setError(getIndonesianErrorMessage(err.code));
      } else {
        setError(getIndonesianErrorMessage((err as Error).message));
      }
    } finally {
      setLoading(false);
      setLoadingState({ type: null, action: null });
      setBreathingGuide(false);
    }
  };

  const handleGuestContinue = () => {
    setLoadingState({ type: 'guest', action: 'signin' });
    try {
      continueAsGuest();
      onClose();
    } finally {
      setLoadingState({ type: null, action: null });
    }
  };

  const getIndonesianErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email atau password tidak valid';
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar';
      case 'auth/weak-password':
        return 'Password minimal 6 karakter';
      case 'auth/invalid-email':
        return 'Masukkan alamat email yang valid';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Coba lagi nanti';
      case 'Password tidak cocok':
        return 'Password tidak cocok';
      default:
        return code || 'Terjadi kesalahan. Silakan coba lagi.';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Selamat Datang Kembali';
      case 'signup':
        return 'Bergabung dengan Sembalun';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Sembalun';
    }
  };

  const getModeSubtitle = () => {
    switch (mode) {
      case 'signin':
        return 'Lanjutkan perjalanan mindfulness Anda';
      case 'signup':
        return 'Mulai perjalanan menuju kedamaian batin';
      case 'reset':
        return 'Masukkan email untuk reset password';
      default:
        return '';
    }
  };

  return (
    <MeditationModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModeTitle()}
      size="medium"
      gestureEnabled={true}
      darkMode={darkMode}
      className="overflow-hidden"
    >
      <div className="p-8">
        {/* Cultural Header with Lotus Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 relative">
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden ${
                breathingGuide ? 'animate-pulse' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
                boxShadow: `0 8px 32px ${INDONESIAN_COLORS.primary.green}40`
              }}
            >
              {/* Lotus/Meditation Icon */}
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3C8.5 3 6 5.5 6 9c0 2 1 4 3 5 1-1 3-1 3-3s2-2 3-1c1-1 3-3 3-5 0-3.5-2.5-6-6-6z M12 21c2-2 6-6 6-12C18 5.5 15.5 3 12 3S6 5.5 6 9c0 6 4 10 6 12z" />
              </svg>
              
              {/* Breathing guide ring animation */}
              {breathingGuide && (
                <div 
                  className="absolute inset-0 border-2 border-white rounded-full opacity-50"
                  style={{
                    animation: 'breathe 4s ease-in-out infinite'
                  }}
                />
              )}
            </div>

            {/* Cultural pattern decoration */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10C15.58 10 12 13.58 12 18H28C28 13.58 24.42 10 20 10Z" fill="#2D7D32" fill-opacity="0.1"/><circle cx="20" cy="20" r="3" fill="#FF8F00" fill-opacity="0.2"/></svg>')}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          
          <p 
            className="text-sm font-body"
            style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
          >
            {getModeSubtitle()}
          </p>
        </div>

        {/* Error/Success Messages with Indonesian styling */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-2xl text-sm font-body border"
            style={{
              backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              borderColor: '#FCA5A5',
              color: darkMode ? '#FCA5A5' : '#DC2626'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div 
            className="mb-6 p-4 rounded-2xl text-sm font-body border"
            style={{
              backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4',
              borderColor: '#86EFAC',
              color: darkMode ? '#86EFAC' : '#16A34A'
            }}
          >
            {success}
          </div>
        )}

        {/* Multi-step form with cultural elements */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Masukkan alamat email Anda"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          {mode !== 'reset' && (
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password Anda"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          )}

          {mode === 'signup' && (
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Konfirmasi password Anda"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          )}

          {/* Cultural-themed submit button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl font-medium font-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: loading 
                ? `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}80, ${INDONESIAN_COLORS.secondary.bamboo}80)`
                : `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
              color: 'white',
              boxShadow: `0 8px 24px ${INDONESIAN_COLORS.primary.green}40`,
              border: `1px solid ${INDONESIAN_COLORS.primary.gold}40`
            }}
            disabled={loading || !isFormValid()}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {mode === 'signin' && (loading ? 'Masuk...' : 'Masuk')}
            {mode === 'signup' && (loading ? 'Membuat akun...' : 'Buat Akun')}
            {mode === 'reset' && (loading ? 'Mengirim email...' : 'Kirim Email Reset')}
          </button>
        </form>

        {/* Social authentication with Indonesian cultural styling */}
        {mode !== 'reset' && (
          <>
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="w-full border-t"
                  style={{ borderColor: darkMode ? INDONESIAN_COLORS.neutral.shadow : INDONESIAN_COLORS.neutral.stone }}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span 
                  className="px-4 font-body"
                  style={{ 
                    backgroundColor: darkMode ? '#1A4D2E' : 'white',
                    color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow
                  }}
                >
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Google button with cultural styling */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-3 font-body"
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                style={{
                  borderColor: INDONESIAN_COLORS.primary.green,
                  backgroundColor: darkMode ? 'rgba(45, 125, 50, 0.1)' : 'white'
                }}
              >
                {loadingState.type === 'google' && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loadingState.type !== 'google' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {loadingState.type === 'google' ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
              </Button>

              {/* Guest access with cultural styling */}
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2 py-3 font-body"
                onClick={handleGuestContinue}
                disabled={loading}
                style={{
                  backgroundColor: darkMode ? 'rgba(255, 143, 0, 0.1)' : INDONESIAN_COLORS.neutral.sand,
                  borderColor: INDONESIAN_COLORS.primary.gold,
                  color: darkMode ? INDONESIAN_COLORS.primary.gold : INDONESIAN_COLORS.primary.brown
                }}
              >
                {loadingState.type === 'guest' && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loadingState.type === 'guest' ? 'Menyiapkan...' : 'Lanjutkan sebagai Tamu'}
              </Button>
            </div>
          </>
        )}

        {/* Navigation links with Indonesian text */}
        <div className="mt-8 text-center space-y-2 font-body">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm hover:underline transition-colors duration-200"
                style={{ color: INDONESIAN_COLORS.primary.gold }}
              >
                Lupa password?
              </button>
              <div 
                className="text-sm"
                style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
              >
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium hover:underline transition-colors duration-200"
                  style={{ color: INDONESIAN_COLORS.primary.green }}
                >
                  Daftar sekarang
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div 
              className="text-sm"
              style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
            >
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium hover:underline transition-colors duration-200"
                style={{ color: INDONESIAN_COLORS.primary.green }}
              >
                Masuk
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div 
              className="text-sm"
              style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
            >
              Ingat password Anda?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium hover:underline transition-colors duration-200"
                style={{ color: INDONESIAN_COLORS.primary.green }}
              >
                Masuk
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add breathing animation CSS */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </MeditationModal>
  );
};