import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { signIn, signUp, signInWithGoogle, signInWithApple, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  React.useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    if (errorParam === 'callback_failed') {
      setError('Gagal menyelesaikan proses masuk. Silakan coba lagi.')
    }
    
    if (messageParam === 'password_reset_success') {
      setMessage('Password berhasil diubah. Silakan masuk dengan password baru.')
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, { display_name: email.split('@')[0] })
        if (error) {
          setError(error.message)
        } else {
          setMessage('Akun berhasil dibuat! Periksa email Anda untuk verifikasi.')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
      // OAuth redirect will handle navigation
    } catch (error) {
      setError('Gagal masuk dengan Google')
    }
  }

  const handleAppleSignIn = async () => {
    setError('')
    try {
      const { error } = await signInWithApple()
      if (error) {
        setError(error.message)
      }
      // OAuth redirect will handle navigation
    } catch (error) {
      setError('Gagal masuk dengan Apple')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const { error } = await resetPassword(resetEmail)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Link reset password telah dikirim ke email Anda.')
        setShowReset(false)
        setResetEmail('')
      }
    } catch (error) {
      setError('Gagal mengirim email reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestMode = () => {
    // For now, redirect to the main app - guest mode will be handled by the auth context
    navigate('/')
  }

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">Masukkan email Anda untuk menerima link reset password</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="resetEmail"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan email Anda"
              />
            </div>

            <Button
              type="submit"
              variant="breathing"
              size="md"
              className="w-full"
              disabled={loading}
              isLoading={loading}
            >
              Kirim Link Reset
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setShowReset(false)}
              className="text-primary hover:underline text-sm"
            >
              Kembali ke halaman masuk
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {isSignUp ? 'Daftar Akun' : 'Masuk ke Sembalun'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'Buat akun baru untuk memulai perjalanan meditasi' : 'Lanjutkan perjalanan meditasi Anda'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignUp ? 'Daftar dengan Google' : 'Masuk dengan Google'}
          </button>

          <button
            onClick={handleAppleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            {isSignUp ? 'Daftar dengan Apple' : 'Masuk dengan Apple'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">atau</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (isSignUp ? 'Daftar' : 'Masuk')}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center">
              <button
                onClick={() => setShowReset(true)}
                className="text-primary hover:underline text-sm"
              >
                Lupa password?
              </button>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline text-sm"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">atau</span>
            </div>
          </div>

          <button
            onClick={handleGuestMode}
            className="w-full border border-primary text-primary py-2 px-4 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Lanjutkan sebagai Tamu
          </button>
        </div>
      </div>
    </div>
  )
}