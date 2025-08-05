import React, { useState, useEffect, useCallback } from 'react';

export interface SIYAssessment {
  selfAwareness: {
    emotionalRecognition: number;
    bodyAwareness: number;
    triggerRecognition: number;
    valuesClarification: number;
  };
  selfRegulation: {
    emotionalControl: number;
    stressManagement: number;
    adaptability: number;
    impulseControl: number;
  };
  motivation: {
    intrinsicMotivation: number;
    resilience: number;
    optimism: number;
    goalOrientation: number;
  };
  empathy: {
    perspectiveTaking: number;
    compassion: number;
    serviceOrientation: number;
    socialAwareness: number;
  };
  socialSkills: {
    communication: number;
    conflictResolution: number;
    leadership: number;
    teamwork: number;
  };
  overallLevel: 'developing' | 'emerging' | 'proficient' | 'advanced';
  primaryFocusAreas: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
}

interface SIYAssessmentStepProps {
  initialData: Partial<SIYAssessment>;
  onUpdate: (data: Partial<SIYAssessment>) => void;
}

export const SIYAssessmentStep: React.FC<SIYAssessmentStepProps> = ({
  initialData,
  onUpdate
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Partial<SIYAssessment>>({
    selfAwareness: {
      emotionalRecognition: 3,
      bodyAwareness: 3,
      triggerRecognition: 3,
      valuesClarification: 3,
    },
    selfRegulation: {
      emotionalControl: 3,
      stressManagement: 3,
      adaptability: 3,
      impulseControl: 3,
    },
    motivation: {
      intrinsicMotivation: 3,
      resilience: 3,
      optimism: 3,
      goalOrientation: 3,
    },
    empathy: {
      perspectiveTaking: 3,
      compassion: 3,
      serviceOrientation: 3,
      socialAwareness: 3,
    },
    socialSkills: {
      communication: 3,
      conflictResolution: 3,
      leadership: 3,
      teamwork: 3,
    },
    overallLevel: 'emerging',
    primaryFocusAreas: [],
    learningStyle: 'mixed',
    ...initialData
  });

  const calculateAssessment = useCallback(() => {
    const allScores = [
      ...Object.values(formData.selfAwareness || {}),
      ...Object.values(formData.selfRegulation || {}),
      ...Object.values(formData.motivation || {}),
      ...Object.values(formData.empathy || {}),
      ...Object.values(formData.socialSkills || {})
    ];

    const average = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    
    let overallLevel: SIYAssessment['overallLevel'];
    if (average <= 2) overallLevel = 'developing';
    else if (average <= 3) overallLevel = 'emerging';
    else if (average <= 4) overallLevel = 'proficient';
    else overallLevel = 'advanced';

    const categoryAverages = [
      { name: 'Self-Awareness', avg: Object.values(formData.selfAwareness || {}).reduce((a, b) => a + b, 0) / 4 },
      { name: 'Self-Regulation', avg: Object.values(formData.selfRegulation || {}).reduce((a, b) => a + b, 0) / 4 },
      { name: 'Motivation', avg: Object.values(formData.motivation || {}).reduce((a, b) => a + b, 0) / 4 },
      { name: 'Empathy', avg: Object.values(formData.empathy || {}).reduce((a, b) => a + b, 0) / 4 },
      { name: 'Social Skills', avg: Object.values(formData.socialSkills || {}).reduce((a, b) => a + b, 0) / 4 }
    ];

    const primaryFocusAreas = categoryAverages
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .map(cat => cat.name);

    const updated = { ...formData, overallLevel, primaryFocusAreas };
    setFormData(updated);
    onUpdate(updated);
  }, [formData, onUpdate]);

  useEffect(() => {
    calculateAssessment();
  }, [calculateAssessment]);

  const sections = [
    {
      title: 'Self-Awareness',
      description: 'Understanding your emotions, strengths, and triggers',
      icon: '🧠',
      questions: [
        {
          key: 'emotionalRecognition',
          question: 'I can easily identify and name my emotions as they arise',
          category: 'selfAwareness'
        },
        {
          key: 'bodyAwareness',
          question: 'I notice physical sensations in my body when experiencing emotions',
          category: 'selfAwareness'
        },
        {
          key: 'triggerRecognition',
          question: 'I recognize what situations or people trigger strong emotional responses',
          category: 'selfAwareness'
        },
        {
          key: 'valuesClarification',
          question: 'I have a clear understanding of my core values and principles',
          category: 'selfAwareness'
        }
      ]
    },
    {
      title: 'Self-Regulation',
      description: 'Managing emotions and responses effectively',
      icon: '⚖️',
      questions: [
        {
          key: 'emotionalControl',
          question: 'I can stay calm and composed during challenging situations',
          category: 'selfRegulation'
        },
        {
          key: 'stressManagement',
          question: 'I have effective strategies for managing stress and pressure',
          category: 'selfRegulation'
        },
        {
          key: 'adaptability',
          question: 'I adapt well to change and unexpected situations',
          category: 'selfRegulation'
        },
        {
          key: 'impulseControl',
          question: 'I think before acting and rarely make impulsive decisions',
          category: 'selfRegulation'
        }
      ]
    },
    {
      title: 'Motivation',
      description: 'Internal drive and resilience',
      icon: '🎯',
      questions: [
        {
          key: 'intrinsicMotivation',
          question: 'I am motivated by personal growth and meaning rather than external rewards',
          category: 'motivation'
        },
        {
          key: 'resilience',
          question: 'I bounce back quickly from setbacks and failures',
          category: 'motivation'
        },
        {
          key: 'optimism',
          question: 'I maintain a positive outlook even in difficult circumstances',
          category: 'motivation'
        },
        {
          key: 'goalOrientation',
          question: 'I set clear goals and persist in achieving them',
          category: 'motivation'
        }
      ]
    },
    {
      title: 'Empathy',
      description: 'Understanding and connecting with others',
      icon: '💝',
      questions: [
        {
          key: 'perspectiveTaking',
          question: 'I can understand situations from other people\'s perspectives',
          category: 'empathy'
        },
        {
          key: 'compassion',
          question: 'I feel genuine care and concern for others\' wellbeing',
          category: 'empathy'
        },
        {
          key: 'serviceOrientation',
          question: 'I look for opportunities to help and support others',
          category: 'empathy'
        },
        {
          key: 'socialAwareness',
          question: 'I pick up on social cues and group dynamics easily',
          category: 'empathy'
        }
      ]
    },
    {
      title: 'Social Skills',
      description: 'Interacting effectively with others',
      icon: '🤝',
      questions: [
        {
          key: 'communication',
          question: 'I communicate clearly and listen actively to others',
          category: 'socialSkills'
        },
        {
          key: 'conflictResolution',
          question: 'I handle disagreements constructively and find win-win solutions',
          category: 'socialSkills'
        },
        {
          key: 'leadership',
          question: 'I can inspire and guide others towards common goals',
          category: 'socialSkills'
        },
        {
          key: 'teamwork',
          question: 'I work well with others and contribute to team success',
          category: 'socialSkills'
        }
      ]
    }
  ];

  const learningStyles = [
    {
      value: 'visual',
      title: 'Visual Learner',
      description: 'Learn through images, diagrams, and visual content',
      icon: '👁️'
    },
    {
      value: 'auditory',
      title: 'Auditory Learner',
      description: 'Learn through listening, discussion, and audio content',
      icon: '👂'
    },
    {
      value: 'kinesthetic',
      title: 'Kinesthetic Learner',
      description: 'Learn through movement, hands-on practice, and experience',
      icon: '🤲'
    },
    {
      value: 'mixed',
      title: 'Mixed Style',
      description: 'Benefit from a combination of learning approaches',
      icon: '🌈'
    }
  ];

  const scaleLabels = [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree'
  ];

  const handleScoreChange = (category: keyof SIYAssessment, key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, number> || {}),
        [key]: value
      }
    }));
  };

  const handleLearningStyleSelect = (style: SIYAssessment['learningStyle']) => {
    setFormData(prev => ({ ...prev, learningStyle: style }));
  };

  const renderSection = (section: typeof sections[0]) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">{section.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
        <p className="text-gray-600">{section.description}</p>
      </div>

      <div className="space-y-8">
        {section.questions.map((q, index) => (
          <div key={q.key} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-4">
              <p className="text-gray-900 font-medium mb-2">
                {index + 1}. {q.question}
              </p>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  Current: {scaleLabels[((formData[q.category as keyof SIYAssessment] as Record<string, number>)?.[q.key] || 3) - 1]}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="5"
                value={(formData[q.category as keyof SIYAssessment] as Record<string, number>)?.[q.key] || 3}
                onChange={(e) => handleScoreChange(
                  q.category as keyof SIYAssessment,
                  q.key,
                  parseInt(e.target.value)
                )}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                {scaleLabels.map((label, i) => (
                  <span key={i} className="text-center flex-1">{label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLearningStyle = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning Style</h3>
        <p className="text-gray-600">How do you prefer to learn and absorb new information?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningStyles.map((style) => (
          <button
            key={style.value}
            onClick={() => handleLearningStyleSelect(style.value as SIYAssessment['learningStyle'])}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
              formData.learningStyle === style.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-3">{style.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2">{style.title}</h4>
            <p className="text-sm text-gray-600">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    const levelDescriptions = {
      developing: {
        title: 'Developing',
        description: 'You\'re building foundational emotional intelligence skills',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200'
      },
      emerging: {
        title: 'Emerging',
        description: 'You have solid emotional intelligence with room to grow',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200'
      },
      proficient: {
        title: 'Proficient',
        description: 'You demonstrate strong emotional intelligence skills',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200'
      },
      advanced: {
        title: 'Advanced',
        description: 'You have highly developed emotional intelligence',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200'
      }
    };

    const currentLevel = levelDescriptions[formData.overallLevel || 'emerging'];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your SIY Assessment Results</h3>
          <p className="text-gray-600">Based on your responses, here\'s your emotional intelligence profile</p>
        </div>

        {/* Overall Level */}
        <div className={`rounded-2xl border p-6 ${currentLevel.bgColor}`}>
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className={`text-lg font-semibold mb-2 ${currentLevel.color}`}>
              {currentLevel.title} Level
            </h4>
            <p className="text-gray-700">{currentLevel.description}</p>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Recommended Focus Areas</h4>
          <div className="space-y-3">
            {formData.primaryFocusAreas?.map((area, index) => (
              <div key={area} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <span className="text-gray-700">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Style */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Your Learning Style</h4>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {learningStyles.find(s => s.value === formData.learningStyle)?.icon}
            </span>
            <div>
              <p className="font-medium text-gray-900">
                {learningStyles.find(s => s.value === formData.learningStyle)?.title}
              </p>
              <p className="text-sm text-gray-600">
                {learningStyles.find(s => s.value === formData.learningStyle)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Personalization Note */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-800">
              <p className="font-medium mb-2">Personalized Learning Path Ready! 🌟</p>
              <p>
                Based on your assessment, we\'ll create a customized SIY program focusing on your growth areas 
                and matching your learning style. This will help you develop emotional intelligence systematically 
                and effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
          <span className="text-sm text-gray-500">{currentSection + 1} of {sections.length + 2}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / (sections.length + 2)) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      {currentSection < sections.length ? (
        renderSection(sections[currentSection])
      ) : currentSection === sections.length ? (
        renderLearningStyle()
      ) : (
        renderResults()
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentSection < sections.length + 1 && (
          <button
            onClick={() => setCurrentSection(currentSection + 1)}
            className="px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90"
          >
            {currentSection === sections.length ? 'See Results' : 'Next Section'}
          </button>
        )}
      </div>
    </div>
  );
};