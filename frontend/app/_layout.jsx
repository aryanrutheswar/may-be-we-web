import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AuthProvider, useAuth } from '../lib/authContext';
import { ThemeProvider, useTheme } from '../lib/themeContext';
import { COLORS, FONTS } from '../lib/theme';
import TestNavigatorModal from '../components/TestNavigatorModal';

function AuthRouteGuard({ children }) {
  const { session, user, profile, isLoading, isPasswordRecovery } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const searchParams = useGlobalSearchParams();

  useEffect(() => {
    if (isLoading) return;

    // Allow QA showcase tester or explicit preview mode from Test Navigator
    const isPreviewMode = searchParams?.preview === 'true';
    const firstSegment = segments[0] || '';
    const inAuthGroup = firstSegment === '(auth)';
    const inShowcase = firstSegment === 'showcase';

    if (inShowcase || isPreviewMode) return;

    const currentSubRoute = segments[1] || '';

    // CRITICAL: When on reset-password or in password recovery mode, do NOT redirect to verification, tabs, or login!
    if (currentSubRoute === 'reset-password' || isPasswordRecovery) {
      if (currentSubRoute !== 'reset-password') {
        router.replace('/(auth)/reset-password');
      }
      return;
    }

    const isVerified = profile?.verification_status === 'verified';
    const isAuthenticated = Boolean(user || session?.user || profile?.id);

    console.log('[AuthGuard] route:', segments.join('/'), 'isAuthenticated:', isAuthenticated, 'isVerified:', isVerified);

    if (isAuthenticated) {
      // User is logged in
      if (!isVerified) {
        // Unverified user MUST complete selfie verification before entering any authenticated area (except welcome which plays the intro video first)
        if (!inAuthGroup || (currentSubRoute !== 'verification' && currentSubRoute !== 'guidelines' && currentSubRoute !== 'welcome')) {
          router.replace('/(auth)/verification');
        }
      } else {
        // Verified user: redirect directly from auth screens or theme-selection to tabs (except welcome which plays the intro video first)
        if (inAuthGroup && (currentSubRoute === 'login' || currentSubRoute === 'signup' || currentSubRoute === 'forgot-password' || currentSubRoute === 'theme-selection')) {
          router.replace('/(tabs)');
        }
      }
    } else {
      // User is not logged in: only public auth screens are allowed
      const isPublicAuthScreen =
        currentSubRoute === 'welcome' ||
        currentSubRoute === 'login' ||
        currentSubRoute === 'signup' ||
        currentSubRoute === 'forgot-password' ||
        currentSubRoute === 'reset-password';

      if (!inAuthGroup || !isPublicAuthScreen) {
        console.log('[AuthGuard] Unauthenticated access to', segments.join('/'), '-> Redirecting to /(auth)/welcome');
        router.replace('/(auth)/welcome');
      }
    }
  }, [session, user, profile, isLoading, isPasswordRecovery, segments, searchParams]);

  return children;
}

