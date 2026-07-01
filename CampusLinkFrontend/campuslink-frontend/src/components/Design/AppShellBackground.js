import React from 'react';
import AuthBackgroundDecor from './AuthBackgroundDecor';

const AppShellBackground = ({ children, className = '' }) => (
  <div className={`app-shell ${className}`.trim()}>
    <AuthBackgroundDecor />
    <div className="app-shell__content">{children}</div>
  </div>
);

export default AppShellBackground;
