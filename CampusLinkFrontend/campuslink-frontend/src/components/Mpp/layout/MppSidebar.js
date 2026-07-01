import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';

export const MPP_MENU = [
  { label: 'Dashboard', path: '/mpp/dashboard', Icon: DashboardOutlinedIcon },
  { label: 'Programme Reviews', path: '/mpp/reviews', Icon: RateReviewOutlinedIcon },
  { label: 'Programme Records', path: '/mpp/records', Icon: FolderOpenOutlinedIcon },
  { label: 'User Management', path: '/mpp/users', Icon: PeopleOutlinedIcon },
];

const MppSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
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
              <GavelOutlinedIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', lineHeight: 1.1 }}>
                CampusLink+
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.06em' }}>
                MPP PORTAL
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
        {MPP_MENU.map(({ label, path, Icon }) => {
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

export default MppSidebar;
