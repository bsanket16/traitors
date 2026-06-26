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
  const restart = () => {
    if (window.confirm('Restart this game with the same players?')) void action('restartGame');
  };
  const shareCode = async () => {
    if (navigator.share) await navigator.share({ title: 'Join Traitors', text: `Village code: ${state.roomId}` });
    else await copyCode();
  };

  if (hasGameStarted && !isOverseer) {
    return (
      <Paper elevation={0} className="game-card compact-status" sx={{ p: 2 }}>
        <Stack gap={0.8} textAlign="center">
          <Chip className="phase-pill" size="small" label={phaseLabels[state.phase]} variant="outlined" sx={{ alignSelf: 'center' }} />
          <Typography variant="h5">Round {state.currentRound}</Typography>
          <Typography color="text.secondary">{state.players.filter((player) => player.isAlive).length} alive in the village</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className="game-card overseer-panel" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="overline" color="text.secondary">{isOverseer ? 'Overseer Village' : 'Village Code'}</Typography>
          <Typography variant="h4">{state.roomId}</Typography>
        </Box>
        <Stack direction="row" gap={1} className="header-actions">
          {isOverseer && hasGameStarted && state.phase !== 'gameOver' && (
            <Button aria-label="Restart game" title="Restart game" onClick={restart} variant="outlined">
              <RestartAlt />
            </Button>
          )}
          <Button aria-label="Copy village code" title="Copy village code" onClick={copyCode} variant="outlined">
            <ContentCopy />
          </Button>
          <Button aria-label="Share village code" title="Share village code" onClick={shareCode} variant="outlined">
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
