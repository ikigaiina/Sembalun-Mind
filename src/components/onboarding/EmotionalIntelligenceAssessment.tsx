import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import type { UserAssessments } from '../../types/auth';

interface EmotionalIntelligenceAssessmentProps {
  onComplete: () => void;
}

const ASSESSMENT_QUESTIONS = [
  {
    id: 'self-awareness-1',
    category: 'selfAwareness',
    question: 'I am usually aware of my emotions as they occur',
    reverse: false,
  },
  {
    id: 'self-awareness-2',
    category: 'selfAwareness',
    question: 'I understand what triggers my emotional responses',
    reverse: false,
  },
  {
    id: 'self-awareness-3',
    category: 'selfAwareness',
    question: 'I often find myself reacting emotionally without understanding why',
    reverse: true,
  },
  {
    id: 'self-regulation-1',
    category: 'selfRegulation',
    question: 'I can manage my emotions effectively in stressful situations',
    reverse: false,
  },
  {
    id: 'self-regulation-2',
    category: 'selfRegulation',
    question: 'I have trouble controlling my anger when frustrated',
    reverse: true,
  },
  {
    id: 'self-regulation-3',
    category: 'selfRegulation',
    question: 'I can calm myself down when I\'m upset',
    reverse: false,
  },
  {
    id: 'motivation-1',
    category: 'motivation',
    question: 'I stay motivated even when facing setbacks',
    reverse: false,
  },
  {
    id: 'motivation-2',
    category: 'motivation',
    question: 'I have clear goals that drive my behavior',
    reverse: false,
  },
  {
    id: 'motivation-3',
    category: 'motivation',
    question: 'I often feel unmotivated and lack direction',
    reverse: true,
  },
  {
    id: 'empathy-1',
    category: 'empathy',
    question: 'I can easily understand how others are feeling',
    reverse: false,
  },
  {
    id: 'empathy-2',
    category: 'empathy',
    question: 'I find it difficult to put myself in others\' shoes',
    reverse: true,
  },
  {
    id: 'empathy-3',
    category: 'empathy',
    question: 'I notice when someone\'s mood changes',
    reverse: false,
  },
  {
    id: 'social-skills-1',
    category: 'socialSkills',
    question: 'I communicate effectively with others',
    reverse: false,
  },
  {
    id: 'social-skills-2',
    category: 'socialSkills',
    question: 'I handle conflicts well in relationships',
    reverse: false,
  },
  {
    id: 'social-skills-3',
    category: 'socialSkills',
    question: 'I often have misunderstandings in my relationships',
    reverse: true,
  },
];

const SCALE_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Slightly Disagree',
  'Neutral',
  'Slightly Agree',
  'Agree',
  'Strongly Agree'
];

export const EmotionalIntelligenceAssessment: React.FC<EmotionalIntelligenceAssessmentProps> = ({ onComplete }) => {
  const { updateUserProfile } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (isLastQuestion) {
      handleComplete(value);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleComplete = async (lastAnswer: number) => {
    setLoading(true);
    
    const allAnswers = {
      ...answers,
      [currentQuestion.id]: lastAnswer
    };

    // Calculate scores for each category
    const categoryScores = {
      selfAwareness: 0,
      selfRegulation: 0,
      motivation: 0,
      empathy: 0,
      socialSkills: 0,
    };

    const categoryCounts = {
      selfAwareness: 0,
      selfRegulation: 0,
      motivation: 0,
      empathy: 0,
      socialSkills: 0,
    };

    ASSESSMENT_QUESTIONS.forEach(question => {
      const answer = allAnswers[question.id];
      if (answer !== undefined) {
        // Reverse score if needed (1 becomes 7, 2 becomes 6, etc.)
        const processedScore = question.reverse ? 8 - answer : answer;
        categoryScores[question.category as keyof typeof categoryScores] += processedScore;
        categoryCounts[question.category as keyof typeof categoryCounts] += 1;
      }
    });

    // Calculate average scores (convert to 0-100 scale)
    const normalizedScores = {
      selfAwareness: Math.round((categoryScores.selfAwareness / categoryCounts.selfAwareness / 7) * 100),
      selfRegulation: Math.round((categoryScores.selfRegulation / categoryCounts.selfRegulation / 7) * 100),
      motivation: Math.round((categoryScores.motivation / categoryCounts.motivation / 7) * 100),
      empathy: Math.round((categoryScores.empathy / categoryCounts.empathy / 7) * 100),
      socialSkills: Math.round((categoryScores.socialSkills / categoryCounts.socialSkills / 7) * 100),
    };

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(normalizedScores).reduce((sum, score) => sum + score, 0) / 5
    );

    const assessmentResults: UserAssessments = {
      emotionalIntelligence: {
        score: overallScore,
        completedAt: new Date(),
        areas: normalizedScores,
      }
    };

    try {
      await updateUserProfile({ assessments: assessmentResults });
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 1000);
    } catch (error) {
      console.error('Failed to save assessment results:', error);
      setLoading(false);
      onComplete();
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
            Analyzing Your Results
          </h2>
          <p className="text-gray-600">
            We're calculating your emotional intelligence profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 font-heading">
            Emotional Intelligence Assessment
          </h2>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
          </span>
        </div>
        
        <p className="text-gray-600 mb-6">
          This brief assessment will help us understand your current emotional intelligence level and provide personalized recommendations.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {SCALE_LABELS.map((label, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index + 1)}
              className="w-full flex items-center p-4 text-left border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-primary flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-gray-700 group-hover:text-gray-900">{label}</span>
              </div>
              <div className="ml-auto text-sm text-gray-400 group-hover:text-primary">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="text-sm text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your responses are confidential
        </div>
      </div>
    </div>
  );
};