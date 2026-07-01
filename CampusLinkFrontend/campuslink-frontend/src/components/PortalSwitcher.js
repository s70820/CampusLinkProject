import React, { useCallback, useEffect, useState } from 'react';
import { Button, Menu, MenuItem, Typography } from '@mui/material';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { useNavigate } from 'react-router-dom';
import {
  PORTAL_LABELS,
  PORTAL_UPDATED_EVENT,
  canSwitchPortal,
  getAccountRole,
  getActivePortal,
  getAvailablePortals,
  getPortalDashboardPath,
  setActivePortal,
} from '../utils/portalContext';

const PortalSwitcher = ({ variant = 'outlined', size = 'small' }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activePortal, setActivePortalState] = useState(() => getActivePortal());
  const accountRole = getAccountRole();

  const refresh = useCallback(() => {
    setActivePortalState(getActivePortal());
  }, []);

  useEffect(() => {
    window.addEventListener(PORTAL_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PORTAL_UPDATED_EVENT, refresh);
  }, [refresh]);

  if (!canSwitchPortal(accountRole)) return null;

  const available = getAvailablePortals(accountRole);
  const otherPortals = available.filter((p) => p !== activePortal);

  const handleSelect = (portal) => {
    setActivePortal(portal);
    setActivePortalState(portal);
    setAnchorEl(null);
    navigate(getPortalDashboardPath(portal));
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<SwapHorizOutlinedIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          borderRadius: '10px',
          fontWeight: 700,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          height: 44,
          px: 1.75,
          borderColor: 'rgba(37, 99, 235, 0.2)',
        }}
      >
        {PORTAL_LABELS[activePortal]}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '12px', minWidth: 200, mt: 1 } }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Switch portal view
          </Typography>
        </MenuItem>
        {otherPortals.map((portal) => (
          <MenuItem key={portal} onClick={() => handleSelect(portal)}>
            <Typography sx={{ fontWeight: 600 }}>{PORTAL_LABELS[portal]}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default PortalSwitcher;
