/** Shared filter/search control styles — student portal light theme */

export const PORTAL_CONTROL_HEIGHT = 40;

export const portalOutlinedControlSx = {
  '& .MuiOutlinedInput-root': {
    height: PORTAL_CONTROL_HEIGHT,
    borderRadius: '10px',
    bgcolor: '#ffffff',
    fontSize: '0.875rem',
    color: '#0f172a',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(37, 99, 235, 0.18)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(37, 99, 235, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    },
  },
  '& .MuiOutlinedInput-input': {
    py: 0,
    height: PORTAL_CONTROL_HEIGHT,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#0f172a',
    '&::placeholder': {
      color: '#64748b',
      opacity: 1,
      fontSize: '0.875rem',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    '&.Mui-focused': { color: '#2563eb' },
  },
  '& .MuiInputAdornment-root': {
    marginTop: '0 !important',
    color: '#94a3b8',
  },
};

export const portalSelectControlSx = {
  height: PORTAL_CONTROL_HEIGHT,
  borderRadius: '10px',
  bgcolor: '#ffffff',
  fontSize: '0.875rem',
  color: '#0f172a',
  transition: 'box-shadow 0.2s ease',
  '& fieldset': {
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
  '&:hover fieldset': {
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#2563eb',
  },
  '&.Mui-focused': {
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
  },
  '& .MuiSelect-icon': {
    color: '#64748b',
  },
};

export const portalFormControlSx = {
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#64748b',
    transform: 'translate(14px, 10px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -7px) scale(0.75)',
    },
    '&.Mui-focused': {
      color: '#2563eb',
    },
  },
};

export const portalTableHeadRowSx = {
  bgcolor: 'rgba(37, 99, 235, 0.08)',
  '& .MuiTableCell-root': {
    color: '#1e3a8a',
    fontWeight: 700,
    borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
  },
};

export const portalInfoBoxSx = {
  p: 2,
  borderRadius: '10px',
  bgcolor: 'rgba(239, 246, 255, 0.85)',
  border: '1px solid rgba(37, 99, 235, 0.12)',
  color: '#0f172a',
};

export const portalFieldLabelSx = {
  color: '#475569',
  fontSize: '0.8rem',
  fontWeight: 600,
};

export const portalFieldValueSx = {
  color: '#0f172a',
  fontWeight: 700,
};

export const portalBodyTextSx = {
  color: '#334155',
  fontSize: '0.85rem',
  lineHeight: 1.55,
};

export const portalStepTitleSx = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#0f172a',
};

export const portalDialogPaperSx = {
  borderRadius: '14px',
  bgcolor: '#ffffff',
  color: '#0f172a',
  border: '1px solid rgba(37, 99, 235, 0.12)',
  boxShadow: '0 12px 40px rgba(37, 99, 235, 0.12)',
  '& .MuiDialogTitle-root': {
    color: '#0f172a',
    fontWeight: 800,
  },
  '& .MuiDialogContent-root': {
    color: '#0f172a',
  },
  '& .MuiTypography-root': {
    color: 'inherit',
  },
};

export const portalStatusBarSx = {
  px: { xs: 2, sm: 2.5 },
  py: 1.25,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1,
  bgcolor: 'rgba(239, 246, 255, 0.8)',
  borderBottom: '1px solid rgba(37, 99, 235, 0.12)',
};
