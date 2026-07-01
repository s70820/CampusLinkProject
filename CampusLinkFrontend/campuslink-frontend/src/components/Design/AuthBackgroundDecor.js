import React from 'react';

const PARTICLES = [
  { left: '8%', delay: '0s', duration: '14s' },
  { left: '18%', delay: '2s', duration: '18s' },
  { left: '28%', delay: '4s', duration: '16s' },
  { left: '42%', delay: '1s', duration: '20s' },
  { left: '55%', delay: '3s', duration: '15s' },
  { left: '68%', delay: '5s', duration: '17s' },
  { left: '78%', delay: '2.5s', duration: '19s' },
  { left: '88%', delay: '4.5s', duration: '13s' },
  { left: '35%', delay: '6s', duration: '21s' },
  { left: '62%', delay: '7s', duration: '16s' },
  { left: '12%', delay: '8s', duration: '22s' },
  { left: '92%', delay: '1.5s', duration: '18s' },
];

function AuthBackgroundDecor() {
  return (
    <>
      <div className="auth-bg-layer" aria-hidden />
      <div className="auth-bg-mesh" aria-hidden />
      <div className="auth-bg-blob auth-bg-blob--1" aria-hidden />
      <div className="auth-bg-blob auth-bg-blob--2" aria-hidden />
      <div className="auth-bg-blob auth-bg-blob--3" aria-hidden />
      <div className="auth-bg-orb auth-bg-orb--1" aria-hidden />
      <div className="auth-bg-orb auth-bg-orb--2" aria-hidden />
      <div className="auth-bg-orb auth-bg-orb--3" aria-hidden />
      <div className="auth-glass-shape auth-glass-shape--1" aria-hidden />
      <div className="auth-glass-shape auth-glass-shape--2" aria-hidden />
      <div className="auth-glass-shape auth-glass-shape--3" aria-hidden />
      <div className="auth-particles" aria-hidden>
        {PARTICLES.map((p) => (
          <span
            key={`${p.left}-${p.delay}`}
            className="auth-particle"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>
    </>
  );
}

export default AuthBackgroundDecor;
