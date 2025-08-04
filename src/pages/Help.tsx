import React, { useState } from 'react';
import { Search, Book, MessageCircle, Mail, Phone, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting_started' | 'meditation' | 'technical' | 'account' | 'billing';
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  articles: Array<{
    id: string;
    title: string;
    summary: string;
    readTime: number;
  }>;
}

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'guides' | 'contact'>('faq');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I start my first meditation session?',
      answer: 'To start your first meditation session, go to the Meditation page from the bottom navigation. Choose a beginner-friendly session like "Mindful Breathing" and follow the guided instructions. Start with shorter sessions (5-10 minutes) and gradually increase the duration as you become more comfortable.',
      category: 'getting_started'
    },
    {
      id: '2',
      question: 'Can I use the app offline?',
      answer: 'Yes! Many features work offline including downloaded meditation sessions, breathing exercises, and journal entries. Your data will sync automatically when you reconnect to the internet. Look for the download icon next to sessions to save them for offline use.',
      category: 'technical'
    },
    {
      id: '3',
      question: 'How do I track my meditation progress?',
      answer: 'Your progress is automatically tracked when you complete meditation sessions. Visit the Analytics page to see detailed insights including your streak, total minutes meditated, mood trends, and achievements. You can also view your history in the History tab.',
      category: 'meditation'
    },
    {
      id: '4',
      question: 'What is the difference between free and premium features?',
      answer: 'Free users have access to basic meditation sessions, breathing exercises, and journaling. Premium users get unlimited access to all content, advanced analytics, offline downloads, personalized recommendations, and priority support. Visit the Account page to upgrade.',
      category: 'billing'
    },
    {
      id: '5',
      question: 'How do I change my meditation reminders?',
      answer: 'Go to Settings > Notifications to customize your meditation reminders. You can set the time, frequency, and message style. You can also set different reminders for weekdays and weekends, or turn them off completely.',
      category: 'account'
    },
    {
      id: '6',
      question: 'Why can\'t I hear audio during meditation sessions?',
      answer: 'Check that your device volume is up and not muted. If using headphones, ensure they\'re properly connected. On mobile, check that the app has audio permissions in your device settings. If the issue persists, try restarting the app.',
      category: 'technical'
    }
  ];

  const guides: GuideSection[] = [
    {
      id: 'getting_started',
      title: 'Getting Started',
      description: 'Everything you need to know to begin your mindfulness journey',
      articles: [
        {
          id: 'first_steps',
          title: 'Your First Week of Meditation',
          summary: 'A step-by-step guide to establishing a daily practice',
          readTime: 5
        },
        {
          id: 'choosing_sessions',
          title: 'How to Choose the Right Session',
          summary: 'Find meditations that match your goals and experience level',
          readTime: 3
        },
        {
          id: 'creating_routine',
          title: 'Creating a Sustainable Routine',
          summary: 'Tips for building meditation into your daily life',
          readTime: 7
        }
      ]
    },
    {
      id: 'advanced_techniques',
      title: 'Advanced Techniques',
      description: 'Deepen your practice with advanced methods',
      articles: [
        {
          id: 'mindful_awareness',
          title: 'Developing Mindful Awareness',
          summary: 'Advanced techniques for present-moment awareness',
          readTime: 8
        },
        {
          id: 'loving_kindness',
          title: 'Loving-Kindness Meditation',
          summary: 'Cultivate compassion for yourself and others',
          readTime: 6
        },
        {
          id: 'body_awareness',
          title: 'Advanced Body Awareness',
          summary: 'Deep techniques for body-mind connection',
          readTime: 10
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and how to resolve them',
      articles: [
        {
          id: 'sync_issues',
          title: 'Data Sync Problems',
          summary: 'How to fix data synchronization issues',
          readTime: 4
        },
        {
          id: 'audio_problems',
          title: 'Audio Playback Issues',
          summary: 'Troubleshooting sound and playback problems',
          readTime: 3
        },
        {
          id: 'app_crashes',
          title: 'App Performance Issues',
          summary: 'Resolving crashes and performance problems',
          readTime: 5
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'getting_started', label: 'Getting Started' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'technical', label: 'Technical' },
    { id: 'account', label: 'Account' },
    { id: 'billing', label: 'Billing' }
  ];

  const filteredFAQs = selectedCategory === 'all'
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs.filter(faq => 
        faq.category === selectedCategory &&
        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: MessageCircle },
    { id: 'guides', label: 'Guides', icon: Book },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers to common questions and get support</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Section */}
        {activeTab === 'faq' && (
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-primary'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Guides Section */}
        {activeTab === 'guides' && (
          <div className="space-y-8">
            {guides.map(section => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 mb-4">{section.description}</p>
                
                <div className="space-y-3">
                  {section.articles.map(article => (
                    <a 
                      key={article.id} 
                      href={`https://example.com/guides/${article.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        <p className="text-sm text-gray-600">{article.summary}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{article.readTime} min read</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get detailed help via email. We typically respond within 24 hours.
                </p>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chat with our support team in real-time during business hours.
                </p>
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Speak directly with our support team for urgent issues.
                </p>
                <Button variant="outline" className="w-full">
                  Call Now
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Premium Support</h4>
              <p className="text-sm text-blue-700">
                Premium subscribers get priority support with faster response times and dedicated assistance.
                <a href="/account" className="text-blue-600 hover:underline ml-1">
                  Upgrade your account →
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/settings" className="flex items-center space-x-2 text-primary hover:underline">
              <span>Account Settings</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="/personalization" className="flex items-center space-x-2 text-primary hover:underline">
              <span>Personalization</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="/analytics" className="flex items-center space-x-2 text-primary hover:underline">
              <span>Progress Analytics</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="/community" className="flex items-center space-x-2 text-primary hover:underline">
              <span>Community Guidelines</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;