import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface UserSubscription {
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for getting started with meditation',
      price: 0,
      currency: 'IDR',
      interval: 'month',
      features: [
        'Access to basic meditation sessions',
        'Daily reminders',
        'Progress tracking',
        'Basic breathing exercises'
      ]
    },
    {
      id: 'premium-monthly',
      name: 'Premium',
      description: 'Full access to all features and content',
      price: 49000,
      currency: 'IDR',
      interval: 'month',
      popular: true,
      features: [
        'All Basic features',
        'Full SIY course library',
        'Advanced meditation techniques',
        'Personalized learning paths',
        'Offline downloads',
        'Priority support',
        'Advanced analytics',
        'Custom meditation timers'
      ]
    },
    {
      id: 'premium-yearly',
      name: 'Premium Annual',
      description: 'Save 30% with annual billing',
      price: 399000,
      currency: 'IDR',
      interval: 'year',
      features: [
        'All Premium features',
        '30% savings vs monthly',
        'Annual progress reports',
        'Early access to new features'
      ]
    }
  ];

  const loadSubscription = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mock subscription data for demo
      // In a real app, this would fetch from your backend/Firestore
      const mockSubscription: UserSubscription = {
        planId: 'basic',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      };
      setSubscription(mockSubscription);
    } catch {
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock upgrade process
      // In a real app, this would integrate with payment processor
      console.log('Upgrading to plan:', planId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Subscription upgraded successfully! You now have access to all premium features.');
      setShowPlans(false);
      await loadSubscription();
    } catch {
      setError('Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock cancellation
      console.log('Canceling subscription');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true
      });
      
      setSuccess('Subscription canceled. You\'ll retain access until the end of your current billing period.');
    } catch {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Reactivating subscription');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false
      });
      
      setSuccess('Subscription reactivated successfully!');
    } catch {
      setError('Failed to reactivate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return plans[0]; // Default to basic
    return plans.find(plan => plan.id === subscription.planId) || plans[0];
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return 'Free';
    
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD',
      minimumFractionDigits: 0
    });
    
    return `${formatter.format(price)}/${interval === 'year' ? 'tahun' : 'bulan'}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'Canceling';
    
    switch (status) {
      case 'active':
        return 'Active';
      case 'canceled':
        return 'Canceled';
      case 'past_due':
        return 'Payment Due';
      case 'trialing':
        return 'Trial';
      default:
        return status;
    }
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h4>
        
        {subscription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">{currentPlan.name}</div>
                <div className="text-sm text-gray-600">{currentPlan.description}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status, subscription.cancelAtPeriodEnd)}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Price</div>
                <div className="text-sm text-gray-600">
                  {formatPrice(currentPlan.price, currentPlan.currency, currentPlan.interval)}
                </div>
              </div>
            </div>

            {subscription.status === 'active' && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">
                    {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(subscription.currentPeriodEnd)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900">Started</div>
                <div className="text-sm text-gray-600">
                  {formatDate(subscription.currentPeriodStart)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!subscription && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            <p className="text-gray-600">No active subscription</p>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Subscription Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h4>
        
        <div className="space-y-4">
          {currentPlan.id === 'basic' && (
            <Button
              onClick={() => setShowPlans(true)}
              disabled={loading}
              className="w-full"
            >
              Upgrade to Premium
            </Button>
          )}

          {currentPlan.id !== 'basic' && subscription && (
            <div className="space-y-3">
              {!subscription.cancelAtPeriodEnd ? (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  onClick={handleReactivateSubscription}
                  disabled={loading}
                  className="w-full"
                >
                  Reactivate Subscription
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowPlans(true)}
                disabled={loading}
                className="w-full"
              >
                Change Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h4>
        
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">No billing history available</p>
          <p className="text-sm text-gray-500">Your invoices and payment history will appear here</p>
        </div>
      </div>

      {/* Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Unlock your meditation potential with premium features</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 ${
                    plan.popular
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price, plan.currency, plan.interval)}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || plan.id === currentPlan.id}
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : plan.id === currentPlan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowPlans(false)}
                className="px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};