import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { portalFormControlSx, portalOutlinedControlSx } from './portalFilterStyles';

const PortalSearchField = ({
  value,
  onChange,
  placeholder = 'Search...',
  label,
  fullWidth = true,
  sx = {},
}) => (
  <TextField
    fullWidth={fullWidth}
    size="small"
    label={label}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    sx={{ ...portalOutlinedControlSx, ...(label ? portalFormControlSx : {}), ...sx }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start" sx={{ ml: 0.25 }}>
            <SearchIcon sx={{ color: '#64748b', fontSize: 20 }} />
          </InputAdornment>
        ),
      },
    }}
  />
);

export default PortalSearchField;
