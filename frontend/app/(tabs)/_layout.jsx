import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RADII, SHADOWS, FONTS } from '../../lib/theme';
import { useTheme } from '../../lib/themeContext';
import { useTransitionManager } from '../../components/TransitionManager';

const TABS = [
  { name: 'index', label: 'Home', iconFocused: 'compass', iconBlur: 'compass-outline' },
  { name: 'discovery', label: 'Discover', iconFocused: 'sparkles', iconBlur: 'sparkles-outline' },
  { name: 'matches', label: 'Chat', iconFocused: 'chatbubbles', iconBlur: 'chatbubbles-outline' },
  { name: 'trips', label: 'Trips', iconFocused: 'briefcase', iconBlur: 'briefcase-outline' },
  { name: 'profile', label: 'Profile', iconFocused: 'person', iconBlur: 'person-outline' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { navigateWithTransition } = useTransitionManager();

  if (isDesktop) {
    return (
      <View style={styles.desktopTopNavWrapper}>
        <View style={styles.desktopTopNavInner}>
          {/* Brand Wordmark & Tag */}
          <TouchableOpacity
            style={styles.desktopBrandCol}
            onPress={() => {
              if (state.index !== 0) {
                navigateWithTransition('/(tabs)');
              }
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="MaybeWe Home"
          >
            <Text style={styles.desktopBrandWordmark}>MaybeWe</Text>
            <View style={styles.desktopBrandBadge}>
              <View style={styles.champagneActiveDot} />
              <Text style={styles.desktopBrandBadgeText}>SOLO TRAVEL</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Navigation Links */}
          <View style={styles.desktopNavLinksRow}>
            {state.routes.map((route, index) => {
              const tab = TABS.find((t) => t.name === route.name) || {
                label: route.name,
                iconFocused: 'ellipse',
                iconBlur: 'ellipse-outline',
              };
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
                  navigateWithTransition(targetPath);
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  activeOpacity={0.8}
                  style={[
                    styles.desktopNavItem,
                    isFocused && styles.desktopNavItemActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={tab.label}
                >
                  <Ionicons
                    name={isFocused ? tab.iconFocused : tab.iconBlur}
                    size={16}
                    color={isFocused ? '#171817' : '#77766F'}
                  />
                  <Text
                    style={[
                      styles.desktopNavLabel,
                      isFocused && styles.desktopNavLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isFocused && <View style={styles.desktopActiveIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // Mobile Floating Bottom Tab Bar
  return (
    <View
      style={[
        styles.floatingWrapper,
        { bottom: Math.max(insets.bottom, 12) + 6 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name) || {
            label: route.name,
            iconFocused: 'ellipse',
            iconBlur: 'ellipse-outline',
          };
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
              navigateWithTransition(targetPath);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              {isFocused ? (
                <View style={styles.activePill}>
                  <View style={styles.champagneActiveDot} />
                  <Ionicons name={tab.iconFocused} size={15} color="#FAF8F3" />
                  <Text style={styles.activeLabel}>{tab.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveItem}>
                  <Ionicons name={tab.iconBlur} size={18} color="#918E87" />
                  <Text style={styles.inactiveLabel}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarPosition: isDesktop ? 'top' : 'bottom',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="discovery" options={{ title: 'Discover' }} />
      <Tabs.Screen name="matches" options={{ title: 'Chat' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Desktop Top Navigation
  desktopTopNavWrapper: {
    width: '100%',
    backgroundColor: 'rgba(251, 250, 247, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE5DA',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 2px 10px rgba(23, 24, 23, 0.04)',
      },
      default: {},
    }),
  },
  desktopTopNavInner: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  desktopBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopBrandWordmark: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#171817',
    letterSpacing: -0.5,
  },
  desktopBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    backgroundColor: '#F5EEE5',
    borderWidth: 1,
    borderColor: '#EDE5DA',
  },
  desktopBrandBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#B99A5E',
    letterSpacing: 1.2,
  },
  desktopNavLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  desktopNavItemActive: {
    backgroundColor: '#F5EEE5',
    borderColor: '#EDE5DA',
  },
  desktopNavLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#77766F',
  },
  desktopNavLabelActive: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#171817',
  },
  desktopActiveIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '30%',
    right: '30%',
    height: 2,
    backgroundColor: '#B99A5E',
    borderRadius: 1,
  },

  // Mobile Bottom Navigation
  floatingWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: RADII.xl,
    paddingVertical: 6,
    paddingHorizontal: 6,
    width: '100%',
    maxWidth: 450,
    borderWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171817', // Deep Charcoal active surface
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(29, 29, 27, 0.22)',
      },
      ios: {
        shadowColor: '#1D1D1B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  champagneActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E7D3B5', // Champagne active indicator
  },
  activeLabel: {
    color: '#FAF8F3', // Soft pearl text
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  inactiveLabel: {
    color: '#918E87', // Warm grey
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
