import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Compass } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 bg-[#0F0F11] border border-amber-500/30 rounded-2xl max-w-2xl mx-auto my-8 shadow-lg space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Unable to display this view'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A data or rendering issue occurred while presenting this section. Your account data and progress are safe.
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = '#';
                window.location.reload();
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            >
              Refresh App
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
