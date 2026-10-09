import { useEffect } from 'react';
import { Platform } from 'react-native';
import Lenis from 'lenis';

let lenisInstance = null;
const scrollListeners = new Set();

/**
 * Returns the currently active Lenis instance, or null if uninitialized/non-web.
 */
export function getLenis() {
  return lenisInstance;
}

/**
 * Subscribes a listener to Lenis scroll events.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeLenisScroll(callback) {
  if (typeof callback !== 'function') return () => {};
  scrollListeners.add(callback);
  return () => {
    scrollListeners.delete(callback);
  };
}

/**
 * React hook to listen to real-time Lenis scroll metrics.
 */
export function useLenisScroll(callback) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !callback) return;
    return subscribeLenisScroll(callback);
  }, [callback]);
}

/**
 * Initializes Lenis smooth scrolling for Web only.
 * Implements a strict singleton pattern to prevent duplicate instances or memory leaks.
 */
export function initLenis(customOptions = {}) {
  // Web-only guard: prevent initialization on native platforms or during SSR
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  // Prevent duplicate instances
  if (lenisInstance) {
    return lenisInstance;
  }

  try {
    const isReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lenisInstance = new Lenis({
      autoRaf: true,
      autoToggle: true,
      smoothWheel: !isReducedMotion,
      syncTouch: false, // Maintain native touch responsiveness on touchscreens
      allowNestedScroll: true, // Allow native scrolling for inner ScrollViews and modals
      stopInertiaOnNavigate: true, // Cleanly stop inertia when navigating
      respectReducedMotion: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...customOptions,
    });

    // Notify registered listeners on each Lenis scroll step
    lenisInstance.on('scroll', (event) => {
      scrollListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.warn('[Lenis] Listener error:', err);
        }
      });
    });

    // Expose on window for TransitionManager and debugging
    window.__lenis = lenisInstance;

    return lenisInstance;
  } catch (error) {
    console.warn('[Lenis] Could not initialize smooth scroll:', error);
    return null;
  }
}

/**
 * Cleanly destroys the Lenis instance and unregisters all event listeners.
 */
export function destroyLenis() {
  if (lenisInstance) {
    try {
      lenisInstance.destroy();
    } catch (e) {
      console.warn('[Lenis] Destruction cleanup warning:', e);
    }
    lenisInstance = null;
    scrollListeners.clear();
    if (typeof window !== 'undefined' && window.__lenis) {
      delete window.__lenis;
    }
  }
}

/**
 * Pause Lenis scrolling (e.g. during cinematic transitions or open modals)
 */
export function stopLenis() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
}

/**
 * Resume Lenis scrolling
 */
export function startLenis() {
  if (lenisInstance) {
    lenisInstance.start();
  }
}

/**
 * Scroll smoothly or immediately to a target (y position, element, or selector)
 */
export function scrollTo(target, options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'number') {
      window.scrollTo({
        top: target,
        behavior: options.immediate ? 'auto' : 'smooth',
      });
    }
  }
}

export default {
  getLenis,
  initLenis,
  destroyLenis,
  stopLenis,
  startLenis,
  scrollTo,
  subscribeLenisScroll,
  useLenisScroll,
};
