import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo.componentStack);
    }
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF8] px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-3 max-w-md text-gray-500">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          {isDev && this.state.error && (
            <div className="mt-4 max-w-lg w-full rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm font-bold text-red-700 mb-1">
                {this.state.error.name}: {this.state.error.message}
              </p>
              {this.state.error.stack && (
                <pre className="mt-2 max-h-48 overflow-auto text-xs text-red-600 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 max-h-48 overflow-auto text-xs text-red-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="rounded-xl border-2 border-[#C9A227] px-6 py-3 text-sm font-semibold text-[#C9A227] transition-all hover:bg-[#C9A227] hover:text-white"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="rounded-xl bg-[#C9A227] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
