import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import { sanitizeStoredUser, USER_UPDATED_EVENT } from '../../../hooks/useStoredUser';
import { canSwitchPortal, getAccountRole, setActivePortal } from '../../../utils/portalContext';
import '../../../styles/StudentPortal.css';

const StudentLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const role = getAccountRole();
    if (canSwitchPortal(role)) {
      setActivePortal('student');
    }
  }, []);

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

  return (
    <Box className="student-portal" sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {mobileOpen && (
        <Box
          className="student-portal__overlay"
          onClick={() => setMobileOpen(false)}
          sx={{ display: { md: 'none' } }}
        />
      )}

      <StudentSidebar
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

export default StudentLayout;
