import React from 'react';
import { motion } from 'framer-motion';
import { Alert, Box, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuthRouteSwitch } from './AuthRouteContext';

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

const authLabelSx = {
  color: '#cbd5e1',
  '&.Mui-focused': { color: '#93c5fd' },
  '&.MuiInputLabel-shrink': { color: '#e2e8f0' },
};

const authHtmlInputSx = {
  color: '#f8fafc',
  '@keyframes authAutofillStart': {
    from: { opacity: 1 },
    to: { opacity: 1 },
  },
  '&:-webkit-autofill': {
    animationName: 'authAutofillStart',
    WebkitBoxShadow: '0 0 0 100px rgba(15, 23, 42, 0.92) inset',
    WebkitTextFillColor: '#f8fafc',
    caretColor: '#f8fafc',
    transition: 'background-color 99999s ease-out',
  },
};

export const authFieldSx = {
  mb: 2,
  className: 'auth-field',
  slotProps: {
    inputLabel: { sx: authLabelSx },
    htmlInput: { sx: authHtmlInputSx },
    input: { sx: { color: '#f8fafc' } },
    formHelperText: { sx: { color: '#94a3b8' } },
  },
};

export const authInputLabelProps = {
  sx: authLabelSx,
};

/** MUI v9: password visibility toggle via slotProps.input (InputProps is ignored) */
export function authPasswordSlotProps(show, onToggle) {
  return {
    inputLabel: authFieldSx.slotProps.inputLabel,
    htmlInput: authFieldSx.slotProps.htmlInput,
    formHelperText: authFieldSx.slotProps.formHelperText,
    input: {
      ...authFieldSx.slotProps.input,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={onToggle}
            onMouseDown={(e) => e.preventDefault()}
            edge="end"
            size="small"
          >
            {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  };
}

const authSelectPaperSx = {
  bgcolor: 'rgba(15, 23, 42, 0.96)',
  backgroundImage: 'none',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
  mt: 0.75,
  maxHeight: 320,
  '& .MuiList-root': {
    py: 0.75,
    px: 0.5,
  },
  '& .MuiMenuItem-root': {
    color: '#e2e8f0',
    fontSize: '0.875rem',
    borderRadius: '8px',
    mx: 0.5,
    my: 0.25,
    whiteSpace: 'normal',
    '&:hover': {
      bgcolor: 'rgba(59, 130, 246, 0.22)',
    },
    '&.Mui-selected': {
      bgcolor: 'rgba(99, 102, 241, 0.3) !important',
      color: '#f8fafc',
      '&:hover': {
        bgcolor: 'rgba(99, 102, 241, 0.38) !important',
      },
    },
    '&.Mui-disabled': {
      color: '#64748b',
      opacity: 1,
    },
  },
};

/** Dark glass dropdown — MUI v9 uses MenuProps.slotProps.paper, not PaperProps */
export const authSelectMenuProps = {
  disableScrollLock: false,
  slotProps: {
    paper: {
      className: 'auth-select-menu',
      elevation: 0,
      sx: authSelectPaperSx,
    },
    list: {
      className: 'auth-select-menu-list',
    },
  },
};

export function AuthMotionBox({ children, ...props }) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

export function AuthMotionAlert({ severity, children, shake }) {
  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Alert severity={severity} className="auth-alert" sx={{ mb: 2, borderRadius: 2.5 }}>
        {children}
      </Alert>
    </motion.div>
  );
}

export function AuthMotionForm({ children, onSubmit }) {
  const isRouteSwitch = useAuthRouteSwitch();

  return (
    <Box
      component={motion.form}
      variants={staggerContainer}
      initial={isRouteSwitch ? false : 'hidden'}
      animate={isRouteSwitch ? undefined : 'show'}
      onSubmit={onSubmit}
      sx={{ width: '100%' }}
    >
      {children}
    </Box>
  );
}

export function AuthMotionCard({ children }) {
  return <Box sx={{ width: '100%' }}>{children}</Box>;
}
