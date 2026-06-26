import { AcUnit, Group } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import logo from '../images/logo-transparent.png';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <Page>
      <Stack className="center-stack home-hero">
        <Stack textAlign="center" gap={1.2} className="home-title">
          <img className="home-logo" src={logo} alt="Traitors" />
          <Typography color="text.secondary">A modern social deduction game of trust, pressure, and hidden intent.</Typography>
        </Stack>
        <Paper elevation={0} className="game-card home-action-panel" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack gap={1.5} className="home-action-stack">
            <Button
              className="home-action-button"
              startIcon={<AcUnit />}
              size="large"
              variant="contained"
              onClick={() => navigate('/create')}
              sx={{ '& .MuiButton-startIcon': { mr: 0.1 } }}
            >
              New Village
            </Button>
            <Button className="home-action-button" startIcon={<Group />} size="large" variant="outlined" onClick={() => navigate('/join')}>Join Village</Button>
          </Stack>
        </Paper>
      </Stack>
    </Page>
  );
}
