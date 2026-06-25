import { ContentCopy, IosShare, RestartAlt } from '@mui/icons-material';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import type { ClientGameState } from '../../shared/types';
import { phaseLabels } from '../content/labels';
import { useGameStore } from '../store/gameStore';

interface RoomHeaderProps {
  state: ClientGameState;
}

export function RoomHeader({ state }: RoomHeaderProps) {
  const isOverseer = state.currentPlayerId === state.hostId;
  const hasGameStarted = state.phase !== 'lobby';
  const action = useGameStore((store) => store.action);
  const copyCode = async () => navigator.clipboard?.writeText(state.roomId);
  const shareCode = async () => {
    if (navigator.share) await navigator.share({ title: 'Join Traitors', text: `Room code: ${state.roomId}` });
    else await copyCode();
  };

  if (hasGameStarted && !isOverseer) {
    return (
      <Paper elevation={0} className="game-card compact-status" sx={{ p: 2 }}>
        <Stack gap={0.8} textAlign="center">
          <Typography variant="overline" color="primary">Current Act</Typography>
          <Typography variant="h5">{phaseLabels[state.phase]}</Typography>
          <Typography color="text.secondary">Round {state.currentRound} / {state.players.filter((player) => player.isAlive).length} alive</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className="game-card overseer-panel" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="overline" color="text.secondary">{isOverseer ? 'Overseer Room' : 'Room'}</Typography>
          <Typography variant="h4">{state.roomId}</Typography>
        </Box>
        <Stack direction="row" gap={1} className="header-actions">
          {isOverseer && hasGameStarted && state.phase !== 'gameOver' && (
            <Button aria-label="Restart game" onClick={() => action('restartGame')} variant="outlined" sx={{ minWidth: 52, px: 0 }}>
              <RestartAlt />
            </Button>
          )}
          <Button aria-label="Copy room code" onClick={copyCode} variant="outlined" sx={{ minWidth: 52, px: 0 }}>
            <ContentCopy />
          </Button>
          <Button aria-label="Share room code" onClick={shareCode} variant="outlined" sx={{ minWidth: 52, px: 0 }}>
            <IosShare />
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" gap={1} flexWrap="wrap" mt={1.5}>
        <Chip size="small" label={`Round ${state.currentRound}`} color="secondary" />
        <Chip size="small" label={phaseLabels[state.phase]} />
        <Chip size="small" label={`${state.players.filter((player) => player.isAlive).length} alive`} />
      </Stack>
    </Paper>
  );
}
