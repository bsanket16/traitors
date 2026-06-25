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
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Typography fontWeight={850} flex={1}>{player.name}</Typography>
        <Button variant="contained" onClick={onSelect} disabled={disabled}>Choose</Button>
      </Stack>
    </Paper>
  );
}
