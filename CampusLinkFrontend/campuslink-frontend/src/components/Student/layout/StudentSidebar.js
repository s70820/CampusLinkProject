import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

export const STUDENT_MENU = [
  { label: 'Dashboard', path: '/student/dashboard', Icon: DashboardOutlinedIcon },
  { label: 'Browse Programmes', path: '/browse', Icon: SearchOutlinedIcon },
  { label: 'My Registrations', path: '/registrations', Icon: ListAltOutlinedIcon },
  { label: 'Attendance', path: '/attendance', Icon: QrCodeScannerOutlinedIcon },
  { label: 'Merit Summary', path: '/student/merit-summary', Icon: EmojiEventsOutlinedIcon },
  { label: 'Certificates', path: '/student/certificates', Icon: CardMembershipOutlinedIcon },
  { label: 'Request Role', path: '/student/request-role', Icon: HowToRegOutlinedIcon },
  { label: 'Profile', path: '/profile', Icon: PersonOutlineOutlinedIcon },
];

const StudentSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onMobileClose?.();
  };

  const sidebarClass = [
    'student-portal__sidebar',
    collapsed ? 'student-portal__sidebar--collapsed' : '',
    mobileOpen ? 'student-portal__sidebar--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClass}>
      <Box className="student-portal__sidebar-brand" sx={{ justifyContent: collapsed ? 'center' : 'space-between', px: collapsed ? 1 : 2 }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
            >
              <SchoolOutlinedIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', lineHeight: 1.1 }}>
                CampusLink+
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.06em' }}>
                STUDENT PORTAL
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <nav className="student-portal__sidebar-nav">
        {STUDENT_MENU.map(({ label, path, Icon }) => {
          const active = location.pathname === path;
          const item = (
            <button
              key={path}
              type="button"
              className={`student-portal__nav-item${active ? ' student-portal__nav-item--active' : ''}`}
              onClick={() => handleNav(path)}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <Icon sx={{ fontSize: 22, flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </button>
          );

          return collapsed ? (
            <Tooltip key={path} title={label} placement="right">
              {item}
            </Tooltip>
          ) : (
            item
          );
        })}
      </nav>
    </aside>
  );
};

export default StudentSidebar;
