import React, { useEffect, useRef } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransitionManager } from './TransitionManager';
import { scrollTo } from '../lib/lenis';

export default function LenisEditorialExperience({ onExplore, onSignIn, onSignUp }) {
  const router = useRouter();
  const { navigateWithTransition } = useTransitionManager();
  const sectionRef = useRef(null);

  const handleNav = (route) => {
    if (typeof navigateWithTransition === 'function') {
      navigateWithTransition(route);
    } else {
      router.push(route);
    }
  };

  // Setup IntersectionObserver for smooth scroll-triggered reveals on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.lenis-scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section ref={sectionRef} className="lenis-editorial-root" style={styles.rootSection}>
      {/* ============================================================ */}
      {/* 1. EDITORIAL DRIFTING MARQUEE (TRACK 1 — LEFT)               */}
      {/* ============================================================ */}
      <div className="lenis-marquee" style={styles.marqueeWrapper}>
        <div className="lenis-marquee-inner">
          {[...Array(2)].map((_, loopIdx) => (
            <div key={loopIdx} style={styles.marqueeContent}>
              <span style={styles.marqueeText}>MEET SOMEONE</span>
              <span style={styles.marqueeDot}>✦</span>
              <span style={styles.marqueeText}>GO SOMEWHERE</span>
              <span style={styles.marqueeDot}>✦</span>
              <span style={styles.marqueeText}>CHERRY BLOSSOM DREAMS</span>
              <span style={styles.marqueeDot}>✦</span>
              <span style={styles.marqueeText}>SWAN LAKE REFLECTIONS</span>
              <span style={styles.marqueeDot}>✦</span>
              <span style={styles.marqueeText}>LENIS INERTIA DRIFT</span>
              <span style={styles.marqueeDot}>✦</span>
              <span style={styles.marqueeText}>MOONLIGHT & LAVENDER</span>
              <span style={styles.marqueeDot}>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OVERSIZED EDITORIAL HERO HEADLINE                         */}
      {/* ============================================================ */}
      <div style={styles.editorialHeaderContainer} className="lenis-scroll-reveal">
        <div style={styles.metaRow}>
          <span className="lenis-mono-badge" style={styles.metaBadge}>
            01 / MANIFESTO
          </span>
          <span className="lenis-mono-badge" style={styles.metaBadgeRight}>
            SOLO TRAVEL &bull; CURATED MATCHING
          </span>
        </div>

        <h2 className="lenis-display-hero" style={styles.oversizedTitle}>
          BUILT FOR <br />
          <span style={styles.goldGradientText}>THE WANDERER</span>
        </h2>

        <p className="lenis-display-sub" style={styles.editorialLead}>
          Traveling alone should never mean feeling isolated. MaybeWe bridges the gap between 
          independent freedom and genuine companionship—cradled in fluid typography, vintage soul, 
          and butter-smooth inertia.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 3. THREE-COLUMN EDITORIAL MANIFESTO PILLARS                 */}
      {/* ============================================================ */}
      <div style={styles.pillarsGrid}>
        {/* Pillar 1 */}
        <div className="lenis-scroll-reveal lenis-editorial-card lenis-delay-1" style={styles.pillarCard}>
          <div style={styles.pillarTop}>
            <span className="lenis-mono-badge" style={styles.pillarNumber}>01</span>
            <Ionicons name="sparkles-outline" size={20} color="#F2D184" />
          </div>
          <h3 style={styles.pillarTitle}>Curated Chemistry</h3>
          <p style={styles.pillarDesc}>
            Discover solo travelers aligned with your itinerary, pace, and passions. 
            From serene temple walks to sunrise treks, find someone who shares your rhythm.
          </p>
          <div style={styles.pillarTagsRow}>
            <span style={styles.pillarTag}>KYOTO CHERRY BLOSSOM</span>
            <span style={styles.pillarTag}>SWAN REFLECTIONS</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="lenis-scroll-reveal lenis-editorial-card lenis-delay-2" style={styles.pillarCard}>
          <div style={styles.pillarTop}>
            <span className="lenis-mono-badge" style={styles.pillarNumber}>02</span>
            <Ionicons name="infinite-outline" size={20} color="#E7D3B5" />
          </div>
          <h3 style={styles.pillarTitle}>Liquid Motion</h3>
          <p style={styles.pillarDesc}>
            Powered by Lenis smooth scrolling. Experience weighted inertia, momentum damping, 
            and zero-jitter page transitions that feel like fine editorial magazine silk.
          </p>
          <div style={styles.pillarTagsRow}>
            <span style={styles.pillarTag}>60FPS INERTIA</span>
            <span style={styles.pillarTag}>NATIVE SCROLL SYNC</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="lenis-scroll-reveal lenis-editorial-card lenis-delay-3" style={styles.pillarCard}>
          <div style={styles.pillarTop}>
            <span className="lenis-mono-badge" style={styles.pillarNumber}>03</span>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FAF8F3" />
          </div>
          <h3 style={styles.pillarTitle}>Verified & Vintage</h3>
          <p style={styles.pillarDesc}>
            Every traveler is photo-verified for peaceful confidence. Designed in timeless 
            warm champagne pearl, moonlight lavender, and deep charcoal.
          </p>
          <div style={styles.pillarTagsRow}>
            <span style={styles.pillarTag}>COMMUNITY TRUST</span>
            <span style={styles.pillarTag}>SAFETY VAULT</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. EDITORIAL DRIFTING MARQUEE (TRACK 2 — REVERSE RIGHT)      */}
      {/* ============================================================ */}
      <div className="lenis-marquee" style={styles.marqueeWrapperReverse}>
        <div className="lenis-marquee-inner" style={{ animationDirection: 'reverse' }}>
          {[...Array(2)].map((_, loopIdx) => (
            <div key={loopIdx} style={styles.marqueeContent}>
              <span style={styles.marqueeTextAlt}>HIMALAYAS VALLEY MIST</span>
              <span style={styles.marqueeDotAlt}>✦</span>
              <span style={styles.marqueeTextAlt}>PARISIAN SUNSET WINE</span>
              <span style={styles.marqueeDotAlt}>✦</span>
              <span style={styles.marqueeTextAlt}>GOA PALM SERENITY</span>
              <span style={styles.marqueeDotAlt}>✦</span>
              <span style={styles.marqueeTextAlt}>LAVENDER DREAMS</span>
              <span style={styles.marqueeDotAlt}>✦</span>
              <span style={styles.marqueeTextAlt}>MAYBEWE &bull; 2026</span>
              <span style={styles.marqueeDotAlt}>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. EDITORIAL SHOWCASE VIGNETTE CARDS                         */}
      {/* ============================================================ */}
      <div style={styles.vignettesContainer} className="lenis-scroll-reveal">
        <div style={styles.vignetteHeader}>
          <span className="lenis-mono-badge" style={{ color: '#B99A5E' }}>02 / CURATED EXPEDITIONS</span>
          <h3 style={styles.vignetteTitle}>DESTINATIONS CALLING</h3>
        </div>

        <div style={styles.vignettesGrid}>
          {/* Card 1 */}
          <div className="lenis-editorial-card" style={styles.vignetteCard}>
            <div style={styles.vignetteMedia}>
              <img
                src="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80"
                alt="Kashmir Valley"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80'; }}
                style={styles.vignetteImg}
              />
              <div style={styles.vignetteOverlay} />
              <span style={styles.vignetteTag}>KASHMIR &bull; DAL LAKE</span>
            </div>
            <div style={styles.vignetteBody}>
              <h4 style={styles.vignetteName}>Misty Waterways & Shikaras</h4>
              <p style={styles.vignetteExcerpt}>Quiet mornings on lotus waters under snow-dusted peaks.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="lenis-editorial-card" style={styles.vignetteCard}>
            <div style={styles.vignetteMedia}>
              <img
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
                alt="Kerala Backwaters"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80'; }}
                style={styles.vignetteImg}
              />
              <div style={styles.vignetteOverlay} />
              <span style={styles.vignetteTag}>KERALA &bull; EMERALD DRIFT</span>
            </div>
            <div style={styles.vignetteBody}>
              <h4 style={styles.vignetteName}>Palm Shadows & Twilight Houseboats</h4>
              <p style={styles.vignetteExcerpt}>Slow coconut coastlines and warm Arabian spice breezes.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="lenis-editorial-card" style={styles.vignetteCard}>
            <div style={styles.vignetteMedia}>
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
                alt="Goa Coastline"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'; }}
                style={styles.vignetteImg}
              />
              <div style={styles.vignetteOverlay} />
              <span style={styles.vignetteTag}>GOA &bull; GOLDEN TIDES</span>
            </div>
            <div style={styles.vignetteBody}>
              <h4 style={styles.vignetteName}>Portuguese Mansions & Coastal Sunsets</h4>
              <p style={styles.vignetteExcerpt}>Acoustic guitar by the surf and vintage cafe storytelling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. CALL TO ACTION & FOOTER BANNER                           */}
      {/* ============================================================ */}
      <div style={styles.footerCTAContainer} className="lenis-scroll-reveal">
        <span className="lenis-mono-badge" style={{ color: '#E7D3B5' }}>
          03 / STEP INSIDE
        </span>

        <h3 style={styles.footerCTATitle}>
          YOUR NEXT EXPEDITION <br />
          <span style={{ color: '#F2D184' }}>AWAITS COMPANIONSHIP</span>
        </h3>

        <div style={styles.actionButtonsRow}>
          <button
            onClick={() => {
              if (typeof onExplore === 'function') onExplore();
              else handleNav('/(tabs)');
            }}
            style={styles.primaryActionButton}
          >
            <span style={styles.primaryActionText}>Explore Demo (Instant Access)</span>
            <Ionicons name="arrow-forward" size={16} color="#171817" style={{ marginLeft: 8 }} />
          </button>

          <button
            onClick={() => {
              if (typeof onSignUp === 'function') onSignUp();
              else handleNav('/(auth)/signup');
            }}
            style={styles.secondaryActionButton}
          >
            Create Account
          </button>

          <button
            onClick={() => {
              if (typeof onSignIn === 'function') onSignIn();
              else handleNav('/(auth)/login');
            }}
            style={styles.tertiaryActionButton}
          >
            Sign In
          </button>
        </div>

        {/* Big editorial brand signature */}
        <div style={styles.giantBrandFooter}>
          <span style={styles.giantBrandText}>MAYBEWE</span>
          <div style={styles.footerColophon}>
            <span>&copy; 2026 MAYBEWE &bull; DARKROOM LENIS SMOOTH DRIFT</span>
            <button
              onClick={() => scrollTo(0)}
              style={styles.backToTopBtn}
            >
              RETURN TO TOP ↑
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  rootSection: {
    width: '100%',
    backgroundColor: '#0F1115',
    color: '#FAF8F3',
    paddingTop: '60px',
    paddingBottom: '80px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 15,
  },

  marqueeWrapper: {
    padding: '16px 0',
    backgroundColor: 'rgba(23, 24, 23, 0.65)',
  },
  marqueeWrapperReverse: {
    padding: '16px 0',
    backgroundColor: 'rgba(23, 24, 23, 0.65)',
    margin: '40px 0',
  },
  marqueeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    paddingRight: '32px',
  },
  marqueeText: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    color: '#EFDCCC',
  },
  marqueeTextAlt: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#D9C8B2',
  },
  marqueeDot: {
    color: '#F2D184',
    fontSize: '16px',
  },
  marqueeDotAlt: {
    color: '#B99A5E',
    fontSize: '14px',
  },

  editorialHeaderContainer: {
    maxWidth: '1160px',
    margin: '0 auto',
    padding: '80px 24px 40px 24px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    borderBottom: '1px solid rgba(231, 211, 181, 0.16)',
    paddingBottom: '14px',
  },
  metaBadge: {
    color: '#F2D184',
  },
  metaBadgeRight: {
    color: 'rgba(250, 248, 243, 0.55)',
  },
  oversizedTitle: {
    margin: '0 0 24px 0',
    color: '#FAF8F3',
  },
  goldGradientText: {
    background: 'linear-gradient(90deg, #FAF8F3, #F2D184, #D9C8B2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  editorialLead: {
    color: 'rgba(250, 248, 243, 0.78)',
    maxWidth: '720px',
    margin: 0,
  },

  pillarsGrid: {
    maxWidth: '1160px',
    margin: '40px auto 0 auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  pillarCard: {
    background: 'rgba(23, 24, 23, 0.75)',
    border: '1px solid rgba(231, 211, 181, 0.18)',
    borderRadius: '16px',
    padding: '32px 28px',
    backdropFilter: 'blur(16px)',
  },
  pillarTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  pillarNumber: {
    color: '#B99A5E',
    fontSize: '12px',
  },
  pillarTitle: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '22px',
    fontWeight: '700',
    color: '#FAF8F3',
    margin: '0 0 12px 0',
  },
  pillarDesc: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'rgba(250, 248, 243, 0.72)',
    margin: '0 0 20px 0',
  },
  pillarTagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pillarTag: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    color: '#E7D3B5',
    background: 'rgba(231, 211, 181, 0.08)',
    border: '1px solid rgba(231, 211, 181, 0.2)',
    padding: '4px 10px',
    borderRadius: '30px',
  },

  vignettesContainer: {
    maxWidth: '1160px',
    margin: '40px auto 0 auto',
    padding: '0 24px',
  },
  vignetteHeader: {
    marginBottom: '28px',
  },
  vignetteTitle: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#FAF8F3',
    margin: '8px 0 0 0',
  },
  vignettesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  vignetteCard: {
    background: '#14161B',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(231, 211, 181, 0.16)',
  },
  vignetteMedia: {
    height: '240px',
    position: 'relative',
    backgroundColor: '#0F1115',
    overflow: 'hidden',
  },
  vignetteImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vignetteOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(20, 22, 27, 0.95) 0%, rgba(20, 22, 27, 0.2) 60%, transparent 100%)',
  },
  vignetteTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    fontFamily: 'ui-monospace, monospace',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#FAF8F3',
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '4px 10px',
  },
  vignetteBody: {
    padding: '20px',
  },
  vignetteName: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '18px',
    fontWeight: '700',
    color: '#FAF8F3',
    margin: '0 0 8px 0',
  },
  vignetteExcerpt: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'rgba(250, 248, 243, 0.65)',
    margin: 0,
  },

  footerCTAContainer: {
    maxWidth: '1160px',
    margin: '100px auto 0 auto',
    padding: '0 24px',
    textAlign: 'center',
  },
  footerCTATitle: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    lineHeight: '1.05',
    color: '#FAF8F3',
    margin: '16px 0 32px 0',
  },
  actionButtonsRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '60px',
  },
  primaryActionButton: {
    background: '#FAF8F3',
    color: '#171817',
    border: 'none',
    borderRadius: '50px',
    padding: '14px 28px',
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(250, 248, 243, 0.15)',
    transition: 'transform 0.15s ease',
  },
  primaryActionText: {
    color: '#171817',
  },
  secondaryActionButton: {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#FAF8F3',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '50px',
    padding: '14px 28px',
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  tertiaryActionButton: {
    background: 'transparent',
    color: '#D9C8B2',
    border: '1px solid rgba(217, 200, 178, 0.25)',
    borderRadius: '50px',
    padding: '14px 26px',
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  giantBrandFooter: {
    borderTop: '1px solid rgba(231, 211, 181, 0.14)',
    paddingTop: '40px',
  },
  giantBrandText: {
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: 'clamp(3.5rem, 16vw, 14rem)',
    fontWeight: '900',
    letterSpacing: '-0.05em',
    lineHeight: '0.82',
    color: 'rgba(231, 211, 181, 0.08)',
    display: 'block',
    userSelect: 'none',
  },
  footerColophon: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '24px',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '11px',
    color: 'rgba(250, 248, 243, 0.4)',
  },
  backToTopBtn: {
    background: 'transparent',
    border: 'none',
    color: '#F2D184',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    padding: 0,
  },
};
