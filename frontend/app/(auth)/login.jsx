import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, RADII, SHADOWS } from '../../lib/theme';
import { useAuth } from '../../lib/authContext';
import PageTransition from '../../components/PageTransition';
import { useTransitionManager } from '../../components/TransitionManager';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, signInWithGoogle, loginWithGoogle } = useAuth();
  const { navigateWithTransition } = useTransitionManager();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      console.log('[Login] Initiating sign-in for:', trimmedEmail);
      const res = await login(trimmedEmail, password);

      if (!res?.success) {
        setErrorMessage(res?.error || 'Unable to sign in. Please verify your credentials.');
        setLoading(false);
        return;
      }

      setLoading(false);
      if (typeof navigateWithTransition === 'function') {
        navigateWithTransition('/(tabs)', 'grand-entrance');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.warn('[Login] Unexpected error in handleSignIn:', err);
      setLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred during sign-in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const googleAuth = signInWithGoogle || loginWithGoogle;
      if (typeof googleAuth !== 'function') {
        throw new Error('Google sign-in service is currently initializing. Please try again.');
      }
      const res = await googleAuth();
      if (res?.error) {
        setErrorMessage(
          typeof res.error === 'string'
            ? res.error
            : res.error.message || 'Google sign-in could not be completed.'
        );
      } else if (res?.success) {
        if (!res.redirecting) {
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred with Google sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSocialNotice = (provider) => {
    const message = `${provider} authentication is coming soon. Please use email or Google for instant access.`;
    if (Platform.OS === 'web') {
      window.alert(`${provider} Sign-In: ${message}`);
    } else {
      Alert.alert(`${provider} Sign-In`, message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <PageTransition variant="login" style={{ flex: 1 }}>
        <StatusBar style="light" />

        {/* Cinematic Sunset Cloudscape Background Layer */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Image
            source={require('../../assets/images/maybewe_clouds_clean.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.16)', 'rgba(0, 0, 0, 0.46)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 32),
            paddingBottom: Math.max(insets.bottom + 20, 32),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Navigation: Back Button & MAYBEWE Pill */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (typeof navigateWithTransition === 'function') {
                navigateWithTransition('/(auth)/welcome', 'page-reveal', 'backward');
              } else if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)/welcome');
              }
            }}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MAYBEWE</Text>
          </View>
        </View>

        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Header Title & Subtitle */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'email' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="rgba(255, 255, 255, 0.80)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@traveler.io"
                  placeholderTextColor="rgba(255, 255, 255, 0.55)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="rgba(255, 255, 255, 0.80)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.55)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
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
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="rgba(255, 255, 255, 0.80)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, (loading || googleLoading) && styles.signInBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading || googleLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signInBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Sign-In (Elena Rostova) */}
            <TouchableOpacity
              style={styles.demoSignInBtn}
              onPress={async () => {
                setLoading(true);
                try {
                  await login('demo@maybewe.io', 'demo1234');
                  setLoading(false);
                  if (typeof navigateWithTransition === 'function') {
                    navigateWithTransition('/(tabs)', 'grand-entrance');
                  } else {
                    router.replace('/(tabs)');
                  }
                } catch (e) {
                  setLoading(false);
                }
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Quick Demo Sign-In"
            >
              <Ionicons name="sparkles" size={14} color="#B99A5E" style={{ marginRight: 6 }} />
              <Text style={styles.demoSignInText}>Quick Demo Sign-In (Verified Explorer)</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Authentication Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={handleGoogleSignIn}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialNotice('Apple')}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <Ionicons name="logo-apple" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer: Create Account Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                if (typeof navigateWithTransition === 'function') {
                  navigateWithTransition('/(auth)/signup', 'soft-slide');
                } else {
                  router.push('/(auth)/signup');
                }
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </PageTransition>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1115',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  brandBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(231, 211, 181, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
      },
      default: {},
    }),
  },
  brandBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#FAF8F3',
    letterSpacing: 2.2,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'stretch',
  },
  headerSection: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 6,
    ...Platform.select({
      web: {
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.55)',
      },
    }),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.90)',
    lineHeight: 20,
    ...Platform.select({
      web: {
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
      },
    }),
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    padding: 26,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.38)',
      },
      default: {
        ...SHADOWS.md,
      },
    }),
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    ...Platform.select({
      web: {
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    height: 50,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      },
    }),
  },
  inputContainerFocused: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.18)',
      },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#FFFFFF',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    ...Platform.select({
      web: {
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.30)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  signInBtn: {
    backgroundColor: '#171817',
    height: 50,
    borderRadius: RADII.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.40)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      },
      default: {},
    }),
  },
  signInBtnDisabled: {
    opacity: 0.65,
  },
  signInBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  demoSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(242, 209, 132, 0.15)',
    borderWidth: 1.2,
    borderColor: 'rgba(242, 209, 132, 0.50)',
    marginBottom: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
        transition: 'background-color 0.2s ease, transform 0.15s ease, border-color 0.2s ease',
      },
      default: {},
    }),
  },
  demoSignInText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FAF8F3',
    letterSpacing: 0.1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dividerText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.70)',
    letterSpacing: 1.4,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        transition: 'background-color 0.2s ease, transform 0.15s ease, border-color 0.2s ease',
      },
      default: {},
    }),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    ...Platform.select({
      web: {
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  createAccountText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    ...Platform.select({
      web: {
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
      },
    }),
  },
});
