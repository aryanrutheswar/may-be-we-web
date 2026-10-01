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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, RADII, SHADOWS } from '../../lib/theme';
import { useAuth } from '../../lib/authContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, signInWithGoogle, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      router.replace('/(tabs)');
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
      <StatusBar style="dark" />

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
              if (router.canGoBack()) {
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
            <Ionicons name="arrow-back" size={18} color="#171817" />
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
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#A8A49C"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@traveler.io"
                  placeholderTextColor="#A8A49C"
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#A8A49C"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Your password"
                  placeholderTextColor="#A8A49C"
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
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#8E8B83"
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
                  <ActivityIndicator size="small" color="#171817" />
                ) : (
                  <Ionicons name="logo-google" size={18} color="#171817" />
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
                <Ionicons name="logo-apple" size={19} color="#171817" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer: Create Account Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  brandBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7D3B5',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },
  brandBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#A88B52',
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
    color: '#171817',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#77756F',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDE7DE',
    padding: 26,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 30px rgba(23, 24, 23, 0.04)',
      },
      default: {},
    }),
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#171817',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE5DC',
    height: 50,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#171817',
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
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#77756F',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  signInBtn: {
    backgroundColor: '#171817',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(23, 24, 23, 0.15)',
        cursor: 'pointer',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDE7DE',
  },
  dividerText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#A09D96',
    letterSpacing: 1.2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7DE',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
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
    color: '#77756F',
  },
  createAccountText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#171817',
  },
});
