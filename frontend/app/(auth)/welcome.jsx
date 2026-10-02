import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADII } from '../../lib/theme';
import { useAuth } from '../../lib/authContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, user, profile, login, signup } = useAuth();

  const isVerified = profile?.verification_status === 'verified';
  const isAuthenticated = Boolean(user || session?.user || profile?.id);

  // Video playback & transition states
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [videoDismissed, setVideoDismissed] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // View mode: 'buttons' (initial Sign In / Sign Up buttons) | 'signin' | 'signup'
  const [authViewMode, setAuthViewMode] = useState('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Options coming down from under the MaybeWe text
  const optionsSlideAnim = useRef(new Animated.Value(-24)).current;
  const optionsFadeAnim = useRef(new Animated.Value(0)).current;

  // Video element reference
  const videoRef = useRef(null);

  // Prevent scrolling while the video is playing
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'MaybeWe — Meet someone. Go somewhere.';
      if (!contentVisible && !videoDismissed) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }
    }
  }, [contentVisible, videoDismissed]);

  // Handle video playback and ended event
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasEnded = false;

    const handleVideoEnded = () => {
      if (hasEnded) return;
      hasEnded = true;
      console.log('[WelcomeScreen] EXACT Sequence 01.mp4 has ended naturally.');

      // 1. Brief cinematic pause on the final frame (400ms)
      setTimeout(() => {
        // 2. Smoothly fade the video overlay out (700ms)
        setVideoOpacity(0);

        // Check if user is already authenticated (returning user)
        if (isAuthenticated) {
          setTimeout(() => {
            setVideoDismissed(true);
            if (Platform.OS === 'web' && typeof document !== 'undefined') {
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
            }
            if (isVerified) {
              router.replace('/(tabs)');
            } else {
              router.replace('/(auth)/verification');
            }
          }, 700);
          return;
        }

        // 3. For unauthenticated visitors: Animate options DOWN from under the MaybeWe text
        setTimeout(() => {
          setContentVisible(true);
          const useNativeDriver = Platform.OS !== 'web';

          Animated.parallel([
            Animated.timing(optionsFadeAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver,
            }),
            Animated.spring(optionsSlideAnim, {
              toValue: 0,
              friction: 7,
              tension: 38,
              useNativeDriver,
            }),
          ]).start(() => {
            setVideoDismissed(true);
            if (Platform.OS === 'web' && typeof document !== 'undefined') {
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
            }
          });
        }, 150);
      }, 350);
    };

    video.addEventListener('ended', handleVideoEnded);

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.controls = false;

    const startPlayback = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[WelcomeScreen] Autoplay deferred:', err);
        });
      }
    };

    if (video.readyState >= 3) {
      startPlayback();
    } else {
      video.addEventListener('canplay', startPlayback, { once: true });
    }

    return () => {
      video.removeEventListener('ended', handleVideoEnded);
      video.removeEventListener('canplay', startPlayback);
    };
  }, [isAuthenticated, isVerified]);

  // Switch mode with smooth animation
  const switchAuthMode = (newMode) => {
    setErrorMessage('');
    const useNativeDriver = Platform.OS !== 'web';
    Animated.sequence([
      Animated.timing(optionsFadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver,
      }),
      Animated.timing(optionsSlideAnim, {
        toValue: -16,
        duration: 120,
        useNativeDriver,
      }),
    ]).start(() => {
      setAuthViewMode(newMode);
      Animated.parallel([
        Animated.timing(optionsFadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver,
        }),
        Animated.spring(optionsSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver,
        }),
      ]).start();
    });
  };

  // Sign In handler
  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log('[WelcomeAuth] Initiating sign-in for:', trimmedEmail);
      const res = await login(trimmedEmail, password);

      if (!res?.success) {
        setErrorMessage(res?.error || 'Unable to sign in. Please verify your credentials.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('[WelcomeAuth] Sign in error:', err);
      setLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred during sign-in.');
    }
  };

  // Sign Up handler
  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log('[WelcomeAuth] Initiating account creation for:', trimmedEmail);
      const res = await signup({
        name: trimmedName,
        email: trimmedEmail,
        password,
        age: 24,
        gender: 'Not specified',
        travel_styles: ['Culture', 'Adventure'],
        languages: ['English'],
      });

      if (!res?.success) {
        setErrorMessage(res?.error || 'Unable to create account. Please try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('[WelcomeAuth] Sign up error:', err);
      setLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ============================================================ */}
      {/* 1. CINEMATIC SUNSET CLOUD ENTRANCE BACKGROUND                */}
      {/* ============================================================ */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <Image
          source={require('../../assets/images/maybewe_entrance_bg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.10)', 'rgba(0, 0, 0, 0.18)', 'rgba(0, 0, 0, 0.42)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      {/* ============================================================ */}
      {/* 2. EXACT INTRO VIDEO (Full-screen, covers viewport)          */}
      {/* ============================================================ */}
      {!videoDismissed && (
        <View
          id="intro-video-container"
          style={[
            styles.videoContainer,
            {
              opacity: videoOpacity,
              pointerEvents: videoOpacity === 0 ? 'none' : 'auto',
            },
          ]}
        >
          {Platform.OS === 'web' && (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
                controls={false}
                loop={false}
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  backgroundColor: '#000000',
                  display: 'block',
                  border: 'none',
                  outline: 'none',
                  transform: 'translateZ(0)',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <source src="/Sequence 01.mp4?v=3" type="video/mp4" />
                <source src="/Sequence%2001.mp4?v=3" type="video/mp4" />
              </video>
            </>
          )}
        </View>
      )}

      {/* ============================================================ */}
      {/* 3. MAYBEWE OPTIONS COMING DOWN UNDER THE CURSIVE SCRIPT       */}
      {/* ============================================================ */}
      <View
        style={[
          styles.contentContainer,
          {
            pointerEvents: contentVisible ? 'auto' : 'none',
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + 20, 32),
                paddingBottom: Math.max(insets.bottom + 20, 36),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Elegant spacer leaving the cursive "May Be We" script completely unobstructed */}
            <View style={styles.brandScriptSpacer} />

            {/* ======================================================== */}
            {/* OPTIONS COMING DOWN OF THE MAYBEWE TEXT WITH ANIMATION   */}
            {/* ======================================================== */}
            <Animated.View
              style={[
                styles.optionsContainer,
                {
                  opacity: optionsFadeAnim,
                  transform: [{ translateY: optionsSlideAnim }],
                },
              ]}
            >
              {authViewMode === 'buttons' ? (
                /* ============================================== */
                /* INITIAL STATE: SIGN IN & SIGN UP PILL BUTTONS  */
                /* ============================================== */
                <View style={styles.buttonsSurface}>
                  {/* Sign In Primary Pill Button */}
                  <TouchableOpacity
                    style={styles.pillSignInBtn}
                    onPress={() => switchAuthMode('signin')}
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
                    onPress={() => switchAuthMode('signup')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Sign Up"
                  >
                    <Text style={styles.pillSignUpBtnText}>Sign Up</Text>
                  </TouchableOpacity>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    style={styles.forgotBtn}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Forgot Password?"
                  >
                    <Text style={styles.forgotBtnText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              ) : authViewMode === 'signin' ? (
                /* ============================================== */
                /* SIGN IN FORM (Animated Down under MaybeWe)     */
                /* ============================================== */
                <View style={styles.glassFormCard}>
                  <View style={styles.formCardHeader}>
                    <Text style={styles.formCardTitle}>WELCOME BACK</Text>
                    <Text style={styles.formCardSubtitle}>Sign in to continue your journey.</Text>
                  </View>

                  {/* Email Field */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Email</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="mail-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="name@traveler.io"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Password</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="lock-closed-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="Your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="done"
                        onSubmitEditing={handleSignIn}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="rgba(255, 255, 255, 0.85)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/forgot-password')}
                    style={styles.formForgotBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.formForgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Error Banner */}
                  {errorMessage ? (
                    <View style={styles.glassErrorBox}>
                      <Ionicons name="alert-circle" size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
                      <Text style={styles.glassErrorText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* Submit SIGN IN */}
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, loading && styles.btnDisabled]}
                    onPress={handleSignIn}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#171817" />
                    ) : (
                      <Text style={styles.primaryActionBtnText}>SIGN IN</Text>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Sign Up */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchPromptText}>Don't have an account? </Text>
                    <TouchableOpacity
                      onPress={() => switchAuthMode('signup')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.switchActionText}>SIGN UP</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Back to Options button */}
                  <TouchableOpacity
                    onPress={() => switchAuthMode('buttons')}
                    style={styles.backToOverviewBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backToOverviewText}>← Back to overview</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ============================================== */
                /* SIGN UP FORM (Animated Down under MaybeWe)     */
                /* ============================================== */
                <View style={styles.glassFormCard}>
                  <View style={styles.formCardHeader}>
                    <Text style={styles.formCardTitle}>CREATE ACCOUNT</Text>
                    <Text style={styles.formCardSubtitle}>Join MaybeWe and find your travel companion.</Text>
                  </View>

                  {/* Full Name */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Full Name</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="person-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="Your full name"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        autoCapitalize="words"
                        autoCorrect={false}
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Email</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="mail-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="name@traveler.io"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Password</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="lock-closed-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="Create password (min 6 chars)"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="next"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="rgba(255, 255, 255, 0.85)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.glassInputGroup}>
                    <Text style={styles.glassInputLabel}>Confirm Password</Text>
                    <View style={styles.glassInputWrapper}>
                      <Ionicons name="lock-closed-outline" size={18} color="rgba(255, 255, 255, 0.75)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.glassTextInput}
                        placeholder="Confirm your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.55)"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={confirmPassword}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (errorMessage) setErrorMessage('');
                        }}
                        returnKeyType="done"
                        onSubmitEditing={handleSignUp}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="rgba(255, 255, 255, 0.85)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Error Banner */}
                  {errorMessage ? (
                    <View style={styles.glassErrorBox}>
                      <Ionicons name="alert-circle" size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
                      <Text style={styles.glassErrorText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* Submit CREATE ACCOUNT */}
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, loading && styles.btnDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#171817" />
                    ) : (
                      <Text style={styles.primaryActionBtnText}>CREATE ACCOUNT</Text>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Sign In */}
                  <View style={styles.switchRow}>
                    <Text style={styles.switchPromptText}>Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => switchAuthMode('signin')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.switchActionText}>SIGN IN</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Back to Options button */}
                  <TouchableOpacity
                    onPress={() => switchAuthMode('buttons')}
                    style={styles.backToOverviewBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backToOverviewText}>← Back to overview</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>

            {/* Quiet Luxury Footer */}
            <View style={styles.footerPillar}>
              <Text style={styles.footerPillarText}>TRAVEL  //  CONNECT  //  EXPLORE</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },

  /* ============================================================ */
  /* CINEMATIC SUNSET MOUNTAINS BACKGROUND LAYER                  */
  /* ============================================================ */
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },

  /* ============================================================ */
  /* EXACT INTRO VIDEO CONTAINER                                  */
  /* ============================================================ */
  videoContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    backgroundColor: '#000000',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity, transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      },
    }),
  },

  /* ============================================================ */
  /* CONTENT CONTAINER                                            */
  /* ============================================================ */
  contentContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    width: '100%',
  },

  /* ============================================================ */
  /* SPACER LEAVING CURSIVE "May Be We" PROMINENT & UNOBSTRUCTED */
  /* ============================================================ */
  brandScriptSpacer: {
    width: '100%',
    ...Platform.select({
      web: {
        minHeight: '62vh',
      },
      default: {
        minHeight: 380,
      },
    }),
  },

  /* ============================================================ */
  /* ANIMATED OPTIONS COMING DOWN OF THE MAYBEWE TEXT             */
  /* ============================================================ */
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 24,
  },

  /* Initial Pill Buttons Surface */
  buttonsSurface: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  pillSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      },
    }),
  },
  pillSignInBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#171817',
    letterSpacing: -0.2,
  },
  pillSignUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.70)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.20)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      },
    }),
  },
  pillSignUpBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  forgotBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 2,
  },
  forgotBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    ...Platform.select({
      web: {
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
      },
    }),
  },

  /* ============================================================ */
  /* FROSTED GLASS FORM CARD (Sign In / Sign Up)                  */
  /* ============================================================ */
  glassFormCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    paddingHorizontal: 26,
    paddingVertical: 28,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
      },
    }),
  },
  formCardHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  formCardTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  formCardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },

  /* Inputs */
  glassInputGroup: {
    marginBottom: 14,
  },
  glassInputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    letterSpacing: 0.2,
    ...Platform.select({
      web: {
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  glassInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingHorizontal: 14,
    height: 48,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  glassTextInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeBtn: {
    padding: 6,
  },

  /* Forgot Password Link in Form */
  formForgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 14,
    paddingVertical: 2,
  },
  formForgotText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.90)',
    ...Platform.select({
      web: {
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
      },
    }),
  },

  /* Error Banner */
  glassErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  glassErrorText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Primary Action Submit Button */
  primaryActionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.full,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.30)',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      },
    }),
  },
  primaryActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#171817',
    letterSpacing: 1,
  },
  btnDisabled: {
    opacity: 0.65,
  },

  /* Switch row */
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchPromptText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  switchActionText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  backToOverviewBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  backToOverviewText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },

  /* Footer */
  footerPillar: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerPillarText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 2.6,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
      },
    }),
  },
});
