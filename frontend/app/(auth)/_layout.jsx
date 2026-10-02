import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import CinematicBackground from '../../components/CinematicBackground';

export default function AuthLayout() {
  return (
    <View style={styles.root}>
      {/* Universal Cinematic Sunset Cloudscape Background */}
      <CinematicBackground />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="reset-password" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="guidelines" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="verification" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1115',
    position: 'relative',
  },
});
