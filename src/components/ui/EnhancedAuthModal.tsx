import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Heart, Sparkles } from 'lucide-react';
import { MeditationModal } from './IndonesianModal';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { useAuth } from '../../hooks/useAuth';
import { AuthError } from '../../utils/auth-error';

// Enhanced 2025 Authentication Modal Props
interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  darkMode?: boolean;
}

// 2025 Enhanced Authentication Modal with Glassmorphic Design
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, resetPassword, continueAsGuest } = useAuth();

  // Enhanced breathing animation for stress-free authentication
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    if (loading) {
      const breathingCycle = setInterval(() => {
        setBreathingPhase(current => {
          switch (current) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': return 'inhale';
            default: return 'inhale';
          }
        });
      }, 2000);
      return () => clearInterval(breathingCycle);
    }
  }, [loading]);

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
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(true);
    setLoadingState({ type: provider, action: 'signin' });
    
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
    }
  };

  const handleGuestContinue = async () => {
    setLoadingState({ type: 'guest', action: 'signin' });
    try {
      console.log('🔄 Enhanced auth modal - Guest continue clicked');
      await continueAsGuest();
      console.log('✅ Enhanced auth modal - Guest continue successful');
      onClose();
    } catch (error) {
      console.error('❌ Enhanced auth modal - Guest continue failed:', error);
      setError('Gagal melanjutkan sebagai tamu. Silakan coba lagi.');
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
      title=""
      size="medium"
      gestureEnabled={true}
      darkMode={darkMode}
      showHeader={false}
      className="overflow-hidden"
    >
      <div className="p-8">
        {/* Enhanced 2025 Header with Breathing Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6 relative">
            <motion.div 
              className="relative flex items-center justify-center"
              animate={loading ? {
                scale: breathingPhase === 'inhale' ? 1.1 : breathingPhase === 'hold' ? 1.05 : 1
              } : { scale: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              {/* Main Icon with Glassmorphic Design */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-meditation-zen-400/20 to-meditation-focus-400/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-meditation-zen-600" />
              </div>

              {/* Breathing Guide Rings */}
              {loading && (
                <>
                  <motion.div 
                    className="absolute inset-0 border-2 border-meditation-zen-400/40 rounded-3xl"
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'hold' ? 1.2 : 1.1,
                      opacity: breathingPhase === 'inhale' ? 0.8 : breathingPhase === 'hold' ? 0.6 : 0.4
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute inset-0 border border-meditation-focus-400/30 rounded-3xl"
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'hold' ? 1.4 : 1.2,
                      opacity: breathingPhase === 'inhale' ? 0.6 : breathingPhase === 'hold' ? 0.4 : 0.2
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </>
              )}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-fluid-2xl font-heading font-bold mb-3 text-gray-800">
              {getModeTitle()}
            </h2>
            <p className="text-meditation-zen-600 meditation-body">
              {getModeSubtitle()}
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="mb-6"
            >
              <Card variant="default" className="border-red-200/50 bg-red-50/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="mb-6"
            >
              <Card variant="default" className="border-green-200/50 bg-green-50/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Form with 2025 Design */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                variant="meditation"
                size="lg"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                startIcon={<User className="w-5 h-5" />}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mode === 'signup' ? 0.5 : 0.4 }}
          >
            <Input
              variant="meditation"
              size="lg"
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              startIcon={<Mail className="w-5 h-5" />}
            />
          </motion.div>

          {mode !== 'reset' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: mode === 'signup' ? 0.6 : 0.5 }}
            >
              <Input
                variant="meditation"
                size="lg"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                startIcon={<Lock className="w-5 h-5" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-meditation-zen-100 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </motion.div>
          )}

          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Input
                variant="meditation"
                size="lg"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                startIcon={<Lock className="w-5 h-5" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 hover:bg-meditation-zen-100 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              type="submit"
              variant="meditation"
              size="lg"
              className="w-full"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>
                    {mode === 'signin' ? 'Signing In...' :
                     mode === 'signup' ? 'Creating Account...' :
                     'Sending Reset...'}
                  </span>
                </div>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' :
                   mode === 'signup' ? 'Create Account' :
                   'Send Reset Email'}
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Enhanced Social Authentication */}
        {mode !== 'reset' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="ghost"
                size="lg"
                className="w-full border border-gray-200/50 hover:bg-white/50 backdrop-blur-sm"
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
              >
                {loadingState.type === 'google' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-gray-300/30 border-t-gray-600 rounded-full mr-3"
                  />
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                variant="calm"
                size="lg"
                className="w-full"
                onClick={handleGuestContinue}
                disabled={loading}
              >
                {loadingState.type === 'guest' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-meditation-calm-300/30 border-t-meditation-calm-600 rounded-full mr-3"
                  />
                ) : (
                  <User className="w-5 h-5 mr-3" />
                )}
                Continue as Guest
              </Button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Navigation Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center space-y-3"
        >
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="block w-full text-sm text-meditation-zen-600 hover:text-meditation-zen-700 transition-colors"
              >
                Forgot your password?
              </button>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-meditation-zen-600 hover:text-meditation-zen-700 transition-colors"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-meditation-zen-600 hover:text-meditation-zen-700 transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-meditation-zen-600 hover:text-meditation-zen-700 transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </MeditationModal>
  );
};