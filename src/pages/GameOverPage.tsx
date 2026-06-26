import { Replay } from '@mui/icons-material';
import { Avatar, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { PlayerCard } from '../components/PlayerCard';
import { RoomHeader } from '../components/RoomHeader';
import { roleLabels, winnerLabels } from '../content/labels';
import logo from '../images/logo.png';
import { useGameStore } from '../store/gameStore';

export function GameOverPage() {
  const { state, action } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;
  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <Paper elevation={0} className="game-card finale-card" sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: 'center' }}>
        <Stack gap={1.6} alignItems="center">
          <img className="finale-logo" src={logo} alt="Traitors" />
          <Chip className="phase-pill" size="small" label="Final Reveal" variant="outlined" />
          <Typography variant="h3">{state.winner ? winnerLabels[state.winner] : 'Game Over'}</Typography>
          {state.lastResult && <Typography color="text.secondary">{state.lastResult.message}</Typography>}
        </Stack>
        {isOverseer && (
          <Stack gap={1.2} mt={2}>
            <Button startIcon={<Replay />} variant="contained" onClick={() => action('newGame')}>Gather a New Village</Button>
          </Stack>
        )}
      </Paper>
      <Typography variant="h5">Masks Removed</Typography>
      <Stack gap={1} className="role-reveal-grid">
        {state.revealedRoles?.map((player) => (
          <Stack key={player.id} direction="row" gap={1} alignItems="center">
            <PlayerCard player={player} />
            <Avatar
              variant="rounded"
              sx={{
                width: 112,
                height: 50,
                border: '1px solid',
                borderColor: player.role === 'traitor' ? 'secondary.main' : 'warning.main',
                bgcolor: player.role === 'traitor' ? 'rgba(139,46,46,0.22)' : 'rgba(197,182,106,0.12)',
                color: player.role === 'traitor' ? 'error.light' : 'primary.main',
                fontWeight: 900,
                fontSize: 14
              }}
            >
              {roleLabels[player.role]}
            </Avatar>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
