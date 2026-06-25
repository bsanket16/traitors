import { AutoAwesome } from '@mui/icons-material';
import { Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { randomRumor } from '../content/rumors';

export function Rumor() {
  const rumor = useMemo(() => randomRumor(), []);

  return (
    <Paper elevation={0} className="game-card rumor-card" sx={{ p: 2 }}>
      <Stack gap={0.8} alignItems="center" textAlign="center">
        <AutoAwesome color="primary" fontSize="small" />
        <Stack gap={0.4} alignItems="center">
          <Typography variant="overline" color="primary">Rumor</Typography>
          <Typography color="text.secondary" className="rumor-text">{rumor}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
