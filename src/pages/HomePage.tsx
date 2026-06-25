import { Add, Login } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import logoImage from '../images/logo.png';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <Page>
      <Stack className="center-stack home-hero">
        <Stack textAlign="center" gap={1.2} className="home-title">
          {/* <Box component="img" src={logoImage} alt="Traitors" sx={{ maxWidth: 280, height: 'auto', marginBottom: 1 }} /> */}
          <Typography variant="h1" fontSize={{ xs: 36, sm: 54 }}>Traitors</Typography>
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
