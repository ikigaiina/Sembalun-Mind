import React from 'react'
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const SupabaseProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useSupabaseAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat...</h2>
          <p className="text-gray-600">Memeriksa status autentikasi</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not logged in, show sign in page
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }

  // If user is authenticated or authentication is not required, render children
  return <>{children}</>
}