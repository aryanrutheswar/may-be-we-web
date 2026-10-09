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
import TransitionManager from '../components/TransitionManager';
import { initLenis, destroyLenis } from '../lib/lenis';
import LenisTelemetryHUD from '../components/LenisTelemetryHUD';

function AuthRouteGuard({ children }) {
  const { session, user, profile, isLoading, isPasswordRecovery } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const searchParams = useGlobalSearchParams();

  useEffect(() => {
    if (isLoading) return;

    // Allow QA showcase tester or explicit preview mode from Test Navigator
    let isPreviewMode = searchParams?.preview === 'true';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (isPreviewMode) {
        try { window.sessionStorage?.setItem('__maybewe_preview__', 'true'); } catch (e) {}
      } else if (window.sessionStorage?.getItem('__maybewe_preview__') === 'true') {
        isPreviewMode = true;
      }
    }
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

    const isPublicAuthScreen =
      currentSubRoute === 'welcome' ||
      currentSubRoute === 'login' ||
      currentSubRoute === 'signup' ||
      currentSubRoute === 'forgot-password' ||
      currentSubRoute === 'reset-password';

    // 1. If user is on index or ANY public auth screen (welcome, login, signup, forgot-password, reset-password),
    // NEVER redirect them away. Allow free navigation!
    if (firstSegment === '' || firstSegment === 'index' || (inAuthGroup && isPublicAuthScreen)) {
      return;
    }

    // 2. Unverified or unauthenticated visitors trying to access protected areas must land on welcome
    if (!inAuthGroup && (!isAuthenticated || !isVerified)) {
      console.log('[AuthGuard] Protected area access -> Redirecting to /(auth)/welcome');
      router.replace('/(auth)/welcome');
      return;
    }

    // 3. If authenticated but unverified, only protected app areas require verification
    if (isAuthenticated && !isVerified) {
      if (!inAuthGroup) {
        router.replace('/(auth)/verification');
      }
      return;
    }

    // 4. If unauthenticated visitor tries to access protected app areas
    if (!isAuthenticated && !inAuthGroup) {
      console.log('[AuthGuard] Unauthenticated access to', segments.join('/'), '-> Redirecting to /(auth)/welcome');
      router.replace('/(auth)/welcome');
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
  // Lenis smooth scrolling lifecycle (Web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    initLenis();

    return () => {
      destroyLenis();
    };
  }, []);

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

          /* ============================================================ */
          /* LENIS SMOOTH SCROLLING STYLES                                */
          /* ============================================================ */
          html.lenis,
          html.lenis body {
            height: auto !important;
            min-height: 100% !important;
          }
          html.lenis body {
            overflow-y: visible !important;
          }
          .lenis:not(.lenis-autoToggle).lenis-stopped {
            overflow: clip !important;
          }
          .lenis [data-lenis-prevent],
          .lenis [data-lenis-prevent-wheel],
          .lenis [data-lenis-prevent-touch],
          .lenis [data-lenis-prevent-vertical],
          .lenis [data-lenis-prevent-horizontal] {
            overscroll-behavior: contain !important;
          }
          .lenis.lenis-smooth iframe {
            pointer-events: none !important;
          }
          .lenis.lenis-autoToggle {
            transition-property: overflow;
            transition-duration: 1ms;
            transition-behavior: allow-discrete;
          }

          /* ============================================================ */
          /* DARKROOM LENIS DESIGN SYSTEM & EDITORIAL MOTION              */
          /* ============================================================ */
          .lenis-display-hero {
            font-family: 'Manrope', -apple-system, sans-serif !important;
            font-size: clamp(2.8rem, 8vw, 7.5rem) !important;
            font-weight: 800 !important;
            line-height: 0.94 !important;
            letter-spacing: -0.04em !important;
            text-transform: uppercase !important;
          }
          .lenis-display-sub {
            font-family: 'Manrope', -apple-system, sans-serif !important;
            font-size: clamp(1rem, 2vw, 1.4rem) !important;
            font-weight: 500 !important;
            line-height: 1.5 !important;
            letter-spacing: -0.01em !important;
          }
          .lenis-mono-badge {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: 0.16em !important;
            text-transform: uppercase !important;
          }
          @keyframes lenisMarqueeTrack {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .lenis-marquee {
            overflow: hidden !important;
            white-space: nowrap !important;
            display: flex !important;
            user-select: none !important;
            border-top: 1px solid rgba(231, 211, 181, 0.16) !important;
            border-bottom: 1px solid rgba(231, 211, 181, 0.16) !important;
          }
          .lenis-marquee-inner {
            display: flex !important;
            width: max-content !important;
            animation: lenisMarqueeTrack 34s linear infinite !important;
          }
          .lenis-marquee-inner:hover {
            animation-play-state: paused !important;
          }
          .lenis-scroll-reveal {
            opacity: 0 !important;
            transform: translateY(32px) !important;
            transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) !important;
            will-change: opacity, transform !important;
          }
          .lenis-scroll-reveal.is-inview {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          .lenis-delay-1 { transition-delay: 80ms !important; }
          .lenis-delay-2 { transition-delay: 160ms !important; }
          .lenis-delay-3 { transition-delay: 240ms !important; }
          .lenis-editorial-card {
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease !important;
          }
          .lenis-editorial-card:hover {
            transform: translateY(-6px) scale(1.01) !important;
            box-shadow: 0 20px 36px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(231, 211, 181, 0.35) !important;
          }
          @keyframes mwBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(5px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .lenis-marquee-inner { animation: none !important; }
            .lenis-scroll-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
            .lenis-editorial-card { transform: none !important; transition: none !important; }
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
          }
        }

        /* ============================================================ */
        /* MAYBEWE CINEMATIC PAGE TRANSITION SYSTEM                     */
        /* ============================================================ */
        #maybewe-transition-overlay {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          pointer-events: none !important;
          opacity: 0;
          visibility: hidden;
          overflow: hidden !important;
        }

        #maybewe-transition-overlay.is-active {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: none !important;
        }

        /* Staggered page content entrance when transition finishes */
        [data-page-ready="true"] h1,
        [data-page-ready="true"] [role="heading"],
        [data-page-ready="true"] .hero-title {
          animation: mwPageContentFadeUp 480ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
        }

        [data-page-ready="true"] p,
        [data-page-ready="true"] .hero-subtitle,
        [data-page-ready="true"] .section-desc {
          animation: mwPageContentFadeUp 520ms cubic-bezier(0.16, 1, 0.3, 1) 60ms both !important;
        }

        [data-page-ready="true"] [data-card="true"],
        [data-page-ready="true"] .travel-card,
        [data-page-ready="true"] .itinerary-card {
          animation: mwPageCardScale 540ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both !important;
        }

        @keyframes mwPageContentFadeUp {
          0% {
            opacity: 0.15;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes mwPageCardScale {
          0% {
            opacity: 0.2;
            transform: translateY(18px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 1: CURTAIN (Dual-Layer Champagne & Obsidian Silk)    */
        /* ------------------------------------------------------------ */
        .mw-curtain-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .mw-curtain-accent {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100%;
          background: #D9C8B2;
          box-shadow: 0 0 40px rgba(185, 154, 94, 0.3);
          will-change: transform;
        }

        .mw-curtain-primary {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100%;
          background: #171817;
          will-change: transform;
        }

        .mw-curtain-brand-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(231, 211, 181, 0.12) 0%, transparent 70%);
        }

        /* Forward Curtain: Left to Right */
        .variant-curtain.dir-forward.state-covering .mw-curtain-accent {
          animation: mwCurtainSweepInForward 280ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-curtain.dir-forward.state-covering .mw-curtain-primary {
          animation: mwCurtainSweepInForward 280ms cubic-bezier(0.77, 0, 0.175, 1) 30ms both;
        }

        .variant-curtain.dir-forward.state-revealing .mw-curtain-primary {
          animation: mwCurtainSweepOutForward 340ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-curtain.dir-forward.state-revealing .mw-curtain-accent {
          animation: mwCurtainSweepOutForward 340ms cubic-bezier(0.77, 0, 0.175, 1) 30ms both;
        }

        @keyframes mwCurtainSweepInForward {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }

        @keyframes mwCurtainSweepOutForward {
          0% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        /* Backward Curtain: Right to Left */
        .variant-curtain.dir-backward.state-covering .mw-curtain-accent {
          animation: mwCurtainSweepInBackward 280ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-curtain.dir-backward.state-covering .mw-curtain-primary {
          animation: mwCurtainSweepInBackward 280ms cubic-bezier(0.77, 0, 0.175, 1) 30ms both;
        }

        .variant-curtain.dir-backward.state-revealing .mw-curtain-primary {
          animation: mwCurtainSweepOutBackward 340ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-curtain.dir-backward.state-revealing .mw-curtain-accent {
          animation: mwCurtainSweepOutBackward 340ms cubic-bezier(0.77, 0, 0.175, 1) 30ms both;
        }

        @keyframes mwCurtainSweepInBackward {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }

        @keyframes mwCurtainSweepOutBackward {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 2: PAGE REVEAL (Angled Obsidian & Champagne Border) */
        /* ------------------------------------------------------------ */
        .mw-reveal-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .mw-reveal-panel {
          position: absolute;
          inset: 0;
          background: #171817;
          will-change: transform;
        }

        .mw-reveal-gold-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #E7D3B5, #B99A5E, transparent);
          box-shadow: 0 0 15px rgba(231, 211, 181, 0.6);
        }

        .variant-page-reveal.state-covering .mw-reveal-panel {
          animation: mwRevealIn 270ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .variant-page-reveal.state-revealing .mw-reveal-panel {
          animation: mwRevealOut 330ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mwRevealIn {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0%); }
        }

        @keyframes mwRevealOut {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 3: ROMANTIC PARTICLE & LIGHT REVEAL                  */
        /* ------------------------------------------------------------ */
        .mw-particle-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #171817;
          overflow: hidden;
        }

        .mw-particle-radial-light {
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at 50% 50%, rgba(231, 211, 181, 0.35) 0%, rgba(185, 154, 94, 0.15) 45%, rgba(23, 24, 23, 0.98) 75%);
          animation: mwRadialGlowPulse 580ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .mw-particle-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .mw-star {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #EFDCCC;
          box-shadow: 0 0 12px #E7D3B5, 0 0 24px #B99A5E;
          opacity: 0;
          animation: mwStarFloat 580ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mwRadialGlowPulse {
          0% { opacity: 0; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.3); }
        }

        @keyframes mwStarFloat {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.5);
          }
          40% {
            opacity: 1;
            transform: translateY(0) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-28px) scale(0.6);
          }
        }

        .variant-particle-light.state-covering {
          animation: mwFadeIn 260ms ease both;
        }
        .variant-particle-light.state-revealing {
          animation: mwFadeOut 340ms ease both;
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 4: SOFT REVEAL (Expanding Radial Mask)               */
        /* ------------------------------------------------------------ */
        .mw-soft-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #171817;
          will-change: clip-path;
        }

        .variant-soft-reveal.state-covering .mw-soft-container {
          animation: mwSoftCover 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .variant-soft-reveal.state-revealing .mw-soft-container {
          animation: mwSoftReveal 340ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mwSoftCover {
          0% { clip-path: circle(0% at 50% 50%); }
          100% { clip-path: circle(140% at 50% 50%); }
        }

        @keyframes mwSoftReveal {
          0% { clip-path: circle(140% at 50% 50%); }
          100% { clip-path: circle(0% at 50% 50%); }
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 5: SCALE / ZOOM (Cinematic Depth Transition)         */
        /* ------------------------------------------------------------ */
        .mw-zoom-container {
          position: absolute;
          inset: 0;
          background: rgba(23, 24, 23, 0.75);
          backdrop-filter: blur(4px);
          will-change: opacity;
        }

        .variant-scale-zoom.state-covering .mw-zoom-container {
          animation: mwFadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .variant-scale-zoom.state-revealing .mw-zoom-container {
          animation: mwFadeOut 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 6: GRAND ENTRANCE (Auth to Main Website Double Veil) */
        /* ------------------------------------------------------------ */
        .mw-grand-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .mw-grand-panel-left {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 50.5%;
          background: #171817;
          border-right: 1.5px solid rgba(231, 211, 181, 0.4);
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.6);
          will-change: transform;
        }

        .mw-grand-panel-right {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 50.5%;
          background: #171817;
          border-left: 1.5px solid rgba(231, 211, 181, 0.4);
          box-shadow: -4px 0 25px rgba(0, 0, 0, 0.6);
          will-change: transform;
        }

        .mw-grand-crest {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }

        .mw-crest-glow {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(231, 211, 181, 0.28) 0%, transparent 70%);
        }

        .mw-crest-wordmark {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #EFDCCC;
          text-shadow: 0 0 25px rgba(231, 211, 181, 0.5);
        }

        .mw-crest-subtitle {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #B99A5E;
          margin-top: 6px;
        }

        .variant-grand-entrance.state-covering .mw-grand-panel-left {
          animation: mwGrandCloseLeft 280ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-grand-entrance.state-covering .mw-grand-panel-right {
          animation: mwGrandCloseRight 280ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-grand-entrance.state-covering .mw-grand-crest {
          animation: mwGrandCrestIn 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .variant-grand-entrance.state-revealing .mw-grand-panel-left {
          animation: mwGrandOpenLeft 360ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-grand-entrance.state-revealing .mw-grand-panel-right {
          animation: mwGrandOpenRight 360ms cubic-bezier(0.77, 0, 0.175, 1) both;
        }
        .variant-grand-entrance.state-revealing .mw-grand-crest {
          animation: mwGrandCrestOut 240ms ease both;
        }

        @keyframes mwGrandCloseLeft {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }

        @keyframes mwGrandCloseRight {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }

        @keyframes mwGrandOpenLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes mwGrandOpenRight {
          0% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes mwGrandCrestIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes mwGrandCrestOut {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.06); }
        }

        /* ------------------------------------------------------------ */
        /* VARIANT 7: SOFT SLIDE (Login <-> Signup)                     */
        /* ------------------------------------------------------------ */
        .mw-slide-container {
          position: absolute;
          inset: 0;
          background: rgba(23, 24, 23, 0.5);
          backdrop-filter: blur(6px);
          will-change: opacity;
        }

        .variant-soft-slide.state-covering .mw-slide-container {
          animation: mwFadeIn 220ms ease both;
        }
        .variant-soft-slide.state-revealing .mw-slide-container {
          animation: mwFadeOut 260ms ease both;
        }

        /* ------------------------------------------------------------ */
        /* FALLBACK REDUCED MOTION                                      */
        /* ------------------------------------------------------------ */
        .mw-reduced-veil {
          position: absolute;
          inset: 0;
          background: #171817;
          will-change: opacity;
        }

        .variant-reduced-fade.state-covering .mw-reduced-veil {
          animation: mwFadeIn 100ms ease both;
        }
        .variant-reduced-fade.state-revealing .mw-reduced-veil {
          animation: mwFadeOut 120ms ease both;
        }

        @keyframes mwFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes mwFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
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
                <TransitionManager>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  >
                    <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
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
                  {/* Always visible Floating Test Navigator */}
                  <TestNavigatorModal />
                  {/* Floating Lenis Telemetry HUD (Web only) */}
                  <LenisTelemetryHUD />
                </TransitionManager>
              </ThemedAppContainer>
            </AuthRouteGuard>
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
