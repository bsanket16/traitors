import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import type { Role } from '../../shared/types';
import { RoleCard } from '../components/RoleCard';
import { WaitingScreen } from '../components/WaitingScreen';
import { roleLabels } from '../content/labels';
import { useGameStore } from '../store/gameStore';

function RoleReminder({ role }: { role: Role | null }) {
  const [showRole, setShowRole] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    timer.current = window.setTimeout(() => setShowRole(true), 2000);
  };
  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setShowRole(false);
  };

  if (!role) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
      <Stack gap={1}>
        <Button
          startIcon={<Visibility />}
          variant="outlined"
          onMouseDown={start}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchEnd={stop}
        >
          Remember My Role
        </Button>
        <Typography color={showRole ? 'primary.main' : 'text.secondary'} fontWeight={900}>
          {showRole ? roleLabels[role] : 'Press and hold for 2 seconds'}
        </Typography>
      </Stack>
    </Paper>
  );
}

export function RoleRevealPage() {
  const { state, action, error } = useGameStore();
  if (!state) return null;
  const currentPlayer = state.players.find((player) => player.id === state.currentPlayerId);
  const hasSeenRole = Boolean(currentPlayer?.hasSeenRole);

  if (!state.currentPlayerRole) return <WaitingScreen />;

  if (hasSeenRole) {
    return (
      <Stack gap={2}>
        <Typography variant="h4" textAlign="center">Role hidden</Typography>
        <RoleReminder role={state.currentPlayerRole} />
        <WaitingScreen />
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography color="text.secondary" textAlign="center">Hide your screen before revealing.</Typography>
      <RoleCard role={state.currentPlayerRole} />
      <Paper elevation={0} sx={{ p: 2 }}>
        <Stack gap={0.5}>
          <Typography color="primary" fontWeight={900}>IMPORTANT</Typography>
          <Typography color="text.secondary">
            Throughout the game, every player will participate in every action. Not every action will affect the outcome.
            This protects identities and keeps the game fair. Do not discuss your selections.
          </Typography>
        </Stack>
      </Paper>
      <Button startIcon={<VisibilityOff />} variant="contained" size="large" onClick={() => action('acknowledgeRole')}>I Have Seen My Role</Button>
    </Stack>
  );
}