function ThemedAppContainer({ children }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'MaybeWe — Solo Travel Matching';

      const linkId = 'expo-google-font-manrope';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);
      }

      const styleId = 'solo-traveler-global-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            background-color: #F7F5F0 !important;
            -webkit-font-smoothing: antialiased;
          }
          html[data-theme="light"], body[data-theme="light"] {
            background-color: #F7F5F0 !important;
          }
          * {
            box-sizing: border-box;
          }

          /* Remove browser default blue outline / focus ring on inputs, textareas, and buttons */
          input, textarea, select {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          input:focus, textarea:focus, select:focus, button:focus {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none !important;
          }
          *:focus {
            outline: none !important;
          }

          /* Force all React Native Web background images and image wrappers to cover 100% width and height */
          [style*="background-image"] {
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            width: 100% !important;
            height: 100% !important;
          }
          div[style*="position: absolute"] > div[style*="background-image"],
          div[style*="position: absolute"] > img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          /* LAPTOP & DESKTOP RESPONSIVE CONTAINER (Screen width > 768px) */
          @media (min-width: 769px) {
            body {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              justify-content: flex-start !important;
              background-color: #F7F5F0 !important;
              min-height: 100vh !important;
              overflow-x: hidden !important;
              overflow-y: auto !important;
            }
            #root {
              width: 100% !important;
              max-width: 100% !important;
              min-height: 100vh !important;
              margin: 0 !important;
              position: relative !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow-x: hidden !important;
              background-color: #F7F5F0 !important;
            }
            html[data-theme="light"] #root,
            body[data-theme="light"] #root {
              background-color: #F7F5F0 !important;
              box-shadow: none !important;
            }
          }

          /* MOBILE VIEW (Screen width <= 768px): Edge-to-edge native appearance */
          @media (max-width: 768px) {
            #root {
              width: 100% !important;
              max-width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
          /* ============================================================ */
          /* LUXURY PAGE TRANSITION PRESETS (Cubic-Bezier Springs)         */
          /* ============================================================ */
          @keyframes pageLoginEntrance {
            0% {
              opacity: 0;
              transform: translateY(38px) scale(0.965);
              filter: blur(10px);
            }
            65% {
              filter: blur(0px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0px);
            }
          }
          .page-trans-login {
            animation: pageLoginEntrance 580ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity, filter;
          }

          @keyframes pageGuidelinesEntrance {
            0% {
              opacity: 0;
              transform: translateY(44px) scale(0.985);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .page-trans-guidelines {
            animation: pageGuidelinesEntrance 580ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageSignupEntrance {
            0% {
              opacity: 0;
              transform: translateX(48px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .page-trans-signup {
            animation: pageSignupEntrance 560ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageVerificationEntrance {
            0% {
              opacity: 0;
              transform: scale(0.92);
              filter: brightness(1.2);
            }
            100% {
              opacity: 1;
              transform: scale(1);
              filter: brightness(1);
            }
          }
          .page-trans-verification {
            animation: pageVerificationEntrance 600ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity, filter;
          }

          @keyframes pageHomeEntrance {
            0% {
              opacity: 0;
              transform: translateY(28px) scale(0.988);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .page-trans-home {
            animation: pageHomeEntrance 560ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageDiscoveryEntrance {
            0% {
              opacity: 0;
              transform: translate(36px, 24px) rotate(-1.5deg);
            }
            100% {
              opacity: 1;
              transform: translate(0, 0) rotate(0deg);
            }
          }
          .page-trans-discovery {
            animation: pageDiscoveryEntrance 580ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageTripsEntrance {
            0% {
              opacity: 0;
              transform: translateY(-32px);
            }
            70% {
              transform: translateY(4px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .page-trans-trips {
            animation: pageTripsEntrance 560ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageMatchesEntrance {
            0% {
              opacity: 0;
              transform: translateX(42px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .page-trans-matches {
            animation: pageMatchesEntrance 550ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageProfileEntrance {
            0% {
              opacity: 0;
              transform: translateY(32px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .page-trans-profile {
            animation: pageProfileEntrance 580ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageSettingsEntrance {
            0% {
              opacity: 0;
              transform: translateX(50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .page-trans-settings {
            animation: pageSettingsEntrance 520ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageReviewEntrance {
            0% {
              opacity: 0;
              transform: translateY(55px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .page-trans-review {
            animation: pageReviewEntrance 550ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }

          @keyframes pageShowcaseEntrance {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .page-trans-showcase {
            animation: pageShowcaseEntrance 500ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
            will-change: transform, opacity;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <AuthRouteGuard>
              <ThemedAppContainer>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
                  <Stack.Screen
                    name="chat/[id]"
                    options={{
                      headerShown: false,
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="review/[id]"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{
                      headerShown: false,
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="showcase"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen
                    name="+not-found"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                </Stack>
              </ThemedAppContainer>
            </AuthRouteGuard>
            {/* Always visible Floating Test Navigator */}
            <TestNavigatorModal />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMsg}>{error?.message || 'An unexpected error occurred.'}</Text>
      <TouchableOpacity style={styles.errorBtn} onPress={retry} activeOpacity={0.8}>
        <Text style={styles.errorBtnText}>Reload App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    fontWeight: '700',
    color: '#171817',
    marginBottom: 8,
  },
  errorMsg: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  errorBtnText: {
    fontFamily: FONTS.bold,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});
