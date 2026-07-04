import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { crashReporting } from '@/services/crashReporting';
import { logger } from '@/services/logging';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    crashReporting.captureError(error, { componentStack: errorInfo.componentStack ?? '' });
    logger.error('general', 'ErrorBoundary caught error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#FFF' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{
              backgroundColor: '#6C5CE7',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
