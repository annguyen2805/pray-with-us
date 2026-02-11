import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
          <div className="glass p-8 rounded-[2rem] border-white shadow-xl max-w-md">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-rose-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 font-serif-display">
              Đã xảy ra lỗi
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {this.state.error?.message || 'Có điều gì đó không ổn. Vui lòng thử lại sau.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="lumina-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
