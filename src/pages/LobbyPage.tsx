import { PlayArrow } from '@mui/icons-material';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { PlayerCard } from '../components/PlayerCard';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function LobbyPage() {
  const { state, action, error } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h5">{state.players.length} players joined</Typography>
      <Stack gap={1}>{state.players.map((player) => <PlayerCard key={player.id} player={player} />)}</Stack>
      {isOverseer && (
        <Button startIcon={<PlayArrow />} size="large" variant="contained" disabled={state.players.length < 4} onClick={() => action('startGame')}>
          Begin Game
        </Button>
      )}
      {!isOverseer && <Typography color="text.secondary" textAlign="center">Waiting for the Overseer to begin.</Typography>}
    </Stack>
  );
}
