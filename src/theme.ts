import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#080D0C',
      paper: 'rgba(17, 21, 19, 0.82)'
    },
    primary: {
      main: '#A4D65E',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#8B2E2E'
    },
    success: {
      main: '#78A639'
    },
    warning: {
      main: '#C5B66A'
    },
    error: {
      main: '#8B2E2E'
    },
    text: {
      primary: '#D8E6C1',
      secondary: '#AFA98F'
    }
  },
  typography: {
    fontFamily: '"Rajdhani", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Cinzel", "Rajdhani", sans-serif', fontWeight: 900, letterSpacing: 0 },
    h2: { fontFamily: '"Cinzel", "Rajdhani", sans-serif', fontWeight: 850, letterSpacing: 0 },
    h3: { fontFamily: '"Cinzel", "Rajdhani", sans-serif', fontWeight: 850, letterSpacing: 0 },
    h4: { fontFamily: '"Cinzel", "Rajdhani", sans-serif', fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 800, letterSpacing: 0 },
    button: { fontFamily: '"Rajdhani", "SF Pro Display", "Segoe UI", system-ui, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 64,
          borderRadius: 6,
          boxShadow: 'none',
          fontSize: '1.05rem',
          justifyContent: 'center',
          paddingInline: 22,
          gap: 0,
          lineHeight: 1.1
        },
        containedPrimary: {
          color: '#FFFFFF',
          backgroundImage: 'linear-gradient(180deg, rgba(164, 214, 94, 0.95), rgba(63, 77, 57, 0.98))',
          border: '1px solid rgba(216, 230, 193, 0.3)',
          boxShadow: '0 0 26px rgba(120, 166, 57, 0.22), inset 0 1px 0 rgba(255,255,255,0.18)'
        },
        outlined: {
          borderColor: 'rgba(197,182,106,0.36)',
          color: '#D8E6C1'
        }
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '& .MuiButton-startIcon': {
            width: 28,
            marginRight: 10,
            marginLeft: 0,
            justifyContent: 'center'
          },
          '& .MuiButton-startIcon > svg': {
            fontSize: 26
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, rgba(30,34,30,0.9), rgba(8,13,12,0.92))',
          border: '1px solid rgba(197,182,106,0.22)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 22px 70px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(216,230,193,0.035)'
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
