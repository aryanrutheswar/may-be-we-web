import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
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
  );
}
