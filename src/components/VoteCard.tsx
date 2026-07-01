import { Button, Paper, Stack, Typography } from '@mui/material';
import type { PublicPlayer } from '../../shared/types';

interface VoteCardProps {
  player: PublicPlayer;
  onSelect: () => void;
  disabled?: boolean;
}

export function VoteCard({ player, onSelect, disabled }: VoteCardProps) {
  return (
    <Paper elevation={0} className="game-card vote-card" sx={{ p: 1.5 }}>
      <Stack direction="row" gap={1.2} alignItems="center" justifyContent="space-between">
        <Typography fontWeight={850} flex={1} minWidth={0}>{player.name}</Typography>
        <Button className="action-button vote-action-button" variant="contained" onClick={onSelect} disabled={disabled}>Choose</Button>
      </Stack>
    </Paper>
  );
}
