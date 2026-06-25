import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#050505',
      paper: 'rgba(17, 17, 17, 0.72)'
    },
    primary: {
      main: '#C6FF00',
      contrastText: '#050505'
    },
    secondary: {
      main: '#FF3B3B'
    },
    success: {
      main: '#C6FF00'
    },
    warning: {
      main: '#ffc857'
    },
    error: {
      main: '#FF3B3B'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0'
    }
  },
  typography: {
    fontFamily: '"Rajdhani", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', fontWeight: 900, letterSpacing: 0 },
    h2: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', fontWeight: 850, letterSpacing: 0, fontSize: '2.2rem' },
    h3: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', fontWeight: 850, letterSpacing: 0, fontSize: '1.8rem' },
    h4: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 800, letterSpacing: 0 },
    button: { fontFamily: '"Orbitron", "Rajdhani", sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 56,
          borderRadius: 8,
          boxShadow: 'none',
          fontSize: '1rem',
          justifyContent: 'center',
          gap: 8,
          paddingInline: 22
        },
        containedPrimary: {
          boxShadow: '0 0 24px rgba(198, 255, 0, 0.22)'
        },
        outlined: {
          borderColor: 'rgba(198,255,0,0.34)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.035))',
          border: '1px solid rgba(198,255,0,0.16)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 20px 70px rgba(0,0,0,0.38)'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true
      }
    }
  }
});
