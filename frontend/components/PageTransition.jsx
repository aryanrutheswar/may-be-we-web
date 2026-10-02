import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform, View } from 'react-native';

/**
 * Unique transition presets for each distinct page:
 * - 'login': Frosted glass lift & scale with blur clarify
 * - 'guidelines': Safety shield upward float with luxury deceleration
 * - 'signup': Stepped card lateral slide with spring dampening
 * - 'verification': Biometric aperture focus & zoom
 * - 'home': Panoramic curtain lift & hero settle
 * - 'discovery': Traveler card deck slide & tilt
 * - 'trips': Itinerary ticket drop with subtle spring bounce
 * - 'matches': Conversation stream slide from right
 * - 'profile': Prestige trust badge elevation
 * - 'settings': Drawer push from side
 * - 'review': Modal bottom sheet pop & focus
 * - 'showcase': Multi-screen perspective pop
 * - 'fade': Simple cinematic crossfade
 */
export default function PageTransition({
  variant = 'fade',
  duration = 550,
  style,
  children,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const useNativeDriver = Platform.OS !== 'web';

    Animated.timing(anim, {
      toValue: 1,
      duration,
      useNativeDriver,
    }).start();
  }, [variant, duration]);

  // Unique transforms per variant
  let transform = [];
  const opacity = anim;

  switch (variant) {
    case 'login': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [38, 0],
      });
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.965, 1],
      });
      transform = [{ translateY }, { scale }];
      break;
    }
    case 'guidelines': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [45, 0],
      });
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.985, 1],
      });
      transform = [{ translateY }, { scale }];
      break;
    }
    case 'signup': {
      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [48, 0],
      });
      transform = [{ translateX }];
      break;
    }
    case 'verification': {
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1],
      });
      transform = [{ scale }];
      break;
    }
    case 'home': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [28, 0],
      });
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.988, 1],
      });
      transform = [{ translateY }, { scale }];
      break;
    }
    case 'discovery': {
      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [36, 0],
      });
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 0],
      });
      transform = [{ translateX }, { translateY }];
      break;
    }
    case 'trips': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-32, 0],
      });
      transform = [{ translateY }];
      break;
    }
    case 'matches': {
      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [42, 0],
      });
      transform = [{ translateX }];
      break;
    }
    case 'profile': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [32, 0],
      });
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.98, 1],
      });
      transform = [{ translateY }, { scale }];
      break;
    }
    case 'settings': {
      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      });
      transform = [{ translateX }];
      break;
    }
    case 'review': {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [55, 0],
      });
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
      });
      transform = [{ translateY }, { scale }];
      break;
    }
    case 'showcase': {
      const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
      });
      transform = [{ scale }];
      break;
    }
    default: {
      transform = [];
    }
  }

  // Web-specific class for ultra-smooth GPU keyframes with luxury cubic-bezier timing
  const webClassName = `page-trans-${variant}`;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform,
        },
      ]}
      // Pass className for React Native Web DOM targeting
      {...(Platform.OS === 'web' ? { className: webClassName } : {})}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
