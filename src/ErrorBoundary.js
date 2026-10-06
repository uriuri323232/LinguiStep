import React from 'react';
import { SafeAreaView, ScrollView, Text } from 'react-native';

// Shows the real error on screen (instead of a silent crash) if a screen fails to render.
export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    const e = this.state.error;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#b00020' }}>Something went wrong</Text>
          <Text selectable style={{ marginTop: 12, color: '#222' }}>{String((e && e.message) || e)}</Text>
          <Text selectable style={{ marginTop: 12, color: '#666', fontSize: 11 }}>{String((e && e.stack) || '')}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
