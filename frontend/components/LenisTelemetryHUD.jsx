import React, { useState, useEffect } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeLenisScroll, scrollTo, getLenis } from '../lib/lenis';

export default function LenisTelemetryHUD() {
  if (Platform.OS !== 'web') return null;

  const [metrics, setMetrics] = useState({
    progress: 0,
    velocity: 0,
    direction: 1,
    isScrolling: false,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let scrollTimeout = null;

    const unsubscribe = subscribeLenisScroll((e) => {
      setMetrics({
        progress: Math.min(100, Math.max(0, Math.round((e.progress || 0) * 100))),
        velocity: Math.abs(Number(e.velocity || 0)).toFixed(1),
        direction: (e.direction || 1) >= 0 ? 1 : -1,
        isScrolling: true,
      });

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setMetrics((prev) => ({ ...prev, isScrolling: false }));
      }, 200);
    });

    return () => {
      unsubscribe();
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      className="lenis-hud-pill"
      style={{
        position: 'fixed',
        bottom: 22,
        right: 22,
        zIndex: 99999,
        pointerEvents: 'auto',
      }}
      aria-label="Lenis Smooth Scroll Telemetry"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(15, 17, 21, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(231, 211, 181, 0.28)',
          borderRadius: 40,
          padding: '6px 14px 6px 12px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          color: '#FAF8F3',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 11,
          letterSpacing: '0.08em',
          userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Pulsing champagne status dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: metrics.isScrolling ? '#F2D184' : 'rgba(231, 211, 181, 0.55)',
            boxShadow: metrics.isScrolling ? '0 0 10px #F2D184' : 'none',
            display: 'inline-block',
            transition: 'all 0.15s ease',
          }}
        />

        {/* Brand indicator */}
        <span style={{ fontWeight: 700, color: '#FAF8F3', letterSpacing: '0.12em' }}>
          LENIS
        </span>

        <span style={{ opacity: 0.35 }}>|</span>

        {/* Progress % */}
        <span style={{ color: '#E7D3B5', minWidth: 32 }}>
          {metrics.progress}%
        </span>

        {/* Mini progress bar */}
        <div
          style={{
            width: 32,
            height: 3,
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${metrics.progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #D9C8B2, #F2D184)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Expanded metrics */}
        {isExpanded && (
          <>
            <span style={{ opacity: 0.35 }}>|</span>
            <span style={{ color: 'rgba(250, 248, 243, 0.75)' }}>
              VEL {metrics.velocity}
            </span>
            <span style={{ color: '#E7D3B5' }}>
              {metrics.direction > 0 ? '↓' : '↑'}
            </span>
          </>
        )}

        {/* Expand / Minimize toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse telemetry' : 'Expand velocity'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(250, 248, 243, 0.6)',
            cursor: 'pointer',
            padding: '2px 4px',
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isExpanded ? '−' : '+'}
        </button>

        {/* Smooth scroll to top button */}
        {metrics.progress > 5 && (
          <button
            onClick={() => scrollTo(0)}
            title="Smooth scroll to top"
            style={{
              background: 'rgba(231, 211, 181, 0.15)',
              border: '1px solid rgba(231, 211, 181, 0.3)',
              borderRadius: 20,
              color: '#F2D184',
              cursor: 'pointer',
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              marginLeft: 2,
              transition: 'background 0.15s ease',
            }}
          >
            TOP ↑
          </button>
        )}
      </div>
    </aside>
  );
}
