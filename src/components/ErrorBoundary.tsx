'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-300 mb-6">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-white text-black font-black py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-800 text-white font-black py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-gray-400 cursor-pointer text-sm">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 bg-black/50 p-3 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You can add error reporting service here
  };
};