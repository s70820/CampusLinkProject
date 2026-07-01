import React from 'react';

/** CSS-only rotating glass sphere — no JS animation */
function AuthGlassSphere() {
  return (
    <div className="auth-sphere-wrap" aria-hidden>
      <div className="auth-sphere-glow" />
      <div className="auth-sphere">
        <div className="auth-sphere-surface" />
        <div className="auth-sphere-rotate" />
        <div className="auth-sphere-highlight" />
      </div>
    </div>
  );
}

export default AuthGlassSphere;
