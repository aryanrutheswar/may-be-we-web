import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * PageTransition (Centralized Compatibility Wrapper)
 * The complete page transition system is orchestrated centrally by TransitionManager in _layout.jsx.
 * This wrapper passes through styles and children without duplicating transition code.
 */
export default function PageTransition({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
