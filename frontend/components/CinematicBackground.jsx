import React from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * CinematicBackground
 * Universal sunset cloudscape background layer featuring the signature
 * MaybeWe clouds and soft contrast gradient for luxury glassmorphism.
 */
export default function CinematicBackground({
  overlayColors = ['rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.16)', 'rgba(0, 0, 0, 0.46)'],
  style,
}) {
  return (
    <View style={[styles.wrapper, style]} pointerEvents="none">
      <Image
        source={require('../assets/images/maybewe_clouds_clean.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={overlayColors}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#0F1115',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
