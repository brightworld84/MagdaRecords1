// src/components/ErrorBoundary.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>The app encountered an unexpected error.</Text>
          {this.state.error && (
            <Text style={styles.errorDetails}>{this.state.error.toString()}</Text>
          )}
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
    marginBottom: 10
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  errorDetails: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center'
  }
});

export default ErrorBoundary;