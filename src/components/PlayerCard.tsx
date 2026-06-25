import { MilitaryTech, PersonOff, WifiOff } from '@mui/icons-material';
import { Avatar, Chip, Paper, Stack, Typography } from '@mui/material';
import type { PublicPlayer } from '../../shared/types';

export function PlayerCard({ player }: { player: PublicPlayer }) {
  return (
    <Paper elevation={0} className="game-card player-card" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Avatar sx={{ bgcolor: player.isAlive ? 'primary.main' : 'grey.800' }}>{player.name.slice(0, 1).toUpperCase()}</Avatar>
        <Typography flex={1} fontWeight={800}>{player.name}</Typography>
        {player.isHost && <Chip icon={<MilitaryTech />} size="small" label="Overseer" color="warning" />}
        {!player.isAlive && <PersonOff color="error" />}
        {!player.isConnected && <WifiOff color="disabled" />}
      </Stack>
    </Paper>
  );
}
