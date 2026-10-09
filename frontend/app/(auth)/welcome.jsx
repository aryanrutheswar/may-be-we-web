import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADII } from '../../lib/theme';
import { useTransitionManager } from '../../components/TransitionManager';
import { useAuth } from '../../lib/authContext';
import LenisEditorialExperience from '../../components/LenisEditorialExperience';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { navigateWithTransition } = useTransitionManager();
  const { enterGuestMode } = useAuth();

  // State: whether the intro video has finished playing once
  const [introFinished, setIntroFinished] = useState(false);
  // Options visibility: reveals swiftly so user does not wait 10 seconds to interact
  const [optionsVisible, setOptionsVisible] = useState(false);
  const videoRef = useRef(null);

  // Set document title on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'MaybeWe — Meet someone. Go somewhere.';
    }
  }, []);

  // Swift entrance: gracefully reveal options after a brief 700ms cinematic beat
  useEffect(() => {
    const timer = setTimeout(() => {
      setOptionsVisible(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);



  // Completion handler: video stops on final frame as background
  const finishIntro = useCallback(() => {
    setIntroFinished((prev) => {
      if (prev) return prev;
      console.log('[WelcomeScreen] Intro video completed. Freezing background.');
      const video = videoRef.current;
      if (video) {
        try {
          video.pause();
          if (video.duration && Number.isFinite(video.duration)) {
            video.currentTime = Math.max(0, video.duration - 0.05);
          }
        } catch (e) {}
      }
      return true;
    });
    setOptionsVisible(true);
  }, []);

  // Safe navigation helper with transition
  const handleNavigate = (route) => {
    if (typeof navigateWithTransition === 'function') {
      navigateWithTransition(route);
    } else {
      router.push(route);
    }
  };

  // Instant demo exploration handler
  const handleGuestExplore = async () => {
    try {
      if (typeof enterGuestMode === 'function') {
        await enterGuestMode();
      }
    } catch (e) {
      console.warn('[WelcomeScreen] Guest explore error:', e);
    }
    handleNavigate('/(tabs)');
  };

  // Video event listeners & single-play background management
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Native fallback: reveal options immediately
      setIntroFinished(true);
      setOptionsVisible(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Enforce muted and playsinline for universal browser autoplay
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    try {
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');
    } catch (e) {}

    const handleEnded = () => {
      console.log('[WelcomeScreen] Video reached end event naturally.');
      finishIntro();
    };

    const handleTimeUpdate = () => {
      // Finish when the video has actually played to the end
      if (
        video.duration &&
        Number.isFinite(video.duration) &&
        video.duration > 2 &&
        video.currentTime >= video.duration - 0.1
      ) {
        finishIntro();
      }
    };

    const handleError = (e) => {
      console.warn('[WelcomeScreen] Video playback issue:', e);
      // If video has trouble loading, ensure options are visible immediately
      setOptionsVisible(true);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);

    const playVideo = () => {
      video.muted = true;
      const p = video.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('[WelcomeScreen] Autoplay deferred by browser:', err);
          setOptionsVisible(true);
        });
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true });
      video.addEventListener('canplay', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', playVideo);
      video.removeEventListener('canplay', playVideo);
    };
  }, [finishIntro]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Hero Section Container */}
      <View style={styles.heroSection}>
        {/* ============================================================ */}
        {/* 1. CINEMATIC FALLBACK IMAGE                                   */}
        {/* ============================================================ */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <Image
          source={require('../../assets/images/maybewe_entrance_bg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* ============================================================ */}
      {/* 2. CINEMATIC VIDEO BACKGROUND (Plays once & stays on final frame) */}
      {/* ============================================================ */}
      {Platform.OS === 'web' && (
        <View
          id="intro-video-container"
          style={styles.videoContainer}
          onClick={() => {
            // Tap anywhere on video to reveal options immediately
            if (!optionsVisible) setOptionsVisible(true);
          }}
        >
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.playsInline = true;
              }
            }}
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            controls={false}
            loop={false}
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              backgroundColor: '#0F1115',
              display: 'block',
              border: 'none',
              outline: 'none',
              cursor: optionsVisible ? 'default' : 'pointer',
            }}
          >
            <source src="/intro.mp4" type="video/mp4" />
            <source src="/Sequence%2001.mp4" type="video/mp4" />
          </video>
        </View>
      )}

      {/* ============================================================ */}
      {/* 3. SOFT CONTRAST GRADIENT (Fades in over final frame)        */}
      {/* ============================================================ */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.52)']}
        style={[
          StyleSheet.absoluteFillObject,
          {
            zIndex: 4,
            opacity: optionsVisible ? 1 : 0,
            pointerEvents: 'none',
            ...Platform.select({
              web: {
                transition: 'opacity 0.6s ease',
              },
            }),
          },
        ]}
        pointerEvents="none"
      />

      {/* ============================================================ */}
      {/* 5. OPTIONS SURFACE (Revealed swiftly with smooth entrance)    */}
      {/* ============================================================ */}
      <View
        style={[
          styles.optionsOverlay,
          {
            paddingBottom: Math.max(insets.bottom + 18, 28),
            opacity: optionsVisible ? 1 : 0,
            pointerEvents: optionsVisible ? 'auto' : 'none',
            transform: optionsVisible ? [{ translateY: 0 }] : [{ translateY: 20 }],
            ...Platform.select({
              web: {
                transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              },
            }),
          },
        ]}
      >
        <View style={styles.controlsCard}>
          {/* Sign In Primary Pill Button */}
          <TouchableOpacity
            style={styles.pillSignInBtn}
            onPress={() => handleNavigate('/(auth)/login')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
          >
            <Text style={styles.pillSignInBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={17} color="#171817" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Sign Up Frosted Outline Pill Button */}
          <TouchableOpacity
            style={styles.pillSignUpBtn}
            onPress={() => handleNavigate('/(auth)/signup')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sign Up"
          >
            <Text style={styles.pillSignUpBtnText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Explore MaybeWe (Guest Demo) */}
          <TouchableOpacity
            style={styles.guestExploreBtn}
            onPress={handleGuestExplore}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Explore MaybeWe (Guest Demo)"
          >
            <Ionicons name="sparkles" size={14} color="#F2D184" style={{ marginRight: 7 }} />
            <Text style={styles.guestExploreText}>Explore MaybeWe (Guest Demo)</Text>
          </TouchableOpacity>



          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => handleNavigate('/(auth)/forgot-password')}
            style={styles.forgotBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Forgot Password?"
          >
            <Text style={styles.forgotBtnText}>Forgot Password?</Text>
          </TouchableOpacity>

            {/* Subtle Editorial Tagline */}
            <View style={styles.footerTagline}>
              <Text style={styles.footerTaglineText}>MEET SOMEONE. GO SOMEWHERE.</Text>
            </View>
          </View>
        </View>

        {/* Scroll down cue for Web */}
        {Platform.OS === 'web' && (
          <div
            className="lenis-scroll-cue"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const el = document.querySelector('.lenis-editorial-root');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: optionsVisible ? 0.75 : 0,
              transition: 'opacity 0.6s ease',
              userSelect: 'none',
            }}
          >
            <span style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: '#D9C8B2',
              textTransform: 'uppercase',
            }}>
              Scroll to explore
            </span>
            <span style={{ color: '#F2D184', fontSize: 13, animation: 'mwBounce 1.5s infinite' }}>↓</span>
          </div>
        )}
      </View>

      {/* 6. Lenis Editorial Manifesto & Showcase Section (Web only) */}
      {Platform.OS === 'web' && (
        <LenisEditorialExperience
          onExplore={handleGuestExplore}
          onSignIn={() => handleNavigate('/(auth)/login')}
          onSignUp={() => handleNavigate('/(auth)/signup')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1115',
    position: 'relative',
    ...Platform.select({
      web: {
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: '100vh',
      },
      default: {
        overflow: 'hidden',
      },
    }),
  },

  heroSection: {
    width: '100%',
    height: '100vh',
    minHeight: 620,
    position: 'relative',
    overflow: 'hidden',
  },

  /* Background image layer */
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },

  /* Video background layer */
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    backgroundColor: '#0F1115',
    overflow: 'hidden',
  },



  /* Options overlay positioned in the lower area of the screen */
  optionsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },

  controlsCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
  },

  /* Sign In Button */
  pillSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    borderRadius: RADII.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.32)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      },
    }),
  },
  pillSignInBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#171817',
    letterSpacing: -0.2,
  },

  /* Sign Up Button */
  pillSignUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.70)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.22)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      },
    }),
  },
  pillSignUpBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* Guest Demo Explore Button */
  guestExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 42,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: 2,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      },
    }),
  },
  guestExploreText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#FAF8F3',
    letterSpacing: 0.1,
  },



  /* Forgot Password */
  forgotBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  forgotBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    ...Platform.select({
      web: {
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
      },
    }),
  },

  /* Footer Tagline */
  footerTagline: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerTaglineText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.60)',
    letterSpacing: 1.8,
  },
});
