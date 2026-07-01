import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../ui/UserAvatar';
import { useStoredUser } from '../../../hooks/useStoredUser';
import { fetchUnreadNotificationCount } from '../../../services/registrationApi';
import StudentNotifications from '../StudentNotifications';
import PortalSwitcher from '../../PortalSwitcher';
import { getActivePortalLabel, PORTAL_UPDATED_EVENT, clearActivePortal } from '../../../utils/portalContext';

const StudentHeader = ({ onMenuToggle, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [portalLabel, setPortalLabel] = useState(() => getActivePortalLabel());
  const { user } = useStoredUser();

  const refreshPortalLabel = useCallback(() => {
    setPortalLabel(getActivePortalLabel());
  }, []);

  useEffect(() => {
    window.addEventListener(PORTAL_UPDATED_EVENT, refreshPortalLabel);
    return () => window.removeEventListener(PORTAL_UPDATED_EVENT, refreshPortalLabel);
  }, [refreshPortalLabel]);

  const refreshUnreadCount = useCallback(() => {
    if (!user?.id) return;
    fetchUnreadNotificationCount(user.id)
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
  }, [user?.id]);

  useEffect(() => {
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 30000);
    const onUpdated = () => refreshUnreadCount();
    window.addEventListener('campuslink:notifications-updated', onUpdated);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('campuslink:notifications-updated', onUpdated);
    };
  }, [refreshUnreadCount]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    clearActivePortal();
    navigate('/login');
    setAnchorEl(null);
  };

  return (
    <header className="student-portal__header">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{ display: { md: sidebarCollapsed ? 'inline-flex' : 'none', xs: 'inline-flex' } }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: { xs: 'flex', md: sidebarCollapsed ? 'flex' : 'none' }, alignItems: 'center', gap: 1 }}>
          <SchoolOutlinedIcon sx={{ color: '#2563eb' }} />
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            CampusLink+
          </Typography>
        </Box>
      </Box>

      <Box className="portal-header__toolbar">
        <PortalSwitcher />
        <IconButton
          className="portal-header__notify"
          aria-label="Notifications"
          onClick={() => setNotificationsOpen(true)}
          sx={{
            bgcolor: unreadCount ? 'rgba(254, 226, 226, 0.5)' : 'transparent',
            border: unreadCount ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid transparent',
          }}
        >
          <Badge badgeContent={unreadCount || null} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        <StudentNotifications
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          onUpdated={refreshUnreadCount}
        />

        <Box
          className="portal-header__profile"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <UserAvatar avatarIndex={user.avatarIndex} size={36} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.2 }}>
              {user.fullName || 'Student'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, letterSpacing: '0.04em' }}>
              {portalLabel}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              mt: 1,
              border: '1px solid rgba(37, 99, 235, 0.1)',
              boxShadow: '0 12px 32px rgba(37, 99, 235, 0.12)',
            },
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
            <PersonOutlineOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: '#2563eb' }} />
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: '#dc2626' }} />
            <Typography sx={{ color: '#dc2626', fontWeight: 600 }}>Log Out</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </header>
  );
};

export default StudentHeader;
