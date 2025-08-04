import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo, this.state.errorId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorDetails, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Error details copied to clipboard');
      });
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-heading text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 font-body text-sm">
                We encountered an unexpected error. Don't worry, your meditation journey continues.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <div className="flex space-x-2">
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload
                </Button>
              </div>
            </div>

            {this.props.showDetails && this.state.error && (
              <div className="border-t border-gray-200 pt-4">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 font-body mb-2">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Technical Details
                  </summary>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="max-h-32 overflow-y-auto">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={this.copyErrorDetails}
                    variant="outline"
                    size="small"
                    className="w-full mt-2"
                  >
                    Copy Error Details
                  </Button>
                </details>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-body">
                If this problem persists, please contact support with error ID: 
                <code className="bg-gray-100 px-1 rounded text-xs ml-1">
                  {this.state.errorId}
                </code>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;