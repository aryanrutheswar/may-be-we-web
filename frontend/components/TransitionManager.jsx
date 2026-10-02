import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter, usePathname, useSegments } from 'expo-router';

// ============================================================================
// TRANSITION CONTEXT & HOOK
// ============================================================================
const TransitionContext = createContext({
  isTransitioning: false,
  variant: 'none',
  direction: 'forward',
  navigateWithTransition: () => {},
});

export const useTransitionManager = () => useContext(TransitionContext);

// Global transition helper (callable outside React tree if needed)
export let triggerRouteTransition = () => {};

// ============================================================================
// ROUTE TRANSITION MATRIX (BASED ON REAL MAYBEWE ROUTES)
// ============================================================================
/**
 * Normalizes route pathname to clean route identifier
 * Examples: '/(tabs)/discovery' -> 'discovery'
 *           '/(tabs)' -> 'home'
 *           '/(auth)/login' -> 'login'
 *           '/chat/123' -> 'chat'
 */
function normalizeRoute(path) {
  if (!path || typeof path !== 'string') return 'home';
  const clean = path.replace(/[?#].*$/, '').trim();
  if (clean === '' || clean === '/' || clean === '/(tabs)' || clean === '/(tabs)/index') return 'home';
  if (clean.includes('discovery')) return 'discovery';
  if (clean.includes('trips')) return 'trips';
  if (clean.includes('matches')) return 'matches';
  if (clean.includes('profile')) return 'profile';
  if (clean.includes('welcome')) return 'welcome';
  if (clean.includes('login')) return 'login';
  if (clean.includes('signup')) return 'signup';
  if (clean.includes('guidelines')) return 'guidelines';
  if (clean.includes('verification')) return 'verification';
  if (clean.includes('theme-selection')) return 'theme-selection';
  if (clean.includes('chat/')) return 'chat';
  if (clean.includes('review/')) return 'review';
  if (clean.includes('settings')) return 'settings';
  if (clean.includes('showcase')) return 'showcase';
  return 'default';
}

/**
 * Determines the cinematic transition variant based on source and destination routes
 */
function getTransitionVariant(fromRoute, toRoute) {
  const from = normalizeRoute(fromRoute);
  const to = normalizeRoute(toRoute);

  // 1. Authentication -> Main Website (Grand Entrance)
  const isAuthSource = ['welcome', 'login', 'signup', 'guidelines', 'verification', 'theme-selection'].includes(from);
  const isMainAppDest = ['home', 'discovery', 'trips', 'matches', 'profile'].includes(to);
  if (isAuthSource && isMainAppDest) {
    return 'grand-entrance';
  }

  // 2. Welcome -> Login / Signup (Cinematic Page Reveal)
  if (from === 'welcome' && (to === 'login' || to === 'signup')) {
    return 'page-reveal';
  }

  // 3. Login <-> Signup (Soft Form Slide)
  if ((from === 'login' && to === 'signup') || (from === 'signup' && to === 'login')) {
    return 'soft-slide';
  }

  // 4. Main Tabs Navigation
  // Home <-> Discovery: Luxury Curtain Sweep
  if ((from === 'home' && to === 'discovery') || (from === 'discovery' && to === 'home')) {
    return 'curtain';
  }

  // Discovery <-> Trips: Romantic Starlight Particle / Light Reveal
  if ((from === 'discovery' && to === 'trips') || (from === 'trips' && to === 'discovery')) {
    return 'particle-light';
  }

  // Trips <-> Matches: Curtain Sweep
  if ((from === 'trips' && to === 'matches') || (from === 'matches' && to === 'trips')) {
    return 'curtain';
  }

  // Matches <-> Profile: Page Reveal
  if ((from === 'matches' && to === 'profile') || (from === 'profile' && to === 'matches')) {
    return 'page-reveal';
  }

  // 5. Deep Views (Chat, Review, Settings): Scale / Zoom Depth Transition
  if (['chat', 'review', 'settings'].includes(to) || ['chat', 'review', 'settings'].includes(from)) {
    return 'scale-zoom';
  }

  // 6. Onboarding steps (Guidelines <-> Verification)
  if (['guidelines', 'verification'].includes(to) || ['guidelines', 'verification'].includes(from)) {
    return 'soft-reveal';
  }

  return 'page-reveal';
}

// ============================================================================
// TRANSITION MANAGER COMPONENT
// ============================================================================
export default function TransitionManager({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'covering' | 'revealing'
  const [currentVariant, setCurrentVariant] = useState('none');
  const [direction, setDirection] = useState('forward'); // 'forward' | 'backward'

  // Route tracking refs
  const prevPathRef = useRef(pathname || '/');
  const isInitialMountRef = useRef(true);
  const historyStackRef = useRef([pathname || '/']);
  const isProgrammaticNavRef = useRef(false);
  const pendingNavRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // Core Transition Orchestrator
  // --------------------------------------------------------------------------
  const executeTransition = useCallback((targetUrl, specifiedVariant = null, navDirection = 'forward') => {
    if (!targetUrl) return;

    const fromPath = typeof prevPathRef.current === 'string' ? prevPathRef.current : '/';
    const toPath = typeof targetUrl === 'string' ? targetUrl : '';

    // EXEMPTION: Welcome screen entry must never be covered
    if (toPath && toPath.includes('welcome')) {
      if (typeof targetUrl === 'string') {
        router.push(targetUrl);
      } else if (typeof targetUrl === 'function') {
        targetUrl();
      }
      return;
    }

    const effectiveVariant = prefersReducedMotion
      ? 'reduced-fade'
      : (specifiedVariant || (toPath ? getTransitionVariant(fromPath, toPath) : 'curtain'));

    setIsTransitioning(true);
    setTransitionState('covering');
    setCurrentVariant(effectiveVariant);
    setDirection(navDirection);
    isProgrammaticNavRef.current = true;

    // Safety timeout: ensure isTransitioning NEVER stays locked forever (max 750ms)
    const safetyTimer = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionState('idle');
      setCurrentVariant('none');
      isProgrammaticNavRef.current = false;
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.body.style.overflow = '';
        const rootEl = document.getElementById('root');
        if (rootEl) rootEl.removeAttribute('data-transitioning');
      }
    }, 750);

    // Lock body scroll temporarily to prevent jitter
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.setAttribute('data-transitioning', 'true');
      }
    }

    // Phase 1: Inward sweep / cover phase (approx 260ms)
    const coverDuration = effectiveVariant === 'reduced-fade' ? 100 : 280;
    const revealDuration = effectiveVariant === 'reduced-fade' ? 120 : 340;

    transitionTimeoutRef.current = setTimeout(() => {
      // Midpoint: Curtain covers viewport -> perform the route change
      try {
        if (typeof targetUrl === 'string') {
          router.push(targetUrl);
        } else if (typeof targetUrl === 'function') {
          targetUrl();
        }
      } catch (err) {
        console.warn('[TransitionManager] Navigation execution warning:', err);
      }

      // Phase 2: Reveal phase -> curtain moves away to reveal new page
      setTransitionState('revealing');

      transitionTimeoutRef.current = setTimeout(() => {
        clearTimeout(safetyTimer);
        // Transition complete
        setIsTransitioning(false);
        setTransitionState('idle');
        setCurrentVariant('none');
        isProgrammaticNavRef.current = false;

        // Restore scroll and trigger staggered page content reveal
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          document.body.style.overflow = '';
          const rootEl = document.getElementById('root');
          if (rootEl) {
            rootEl.removeAttribute('data-transitioning');
            rootEl.setAttribute('data-page-ready', 'true');
            setTimeout(() => rootEl.removeAttribute('data-page-ready'), 600);
          }
        }
      }, revealDuration);
    }, coverDuration);
  }, [prefersReducedMotion, router]);

  // Expose global navigation trigger
  useEffect(() => {
    triggerRouteTransition = (targetUrl, options = {}) => {
      executeTransition(targetUrl, options.variant, options.direction || 'forward');
    };
    if (typeof window !== 'undefined') {
      window.__MAYBEWE_NAVIGATE__ = triggerRouteTransition;
    }
    return () => {
      triggerRouteTransition = () => {};
      if (typeof window !== 'undefined') {
        delete window.__MAYBEWE_NAVIGATE__;
      }
    };
  }, [executeTransition]);

  // --------------------------------------------------------------------------
  // Reactive Listener for Browser Back/Forward or Unintercepted Route Changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    const current = pathname || '/';
    const prev = prevPathRef.current;

    // Skip on first initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevPathRef.current = current;
      return;
    }

    if (current === prev) return;

    // Detect if this change was already triggered by our programmatic 2-phase transition
    if (isProgrammaticNavRef.current) {
      prevPathRef.current = current;
      historyStackRef.current.push(current);
      return;
    }

    // If reached here: user pressed browser Back/Forward or called router directly
    // Determine direction from history stack
    const stack = historyStackRef.current;
    let navDir = 'forward';
    const existingIndex = stack.lastIndexOf(current);
    if (existingIndex !== -1 && existingIndex < stack.length - 1) {
      navDir = 'backward';
      // Pop stack down to this index
      historyStackRef.current = stack.slice(0, existingIndex + 1);
    } else {
      historyStackRef.current.push(current);
    }

    // EXEMPTION: Welcome screen entry
    if (current.includes('welcome')) {
      prevPathRef.current = current;
      return;
    }

    // Play smooth single-phase Reveal Outward transition
    const variant = prefersReducedMotion
      ? 'reduced-fade'
      : getTransitionVariant(prev, current);

    prevPathRef.current = current;
    setIsTransitioning(true);
    setTransitionState('revealing');
    setCurrentVariant(variant);
    setDirection(navDir);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.setAttribute('data-transitioning', 'true');
    }

    const revealTime = prefersReducedMotion ? 120 : 360;
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionState('idle');
      setCurrentVariant('none');

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.body.style.overflow = '';
        const rootEl = document.getElementById('root');
        if (rootEl) {
          rootEl.removeAttribute('data-transitioning');
          rootEl.setAttribute('data-page-ready', 'true');
          setTimeout(() => rootEl.removeAttribute('data-page-ready'), 600);
        }
      }
    }, revealTime);
  }, [pathname, prefersReducedMotion]);

  // --------------------------------------------------------------------------
  // Safe Link Interceptor for Web (Respects External Links & Modifier Keys)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const handleGlobalClick = (e) => {
      // 1. Ignore if modifier keys are pressed (Ctrl/Cmd+click opens new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // 2. Find closest <a> tag
      const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!anchor) return;

      // 3. Ignore explicit target="_blank"
      if (anchor.getAttribute('target') === '_blank') return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      // 4. Verify same origin
      try {
        const url = new URL(rawHref, window.location.origin);
        if (url.origin !== window.location.origin) return; // External link: untouched!

        const targetPath = url.pathname + url.search;
        if (targetPath === window.location.pathname + window.location.search) return;

        // Internal navigation detected -> trigger smooth cinematic transition
        e.preventDefault();
        e.stopPropagation();
        executeTransition(targetPath);
      } catch (err) {
        // Fallback: let standard browser handle it
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [executeTransition]);

  // --------------------------------------------------------------------------
  // Navigation Helper Provided to Context Consumers
  // --------------------------------------------------------------------------
  const navigateWithTransition = useCallback((to, options = {}) => {
    executeTransition(to, options.variant, options.direction || 'forward');
  }, [executeTransition]);

  // Compute CSS classes for the transition overlay
  const overlayClasses = [
    'maybewe-transition-overlay',
    transitionState !== 'idle' ? 'is-active' : '',
    `state-${transitionState}`,
    `variant-${currentVariant}`,
    `dir-${direction}`,
  ].filter(Boolean).join(' ');

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        variant: currentVariant,
        direction,
        navigateWithTransition,
      }}
    >
      {children}

      {/* ================================================================== */}
      {/* CINEMATIC TRANSITION OVERLAY DOM PORTAL                             */}
      {/* ================================================================== */}
      {Platform.OS === 'web' && (
        <div
          id="maybewe-transition-overlay"
          className={overlayClasses}
          aria-hidden={!isTransitioning}
        >
          {/* Variant 1: Curtain Transition (Dual-Layer Champagne & Obsidian Silk) */}
          {currentVariant === 'curtain' && (
            <div className="mw-curtain-container">
              <div className="mw-curtain-accent" />
              <div className="mw-curtain-primary">
                <div className="mw-curtain-brand-glow" />
              </div>
            </div>
          )}

          {/* Variant 2: Page Reveal (Angled Obsidian & Champagne Settle) */}
          {currentVariant === 'page-reveal' && (
            <div className="mw-reveal-container">
              <div className="mw-reveal-panel">
                <div className="mw-reveal-gold-line" />
              </div>
            </div>
          )}

          {/* Variant 3: Romantic Particle & Light Reveal (Champagne Embers & Starlight Bloom) */}
          {currentVariant === 'particle-light' && (
            <div className="mw-particle-container">
              <div className="mw-particle-radial-light" />
              <div className="mw-particle-stars">
                {[...Array(14)].map((_, i) => (
                  <span
                    key={i}
                    className={`mw-star mw-star-${i + 1}`}
                    style={{
                      left: `${(i * 7 + 9) % 92}%`,
                      top: `${(i * 11 + 15) % 80}%`,
                      animationDelay: `${(i * 45)}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="mw-particle-ambient-veil" />
            </div>
          )}

          {/* Variant 4: Soft Reveal (Expanding Radial Mask) */}
          {currentVariant === 'soft-reveal' && (
            <div className="mw-soft-container">
              <div className="mw-soft-mask" />
            </div>
          )}

          {/* Variant 5: Scale / Zoom (Cinematic Depth Transition) */}
          {currentVariant === 'scale-zoom' && (
            <div className="mw-zoom-container">
              <div className="mw-zoom-veil" />
            </div>
          )}

          {/* Variant 6: Grand Entrance (Auth to Main Website Luxury Double Veil) */}
          {currentVariant === 'grand-entrance' && (
            <div className="mw-grand-container">
              <div className="mw-grand-panel-left" />
              <div className="mw-grand-panel-right" />
              <div className="mw-grand-crest">
                <div className="mw-crest-glow" />
                <span className="mw-crest-wordmark">MaybeWe</span>
                <span className="mw-crest-subtitle">MEET SOMEONE &bull; GO SOMEWHERE</span>
              </div>
            </div>
          )}

          {/* Variant 7: Soft Lateral Form Slide (Login <-> Signup) */}
          {currentVariant === 'soft-slide' && (
            <div className="mw-slide-container">
              <div className="mw-slide-veil" />
            </div>
          )}

          {/* Fallback Reduced Motion Crossfade */}
          {currentVariant === 'reduced-fade' && (
            <div className="mw-reduced-veil" />
          )}
        </div>
      )}
    </TransitionContext.Provider>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
