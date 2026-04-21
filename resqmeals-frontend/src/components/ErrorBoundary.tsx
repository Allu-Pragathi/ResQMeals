
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Oops! Something went wrong</h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              The application encountered an unexpected error. Don't worry, your data is safe.
              {this.state.error?.message && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-400 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh Platform
            </button>
            <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
              ResQMeals Support Engineering
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
