import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from './AuthModal'

// Mock useAuth hook
const mockUseAuth = {
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  continueAsGuest: vi.fn(),
}

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

describe('AuthModal', () => {
  const mockOnClose = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signin mode by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
  })

  it('switches to signup mode when signup button is clicked', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await userEvent.click(screen.getByText('Sign up'))
    
    expect(screen.getByText('Join Sembalun')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('validates password confirmation in signup mode', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} defaultMode="signup" />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
    
    expect(mockUseAuth.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('handles email signin successfully', async () => {

    mockUseAuth.signInWithEmail.mockResolvedValueOnce({})
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(mockUseAuth.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles Google signin', async () => {

    mockUseAuth.signInWithGoogle.mockResolvedValueOnce({})
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.click(screen.getByText('Continue with Google'))
    
    await waitFor(() => {
      expect(mockUseAuth.signInWithGoogle).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles authentication errors properly', async () => {
    const authError = new Error('auth/invalid-email')
    authError.name = 'AuthError'
    authError.code = 'auth/invalid-email'
    
    mockUseAuth.signInWithEmail.mockRejectedValueOnce(authError)
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('handles guest mode continuation', async () => {

    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.click(screen.getByText('Continue as Guest'))
    
    expect(mockUseAuth.continueAsGuest).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state during authentication', async () => {

    mockUseAuth.signInWithEmail.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  it('handles password reset flow', async () => {

    mockUseAuth.resetPassword.mockResolvedValueOnce({})
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.click(screen.getByText('Forgot your password?'))
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(mockUseAuth.resetPassword).toHaveBeenCalledWith('test@example.com')
      expect(screen.getByText('Password reset email sent! Check your inbox.')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {

    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    fireEvent.submit(screen.getByRole('form'))
    
    // HTML5 validation should prevent submission
    expect(mockUseAuth.signInWithEmail).not.toHaveBeenCalled()
  })

  it('closes modal when close button is clicked', async () => {

    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.click(screen.getByRole('button', { name: /close/i }))
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  // Security test cases
  it('sanitizes error messages to prevent XSS', async () => {

    const maliciousError = new Error('<script>alert("xss")</script>')
    
    mockUseAuth.signInWithEmail.mockRejectedValueOnce(maliciousError)
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      // Should not contain raw script tags
      expect(screen.queryByText(/<script>/)).not.toBeInTheDocument()
    })
  })

  // Accessibility tests
  it('has proper ARIA labels and roles', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('manages focus properly when opened', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    
    // First focusable element should be focused
    expect(screen.getByLabelText(/email/i)).toHaveFocus()
  })
})