import { PersonOff } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function EliminatedPage() {
  const { state } = useGameStore();
  if (!state) return null;
  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
        <Stack gap={2} alignItems="center">
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PersonOff color="error" sx={{ fontSize: 72, mb: 1 }} />
          </Box>
          <Typography variant="h4">You have been eliminated.</Typography>
          <Typography color="text.secondary">You can watch game progress and results, but you cannot vote or perform actions.</Typography>
          {state.lastResult && <Typography>{state.lastResult.message}</Typography>}
        </Stack>
      </Paper>
    </Stack>
  );
}
