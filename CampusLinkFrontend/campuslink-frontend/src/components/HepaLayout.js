import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HepaSidebar from './Hepa/layout/HepaSidebar';
import StudentHeader from './Student/layout/StudentHeader';
import { readStoredUser, sanitizeStoredUser, USER_UPDATED_EVENT } from '../hooks/useStoredUser';
import { getDefaultPortal, getPortalDashboardPath, setActivePortal } from '../utils/portalContext';
import '../styles/StudentPortal.css';

const HepaLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const accountRole = (readStoredUser()?.role || 'STUDENT').toUpperCase();
  const isHepa = accountRole === 'HEPA';

  useEffect(() => {
    if (!isHepa) {
      const portal = getDefaultPortal(accountRole);
      setActivePortal(portal);
      navigate(getPortalDashboardPath(portal), { replace: true });
      return;
    }
    setRoleChecked(true);
  }, [accountRole, isHepa, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const cleaned = sanitizeStoredUser(parsed);
      if (JSON.stringify(cleaned) !== JSON.stringify(parsed)) {
        localStorage.setItem('user', JSON.stringify(cleaned));
        window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!isHepa || !roleChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="student-portal" sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {mobileOpen && (
        <Box
          className="student-portal__overlay"
          onClick={() => setMobileOpen(false)}
          sx={{ display: { md: 'none' } }}
        />
      )}

      <HepaSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box className={`student-portal__main${collapsed ? ' student-portal__main--collapsed' : ''}`}>
        <StudentHeader
          sidebarCollapsed={collapsed}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
        />
        <Box component="main" className="student-portal__content">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default HepaLayout;
