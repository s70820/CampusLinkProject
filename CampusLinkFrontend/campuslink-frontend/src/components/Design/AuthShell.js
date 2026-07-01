import React, { useLayoutEffect, useRef } from 'react';
import { Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import AuthBackgroundDecor from './AuthBackgroundDecor';
import AuthGlassSphere from './AuthGlassSphere';
import { AuthRouteContext } from './AuthRouteContext';
import '../../styles/auth.css';

const taglines = {
  '/login': 'Sign in to your UMT co-curricular portal',
  '/register': 'Join the UMT community — local & international students welcome',
  '/forgot-password': 'Recover access to your CampusLink+ account',
  '/reset-password': 'Set a new password for your account',
};

const ROUTE_ORDER = {
  '/login': 0,
  '/register': 1,
  '/forgot-password': 2,
  '/reset-password': 3,
};

const easeSmooth = [0.32, 0.72, 0, 1];

const contentVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction === 0 ? 0 : direction * 32,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.34, ease: easeSmooth },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction === 0 ? 0 : direction * -22,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  }),
};

const taglineVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeSmooth } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
};

function AuthShell() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const tagline = taglines[location.pathname] || taglines['/login'];

  const prevPathRef = useRef(null);
  const isRouteSwitch = prevPathRef.current !== null && prevPathRef.current !== location.pathname;

  const direction = isRouteSwitch
    ? ((ROUTE_ORDER[location.pathname] ?? 0) - (ROUTE_ORDER[prevPathRef.current] ?? 0) >= 0 ? 1 : -1)
    : 0;

  useLayoutEffect(() => {
    document.body.classList.add('auth-route-active');
    document.documentElement.classList.add('auth-route-active');
    return () => {
      document.body.classList.remove('auth-route-active');
      document.documentElement.classList.remove('auth-route-active');
    };
  }, []);

  useLayoutEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <AuthRouteContext.Provider value={{ isRouteSwitch }}>
      <Box className="auth-page">
        <AuthBackgroundDecor />

        <Box className="auth-scene">
          <header className="auth-brand">
            <div className="auth-brand-badge">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <h1 className="auth-brand-title">CampusLink+</h1>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={location.pathname}
                className="auth-brand-subtitle"
                variants={taglineVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {tagline}
              </motion.p>
            </AnimatePresence>
          </header>

          <Box className="auth-card-stage">
            <motion.div
              className="auth-card-wrapper"
              layout
              animate={{ maxWidth: isRegister ? 640 : 460 }}
              transition={{ layout: { duration: 0.38, ease: easeSmooth } }}
              style={{ width: '100%' }}
            >
              <AuthGlassSphere />
              <motion.div layout className="auth-glass-card">
                <div className="auth-card-content">
                  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                      key={location.pathname}
                      className="auth-card-panel"
                      custom={direction}
                      variants={contentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Outlet />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </Box>
        </Box>
      </Box>
    </AuthRouteContext.Provider>
  );
}

export default AuthShell;
