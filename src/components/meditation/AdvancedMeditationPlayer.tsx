import React, { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

// Advanced Meditation Player with multi-step guided sessions
// TODO: Implement real audio streaming, biometric integration, social features

interface MeditationStep {
  id: string
  title: string
  description: string
  duration: number // in seconds
  audioUrl?: string
  instructions: string[]
  visualCues?: {
    type: 'breathing' | 'body_scan' | 'visualization' | 'mantra'
    data: Record<string, unknown>
  }
  biometricTargets?: {
    heartRate?: { min: number; max: number }
    breathingRate?: { target: number }
    stressLevel?: { target: number }
  }
}

interface MeditationSession {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  totalDuration: number
  steps: MeditationStep[]
  prerequisites?: string[]
  benefits: string[]
  instructor: {
    id: string
    name: string
    avatarUrl?: string
    specialties: string[]
  }
}

interface BiometricData {
  heartRate?: number
  breathingRate?: number
  stressLevel?: number
  timestamp: Date
}

interface AdvancedMeditationPlayerProps {
  session: MeditationSession
  onComplete: () => void
  onProgress: (stepIndex: number, progress: number) => void
  enableBiometrics?: boolean
  enableSocial?: boolean
  className?: string
}

export const AdvancedMeditationPlayer: React.FC<AdvancedMeditationPlayerProps> = ({
  session,
  onComplete,
  onProgress,
  enableBiometrics = false,
  enableSocial = false,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepProgress, setStepProgress] = useState(0)
  const [biometricData, setBiometricData] = useState<BiometricData[]>([])
  const [socialParticipants, setSocialParticipants] = useState<string[]>([])
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const biometricInterval = useRef<NodeJS.Timeout | null>(null)
  
  const currentStep = session.steps[currentStepIndex]
  
  useEffect(() => {
    if (enableBiometrics) {
      initializeBiometricMonitoring()
    }
    if (enableSocial) {
      initializeSocialFeatures()
    }
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
      if (biometricInterval.current) clearInterval(biometricInterval.current)
      disconnectBiometrics()
      disconnectSocial()
    }
  }, [])
  
  const initializeBiometricMonitoring = async () => {
    // TODO: Implement biometric device connection
    // Support for heart rate monitors, breathing sensors, etc.
    console.log('Initializing biometric monitoring (placeholder)')
    
    // Simulate biometric data collection
    biometricInterval.current = setInterval(() => {
      const mockData: BiometricData = {
        heartRate: 65 + Math.random() * 20,
        breathingRate: 12 + Math.random() * 6,
        stressLevel: Math.random() * 100,
        timestamp: new Date()
      }
      setBiometricData(prev => [...prev.slice(-30), mockData]) // Keep last 30 readings
    }, 1000)
  }
  
  const initializeSocialFeatures = async () => {
    // TODO: Implement social meditation features
    // - Join meditation rooms
    // - Sync with other participants
    // - Share progress in real-time
    console.log('Initializing social features (placeholder)')
    setSocialParticipants(['user1', 'user2', 'user3']) // Mock participants
  }
  
  const disconnectBiometrics = () => {
    // TODO: Implement biometric device disconnection
    console.log('Disconnecting biometric devices (placeholder)')
  }
  
  const disconnectSocial = () => {
    // TODO: Implement social disconnection
    console.log('Disconnecting from social session (placeholder)')
  }
  
  const startStep = () => {
    setIsPlaying(true)
    setStepProgress(0)
    
    // Start audio if available
    if (currentStep.audioUrl && audioRef.current) {
      audioRef.current.src = currentStep.audioUrl
      audioRef.current.play()
    }
    
    // Start progress tracking
    progressInterval.current = setInterval(() => {
      setStepProgress(prev => {
        const newProgress = prev + (100 / currentStep.duration)
        onProgress(currentStepIndex, newProgress)
        
        if (newProgress >= 100) {
          completeCurrentStep()
          return 100
        }
        return newProgress
      })
    }, 1000)
  }
  
  const pauseStep = () => {
    setIsPlaying(false)
    if (progressInterval.current) clearInterval(progressInterval.current)
    if (audioRef.current) audioRef.current.pause()
  }
  
  const completeCurrentStep = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    
    if (currentStepIndex < session.steps.length - 1) {
      // Move to next step
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1)
        setStepProgress(0)
        setIsPlaying(false)
      }, 1000)
    } else {
      // Complete session
      onComplete()
    }
  }
  
  const renderBiometricFeedback = () => {
    if (!enableBiometrics || biometricData.length === 0) return null
    
    const latestData = biometricData[biometricData.length - 1]
    const targets = currentStep.biometricTargets
    
    return (
      <Card className="mb-4 bg-blue-50">
        <h4 className="font-heading text-sm text-blue-800 mb-3">Biometric Feedback</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-blue-700">
              {latestData.heartRate?.toFixed(0) || '--'}
            </div>
            <div className="text-xs text-blue-600">BPM</div>
            {targets?.heartRate && (
              <div className="text-xs text-gray-500">
                Target: {targets.heartRate.min}-{targets.heartRate.max}
              </div>
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-blue-700">
              {latestData.breathingRate?.toFixed(0) || '--'}
            </div>
            <div className="text-xs text-blue-600">Breaths/min</div>
            {targets?.breathingRate && (
              <div className="text-xs text-gray-500">
                Target: {targets.breathingRate.target}
              </div>
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-blue-700">
              {latestData.stressLevel?.toFixed(0) || '--'}%
            </div>
            <div className="text-xs text-blue-600">Stress</div>
            {targets?.stressLevel && (
              <div className="text-xs text-gray-500">
                Target: <{targets.stressLevel.target}%
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }
  
  const renderSocialParticipants = () => {
    if (!enableSocial || socialParticipants.length === 0) return null
    
    return (
      <Card className="mb-4 bg-green-50">
        <h4 className="font-heading text-sm text-green-800 mb-3">
          Meditating Together ({socialParticipants.length})
        </h4>
        <div className="flex -space-x-2">
          {socialParticipants.slice(0, 5).map((participant, index) => (
            <div
              key={participant}
              className="w-8 h-8 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs font-medium text-green-700"
            >
              {participant.charAt(0).toUpperCase()}
            </div>
          ))}
          {socialParticipants.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-green-300 border-2 border-white flex items-center justify-center text-xs font-medium text-green-700">
              +{socialParticipants.length - 5}
            </div>
          )}
        </div>
      </Card>
    )
  }
  
  const renderVisualCues = () => {
    if (!currentStep.visualCues) return null
    
    const { type } = currentStep.visualCues
    
    // TODO: Implement sophisticated visual cues for different meditation types
    const cueComponents = {
      breathing: (
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 animate-pulse"
            style={{ animationDuration: '4s' }}
          >
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🫁
            </div>
          </div>
        </div>
      ),
      body_scan: (
        <div className="flex items-center justify-center mb-6">
          <div className="text-6xl animate-bounce">
            🧘‍♀️
          </div>
        </div>
      ),
      visualization: (
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-200 to-blue-200 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🌸
            </div>
          </div>
        </div>
      ),
      mantra: (
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🕉️</div>
          <div className="text-lg font-medium text-gray-700 animate-pulse">
            Om Mani Padme Hum
          </div>
        </div>
      )
    }
    
    return cueComponents[type] || null
  }
  
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Session Header */}
      <Card className="mb-4">
        <div className="text-center mb-4">
          <h2 className="font-heading text-xl text-gray-800 mb-2">
            {session.title}
          </h2>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Step {currentStepIndex + 1} of {session.steps.length}</span>
            <span>•</span>
            <span>{currentStep.duration}s</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </Card>
      
      {/* Biometric Feedback */}
      {renderBiometricFeedback()}
      
      {/* Social Participants */}
      {renderSocialParticipants()}
      
      {/* Current Step Content */}
      <Card className="mb-6">
        <h3 className="font-heading text-lg text-gray-800 mb-3">
          {currentStep.title}
        </h3>
        
        {/* Visual Cues */}
        {renderVisualCues()}
        
        <p className="text-gray-600 font-body text-sm mb-4">
          {currentStep.description}
        </p>
        
        {/* Instructions */}
        {currentStep.instructions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-heading text-sm text-gray-700 mb-2">Instructions:</h4>
            <ul className="space-y-1">
              {currentStep.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      
      {/* Controls */}
      <div className="flex space-x-3">
        <Button
          onClick={isPlaying ? pauseStep : startStep}
          className="flex-1"
          size="large"
        >
          {isPlaying ? 'Pause' : 'Start'}
        </Button>
        
        <Button
          onClick={() => setCurrentStepIndex(prev => Math.min(prev + 1, session.steps.length - 1))}
          variant="outline"
          disabled={currentStepIndex >= session.steps.length - 1}
        >
          Skip
        </Button>
      </div>
      
      {/* Development Info */}
      {import.meta.env?.DEV && (
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <h4 className="text-sm font-bold text-yellow-800 mb-2">🚧 Development Placeholders</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Real audio streaming integration needed</li>
            <li>• Biometric device SDK integration required</li>
            <li>• Social features need WebRTC implementation</li>
            <li>• Visual cues need enhanced animations</li>
            <li>• Progress synchronization with backend</li>
          </ul>
        </Card>
      )}
    </div>
  )
}

export default AdvancedMeditationPlayer