'use client';

import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
interface State {
  hasError: boolean;
}

/** Top-level safety net so one broken widget can't blank the whole dashboard. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('FinPilot UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-signal-rose/40 bg-signal-rose/5 p-6 text-sm text-signal-rose">
            Something went wrong rendering this section. Try refreshing the page.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
