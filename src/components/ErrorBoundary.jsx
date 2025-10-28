import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F0F0F] to-[#1A1A1A] p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-[#121212] border border-red-800/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-lg font-bold text-red-400">Something went wrong</h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              An error occurred while loading this page. Please try refreshing or go back to the dashboard.
            </p>
            {this.state.error && (
              <details className="bg-[#2A2A2A] p-3 rounded text-xs text-gray-400 mb-4">
                <summary className="cursor-pointer text-red-400 font-semibold">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
