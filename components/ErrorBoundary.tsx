'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl text-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Something went wrong</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
