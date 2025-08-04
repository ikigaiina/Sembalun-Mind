import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { BreathingSession } from './BreathingSession'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock scrollToTop
vi.mock('../hooks/useScrollToTop', () => ({
  scrollToTop: vi.fn(),
}))

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('BreathingSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders setup screen by default', () => {
    renderWithRouter(<BreathingSession />)
    
    expect(screen.getByText('Latihan Pernapasan')).toBeInTheDocument()
    expect(screen.getByText('Pilih Teknik Pernapasan')).toBeInTheDocument()
    expect(screen.getByText('Durasi Sesi')).toBeInTheDocument()
    expect(screen.getByText('Mulai Bernapas')).toBeInTheDocument()
  })

  it('allows pattern selection', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Should have box breathing selected by default
    expect(screen.getByText('Kotak (Box Breathing)')).toBeInTheDocument()
    
    // Select a different pattern
    await user.click(screen.getByText('4-7-8 Breathing'))
    
    // Verify selection
    const selectedPattern = screen.getByText('4-7-8 Breathing').closest('button')
    expect(selectedPattern).toHaveClass('border-2')
  })

  it('allows duration selection', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Default should be 5 minutes
    expect(screen.getByText('5 menit')).toBeInTheDocument()
    
    // Select different duration
    await user.click(screen.getByText('10 menit'))
    
    // Verify selection
    const selectedDuration = screen.getByText('10 menit').closest('button')
    expect(selectedDuration).toHaveClass('border-2')
  })

  it('starts breathing session correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Should show active session
    expect(screen.getByText('Waktu Berlalu')).toBeInTheDocument()
    expect(screen.getByText('Sisa Waktu')).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByText('Jeda')).toBeInTheDocument()
  })

  it('handles timer progression correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Start with 2-minute session
    await user.click(screen.getByText('2 menit'))
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Advance timer by 30 seconds
    vi.advanceTimersByTime(30000)
    
    await waitFor(() => {
      expect(screen.getByText('00:30')).toBeInTheDocument()
      expect(screen.getByText('01:30')).toBeInTheDocument() // Remaining time
    })
  })

  it('pauses and resumes session correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Pause session
    await user.click(screen.getByText('Jeda'))
    
    expect(screen.getByText('Sesi Dijeda')).toBeInTheDocument()
    expect(screen.getByText('Lanjut')).toBeInTheDocument()
    expect(screen.getByText('Berhenti')).toBeInTheDocument()
    
    // Resume session
    await user.click(screen.getByText('Lanjut'))
    
    expect(screen.getByText('Jeda')).toBeInTheDocument()
  })

  it('completes session automatically when timer reaches zero', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Start with 2-minute session
    await user.click(screen.getByText('2 menit'))
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Advance timer to completion
    vi.advanceTimersByTime(120000) // 2 minutes
    
    await waitFor(() => {
      expect(screen.getByText('Sesi Selesai')).toBeInTheDocument()
      expect(screen.getByText('Napas Teratur! 🌟')).toBeInTheDocument()
    })
  })

  it('shows completion screen with correct stats', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Start and complete a 2-minute session
    await user.click(screen.getByText('2 menit'))
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Manually complete session
    await user.click(screen.getByText('Selesai'))
    
    await waitFor(() => {
      expect(screen.getByText('Sesi Selesai')).toBeInTheDocument()
      expect(screen.getByText('Menit bernapas')).toBeInTheDocument()
      expect(screen.getByText('Siklus selesai')).toBeInTheDocument()
    })
  })

  it('handles continuous mode correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Select continuous mode
    await user.click(screen.getByText('Terus menerus'))
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Should not show remaining time
    expect(screen.queryByText('Sisa Waktu')).not.toBeInTheDocument()
    expect(screen.getByText('Terus menerus')).toBeInTheDocument()
    
    // Should not show finish button
    expect(screen.queryByText('Selesai')).not.toBeInTheDocument()
  })

  it('stops session correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    await user.click(screen.getByText('Mulai Bernapas'))
    await user.click(screen.getByText('Jeda'))
    await user.click(screen.getByText('Berhenti'))
    
    // Should return to setup screen
    expect(screen.getByText('Pilih Teknik Pernapasan')).toBeInTheDocument()
    expect(screen.getByText('Durasi Sesi')).toBeInTheDocument()
    expect(screen.getByText('Mulai Bernapas')).toBeInTheDocument()
  })

  it('starts new session from completion screen', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Complete a session
    await user.click(screen.getByText('Mulai Bernapas'))
    await user.click(screen.getByText('Selesai'))
    
    await waitFor(() => {
      expect(screen.getByText('Sesi Selesai')).toBeInTheDocument()
    })
    
    // Start new session
    await user.click(screen.getByText('Sesi Baru'))
    
    expect(screen.getByText('Pilih Teknik Pernapasan')).toBeInTheDocument()
  })

  it('navigates back correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // From setup screen
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
    
    // From completion screen
    await user.click(screen.getByText('Mulai Bernapas'))
    await user.click(screen.getByText('Selesai'))
    
    await waitFor(() => {
      expect(screen.getByText('Kembali ke Dashboard')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Kembali ke Dashboard'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  // Edge cases and error handling
  it('handles rapid session state changes correctly', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Rapid pause/resume
    await user.click(screen.getByText('Jeda'))
    await user.click(screen.getByText('Lanjut'))
    await user.click(screen.getByText('Jeda'))
    await user.click(screen.getByText('Lanjut'))
    
    // Should still be in active state
    expect(screen.getByText('Jeda')).toBeInTheDocument()
  })

  it('maintains timer accuracy across pauses', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    await user.click(screen.getByText('Mulai Bernapas'))
    
    // Run for 30 seconds
    vi.advanceTimersByTime(30000)
    
    // Pause
    await user.click(screen.getByText('Jeda'))
    
    // Wait 10 seconds while paused
    vi.advanceTimersByTime(10000)
    
    // Resume
    await user.click(screen.getByText('Lanjut'))
    
    // Should still show 30 seconds elapsed
    await waitFor(() => {
      expect(screen.getByText('00:30')).toBeInTheDocument()
    })
  })

  // Accessibility tests
  it('has proper ARIA attributes', () => {
    renderWithRouter(<BreathingSession />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mulai bernapas/i })).toBeInTheDocument()
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithRouter(<BreathingSession />)
    
    // Tab through breathing pattern options
    await user.tab()
    expect(document.activeElement).toHaveTextContent('Kotak (Box Breathing)')
    
    // Enter should select pattern
    await user.keyboard('{Enter}')
    
    // Continue tabbing to start button
    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()
    expect(document.activeElement).toHaveTextContent('Mulai Bernapas')
  })

  // Performance tests
  it('cleans up timers on unmount', () => {
    const { unmount } = renderWithRouter(<BreathingSession />)
    
    // Start a session
    fireEvent.click(screen.getByText('Mulai Bernapas'))
    
    // Unmount component
    unmount()
    
    // Advance timers - should not cause errors
    vi.advanceTimersByTime(60000)
    
    // No errors should be thrown
    expect(vi.getTimerCount()).toBe(0)
  })
})