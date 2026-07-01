import { PersonOff } from '@mui/icons-material';
import { Paper, Stack, Typography } from '@mui/material';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function EliminatedPage() {
  const { state } = useGameStore();
  if (!state) return null;
  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <Paper elevation={0} className="screen-panel" sx={{ p: 3, textAlign: 'center' }}>
        <Stack gap={2} alignItems="center">
          <PersonOff color="error" sx={{ fontSize: 64 }} />
          <Typography variant="h4">You have been eliminated.</Typography>
          <Typography color="text.secondary">You can watch game progress and results, but you cannot vote or perform actions.</Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
