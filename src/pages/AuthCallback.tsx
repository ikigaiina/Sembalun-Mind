import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth/signin?error=callback_failed')
          return
        }

        if (data.session) {
          console.log('✅ Auth callback successful')
          navigate('/')
        } else {
          console.warn('No session found in callback')
          navigate('/auth/signin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/signin?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Menyelesaikan masuk...</h2>
        <p className="text-gray-600">Tunggu sebentar saat kami menyelesaikan proses masuk Anda.</p>
      </div>
    </div>
  )
}