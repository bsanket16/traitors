import { EmojiEvents } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { PlayerCard } from '../components/PlayerCard';
import { RoomHeader } from '../components/RoomHeader';
import { StatusBadge } from '../components/StatusBadge';
import { roleLabels, winnerLabels } from '../content/labels';
import { useGameStore } from '../store/gameStore';

export function GameOverPage() {
  const { state, action } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;
  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <Paper elevation={0} className="game-card finale-card" sx={{ p: 3, textAlign: 'center' }}>
        <EmojiEvents color="warning" sx={{ fontSize: 70 }} />
        <Typography variant="h3">{state.winner ? winnerLabels[state.winner] : 'Game Over'}</Typography>
        {state.lastResult && <Typography color="text.secondary" mt={1}>{state.lastResult.message}</Typography>}
        {isOverseer && (
          <Stack gap={1.2} mt={2}>
            <Button variant="contained" onClick={() => action('newGame')}>New Game</Button>
          </Stack>
        )}
      </Paper>
      <Typography variant="h5">Roles Revealed</Typography>
      <Stack gap={1}>
        {state.revealedRoles?.map((player) => (
          <Stack key={player.id} gap={1}>
            <PlayerCard player={player} />
            <StatusBadge label={roleLabels[player.role]} color={player.role === 'traitor' ? 'secondary' : 'primary'} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
