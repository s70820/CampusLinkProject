import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useStoredUser } from '../../hooks/useStoredUser';
import { getDefaultPortal, getPortalDashboardPath, setActivePortal } from '../../utils/portalContext';

const RequireRole = ({ allowedRoles, children }) => {
  const navigate = useNavigate();
  const { user } = useStoredUser();
  const role = (user?.role || 'STUDENT').toUpperCase();
  const allowed = allowedRoles.map((r) => r.toUpperCase());
  const isAllowed = allowed.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      const portal = getDefaultPortal(role);
      setActivePortal(portal);
      navigate(getPortalDashboardPath(portal), { replace: true });
    }
  }, [isAllowed, role, navigate]);

  if (!isAllowed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

export default RequireRole;
