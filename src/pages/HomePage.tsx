import { Add, Login } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <Page>
      <Stack className="center-stack home-hero">
        <Stack textAlign="center" gap={1.2} className="home-title">
          <Typography variant="h1" fontSize={{ xs: 54, sm: 76 }}>Traitors</Typography>
          <Typography color="text.secondary">A modern social deduction game of trust, pressure, and hidden intent.</Typography>
        </Stack>
        <Paper elevation={0} className="game-card home-action-panel" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack gap={1.5} className="home-action-stack">
            <Button className="home-action-button" startIcon={<Add />} size="large" variant="contained" onClick={() => navigate('/create')}>Create Room</Button>
            <Button className="home-action-button" startIcon={<Login />} size="large" variant="outlined" onClick={() => navigate('/join')}>Join Room</Button>
          </Stack>
        </Paper>
      </Stack>
    </Page>
  );
}
