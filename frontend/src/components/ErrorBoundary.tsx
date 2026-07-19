import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-6">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] max-w-lg w-full p-8 text-center flex flex-col items-center gap-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-800">Something went wrong</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              An unexpected error occurred while rendering this page. Please refresh or go back to the dashboard.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl text-left text-red-500 max-h-32 overflow-y-auto w-full font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-[4px_4px_8px_rgba(79,70,229,0.2)] hover:bg-primary/90 transition-all"
              >
                Refresh Page
              </button>
              <button
                onClick={() => { window.location.href = '/dashboard'; }}
                className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
