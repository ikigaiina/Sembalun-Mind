import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

// Advanced User Analytics Dashboard for Admin
// TODO: Implement real-time data fetching, advanced filtering, export functionality

interface UserMetrics {
  totalUsers: number
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  newSignups: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  retention: {
    day1: number
    day7: number
    day30: number
  }
  engagement: {
    averageSessionsPerUser: number
    averageSessionDuration: number
    meditationCompletionRate: number
  }
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[]
    locations: { country: string; count: number; percentage: number }[]
    devices: { type: string; count: number; percentage: number }[]
  }
  premiumMetrics: {
    conversionRate: number
    churnRate: number
    averageRevenuePerUser: number
    lifetimeValue: number
  }
}

interface UserSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria
  userCount: number
  growthRate: number
}

interface SegmentCriteria {
  sessionCount?: { min?: number; max?: number }
  totalTime?: { min?: number; max?: number }
  lastActiveWithin?: number // days
  isPremium?: boolean
  location?: string[]
  ageRange?: { min: number; max: number }
  meditationTypes?: string[]
}

interface AnalyticsFilter {
  dateRange: {
    start: Date
    end: Date
  }
  userSegments: string[]
  meditationTypes: string[]
  locations: string[]
  deviceTypes: string[]
}

interface UserAnalyticsDashboardProps {
  className?: string
}

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [segments, setSegments] = useState<UserSegment[]>([])
  const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    userSegments: [],
    meditationTypes: [],
    locations: [],
    deviceTypes: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'overview' | 'segments' | 'behavior' | 'revenue'>('overview')
  
  useEffect(() => {
    loadAnalyticsData()
  }, [selectedFilter])
  
  const loadAnalyticsData = async () => {
    setLoading(true)
    
    try {
      // TODO: Implement real analytics data fetching
      // This should connect to your analytics service (Google Analytics, Mixpanel, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Mock data for demonstration
      const mockMetrics: UserMetrics = {
        totalUsers: 15420,
        activeUsers: {
          daily: 1250,
          weekly: 5680,
          monthly: 12300
        },
        newSignups: {
          today: 45,
          thisWeek: 287,
          thisMonth: 1156
        },
        retention: {
          day1: 85.3,
          day7: 62.7,
          day30: 34.2
        },
        engagement: {
          averageSessionsPerUser: 3.8,
          averageSessionDuration: 12.5,
          meditationCompletionRate: 78.9
        },
        demographics: {
          ageGroups: [
            { range: '18-24', count: 2450, percentage: 15.9 },
            { range: '25-34', count: 5680, percentage: 36.8 },
            { range: '35-44', count: 4230, percentage: 27.4 },
            { range: '45-54', count: 2340, percentage: 15.2 },
            { range: '55+', count: 720, percentage: 4.7 }
          ],
          locations: [
            { country: 'Indonesia', count: 8900, percentage: 57.7 },
            { country: 'Malaysia', count: 2100, percentage: 13.6 },
            { country: 'Singapore', count: 1800, percentage: 11.7 },
            { country: 'Thailand', count: 1520, percentage: 9.9 },
            { country: 'Others', count: 1100, percentage: 7.1 }
          ],
          devices: [
            { type: 'Mobile', count: 11800, percentage: 76.5 },
            { type: 'Desktop', count: 2890, percentage: 18.7 },
            { type: 'Tablet', count: 730, percentage: 4.8 }
          ]
        },
        premiumMetrics: {
          conversionRate: 12.8,
          churnRate: 5.2,
          averageRevenuePerUser: 45.50,
          lifetimeValue: 189.20
        }
      }
      
      const mockSegments: UserSegment[] = [
        {
          id: 'power-users',
          name: 'Power Users',
          description: 'Users with 20+ sessions in the last month',
          criteria: { sessionCount: { min: 20 } },
          userCount: 1250,
          growthRate: 15.3
        },
        {
          id: 'beginners',
          name: 'Beginners',
          description: 'Users with less than 5 sessions total',
          criteria: { sessionCount: { max: 5 } },
          userCount: 4800,
          growthRate: 8.7
        },
        {
          id: 'premium-candidates',
          name: 'Premium Candidates',
          description: 'Active free users likely to convert',
          criteria: { sessionCount: { min: 10 }, isPremium: false },
          userCount: 2100,
          growthRate: 22.1
        }
      ]
      
      setMetrics(mockMetrics)
      setSegments(mockSegments)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    // TODO: Implement data export functionality
    console.log(`Exporting data in ${format} format (placeholder)`)
    
    // Simulate export process
    const exportData = {
      metrics,
      segments,
      filter: selectedFilter,
      exportedAt: new Date().toISOString()
    }
    
    // In a real implementation, this would generate and download the file
    console.log('Export data:', exportData)
  }
  
  const createCustomSegment = () => {
    // TODO: Implement custom segment creation UI
    console.log('Opening custom segment creator (placeholder)')
  }
  
  const renderOverviewTab = () => {
    if (!metrics) return null
    
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.activeUsers.daily.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Daily Active</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.newSignups.thisMonth.toLocaleString()}</div>
            <div className="text-sm text-gray-600">New This Month</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.retention.day30}%</div>
            <div className="text-sm text-gray-600">30-Day Retention</div>
          </Card>
        </div>
        
        {/* Engagement Metrics */}
        <Card>
          <h3 className="font-heading text-lg text-gray-800 mb-4">Engagement Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{metrics.engagement.averageSessionsPerUser}</div>
              <div className="text-sm text-gray-600">Avg Sessions/User</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{metrics.engagement.averageSessionDuration}m</div>
              <div className="text-sm text-gray-600">Avg Session Duration</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{metrics.engagement.meditationCompletionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </Card>
        
        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-heading text-lg text-gray-800 mb-4">Age Groups</h3>
            <div className="space-y-3">
              {metrics.demographics.ageGroups.map((group, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{group.range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-800 w-12">{group.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <h3 className="font-heading text-lg text-gray-800 mb-4">Top Locations</h3>
            <div className="space-y-3">
              {metrics.demographics.locations.map((location, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{location.country}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-800 w-12">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  const renderSegmentsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg text-gray-800">User Segments</h3>
          <Button onClick={createCustomSegment} size="small">
            Create Segment
          </Button>
        </div>
        
        <div className="grid gap-4">
          {segments.map((segment) => (
            <Card key={segment.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-heading text-base text-gray-800">{segment.name}</h4>
                  <p className="text-sm text-gray-600">{segment.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-700">{segment.userCount.toLocaleString()}</div>
                  <div className="text-xs text-green-600">+{segment.growthRate}% growth</div>
                </div>
              </div>
              
              {/* Segment criteria visualization */}
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">Criteria:</div>
                <div className="text-sm text-gray-700">
                  {segment.criteria.sessionCount && (
                    <span className="mr-3">
                      Sessions: {segment.criteria.sessionCount.min ? `${segment.criteria.sessionCount.min}+` : `≤${segment.criteria.sessionCount.max}`}
                    </span>
                  )}
                  {segment.criteria.isPremium !== undefined && (
                    <span className="mr-3">
                      Premium: {segment.criteria.isPremium ? 'Yes' : 'No'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-xl text-gray-800">User Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <Button onClick={() => exportData('csv')} variant="outline" size="small">
            Export CSV
          </Button>
          <Button onClick={() => exportData('pdf')} variant="outline" size="small">
            Export PDF
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'segments', label: 'Segments' },
            { key: 'behavior', label: 'Behavior' },
            { key: 'revenue', label: 'Revenue' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      {selectedView === 'overview' && renderOverviewTab()}
      {selectedView === 'segments' && renderSegmentsTab()}
      {selectedView === 'behavior' && (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Behavior Analytics</h3>
            <p className="text-gray-600">Coming soon - User behavior patterns and flow analysis</p>
          </div>
        </Card>
      )}
      {selectedView === 'revenue' && (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Analytics</h3>
            <p className="text-gray-600">Coming soon - Revenue metrics and financial insights</p>
          </div>
        </Card>
      )}
      
      {/* Development Info */}
      {import.meta.env?.DEV && (
        <Card className="bg-yellow-50 border-yellow-200">
          <h4 className="text-sm font-bold text-yellow-800 mb-2">🚧 Analytics Placeholders</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Real-time data connection needed (Google Analytics, Mixpanel)</li>
            <li>• Advanced filtering and segmentation logic</li>
            <li>• Data export functionality (CSV, PDF, JSON)</li>
            <li>• Custom segment builder with drag-and-drop criteria</li>
            <li>• Real-time dashboard updates with WebSocket</li>
            <li>• A/B testing integration and results visualization</li>
          </ul>
        </Card>
      )}
    </div>
  )
}

export default UserAnalyticsDashboard