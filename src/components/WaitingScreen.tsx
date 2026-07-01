import { CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { Rumor } from './Rumor';

export function WaitingScreen({ submitted, required }: { submitted?: number; required?: number }) {
  return (
    <Stack gap={2} className="app-panel">
      <Paper elevation={0} className="game-card" sx={{ p: 3, textAlign: 'center' }}>
        <Stack gap={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography variant="h5">Waiting for the room</Typography>
          {required !== undefined && <Typography color="text.secondary">{submitted} of {required} submitted</Typography>}
          <Typography color="text.secondary">The Overseer is preparing the next move.</Typography>
        </Stack>
      </Paper>
      <Rumor />
    </Stack>
  );
}
