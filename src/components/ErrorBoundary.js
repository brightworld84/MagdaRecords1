// src/components/ErrorBoundary.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    error: null,
    errorInfo: null
  };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('🛑 ERROR BOUNDARY CAUGHT:', error);
    console.error('Error details:', errorInfo);
    
    this.setState({
      errorInfo: errorInfo
    });
    
    // Here you could also log to a remote error tracking service
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // If the fallbackComponent prop is provided, use that instead
    if (this.props.onReset && typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };
  
  render() {
    const { fallbackComponent } = this.props;
    
    if (this.state.hasError) {
      // If a custom fallback component is provided, use it
      if (fallbackComponent && typeof fallbackComponent === 'function') {
        return fallbackComponent(this.state.error, this.resetError);
      }
      
      // Default error UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          
          <ScrollView style={styles.errorContainer}>
            <Text style={styles.message}>
              The app encountered an unexpected error.
            </Text>
            
            {this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff3b30'
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  errorContainer: {
    maxHeight: 200,
    marginBottom: 20,
    width: '100%'
  },
  errorDetails: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default ErrorBoundary;