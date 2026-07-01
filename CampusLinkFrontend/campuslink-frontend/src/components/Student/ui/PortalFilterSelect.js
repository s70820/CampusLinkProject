import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { portalFormControlSx, portalSelectControlSx } from './portalFilterStyles';

const PortalFilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  fullWidth = true,
  sx = {},
}) => (
  <FormControl fullWidth={fullWidth} size="small" sx={{ ...portalFormControlSx, ...sx }}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      label={label}
      onChange={onChange}
      sx={portalSelectControlSx}
    >
      {options.map((option) => (
        <MenuItem key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default PortalFilterSelect;
