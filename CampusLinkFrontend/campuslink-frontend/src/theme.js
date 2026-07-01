import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    background: {
      default: '#f5f9ff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Poppins', sans-serif",
          backgroundColor: '#f5f9ff',
          color: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { fontFamily: "'Poppins', sans-serif" },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { fontFamily: "'Poppins', sans-serif" },
      },
      defaultProps: {
        color: 'textPrimary',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          color: '#0f172a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.auth-select-menu': {
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backgroundImage: 'none',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          '&.auth-select-menu': {
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backgroundImage: 'none',
            color: '#e2e8f0',
          },
        },
      },
    },
  },
});

export default theme;
