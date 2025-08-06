import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AccountDeletionProps {
  onClose: () => void;
}

export const AccountDeletion: React.FC<AccountDeletionProps> = ({ onClose }) => {
  const { deleteAccount, exportUserData, reauthenticateUser } = useAuth();
  const [step, setStep] = useState<'confirm' | 'password' | 'final'>('confirm');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [exportData, setExportData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sembalun-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export data. Please try again.');
    }
  };

  const handlePasswordConfirmation = async () => {
    setError('');
    setLoading(true);

    try {
      await reauthenticateUser(password);
      setStep('final');
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalDeletion = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (exportData) {
        await handleExportData();
        // Wait a moment for download to initiate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await deleteAccount();
      // User will be signed out automatically and redirected
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete account. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete Your Account
        </h3>
        <p className="text-gray-600">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <h4 className="font-medium text-red-900 mb-2">What will be deleted:</h4>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Your profile and personal information</li>
          <li>• All meditation session history and progress</li>
          <li>• Your goals, preferences, and assessments</li>
          <li>• Any journal entries or notes</li>
          <li>• Your account will be permanently removed</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">Before you delete:</h4>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={exportData}
            onChange={(e) => setExportData(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-blue-900">
              Export my data before deletion
            </span>
            <p className="text-xs text-blue-700 mt-1">
              Download a copy of all your data as a JSON file. This includes your profile, progress, and settings.
            </p>
          </div>
        </label>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep('password')}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Confirm Your Identity
        </h3>
        <p className="text-gray-600">
          Please enter your password to verify your identity before deleting your account.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep('confirm')}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handlePasswordConfirmation}
          disabled={loading || !password}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {loading ? 'Verifying...' : 'Verify Password'}
        </Button>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Final Confirmation
        </h3>
        <p className="text-gray-600">
          This is your last chance. Once deleted, your account cannot be recovered.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type "DELETE" to confirm account deletion:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          placeholder="Type DELETE here"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Account deletion is immediate and irreversible
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              You will be signed out and redirected to the homepage after deletion.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep('password')}
          className="flex-1"
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleFinalDeletion}
          disabled={loading || confirmText !== 'DELETE'}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {loading ? 'Deleting Account...' : 'Delete My Account'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'confirm' && renderConfirmStep()}
        {step === 'password' && renderPasswordStep()}
        {step === 'final' && renderFinalStep()}
      </div>
    </div>
  );
};