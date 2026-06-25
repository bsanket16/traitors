import { HealthAndSafety, Shield, TheaterComedy } from '@mui/icons-material';
import { Paper, Stack, Typography } from '@mui/material';
import type { Role } from '../../shared/types';
import { roleLabels } from '../content/labels';

const copy: Record<Role, { title: string; body: string; icon: JSX.Element; color: string }> = {
  traitor: {
    title: 'You are the Traitor',
    body: 'Secretly choose one player to eliminate each night. Blend in when everyone talks.',
    icon: <TheaterComedy fontSize="large" />,
    color: 'secondary.main'
  },
  doctor: {
    title: 'You are the Guardian',
    body: 'Each night, choose one player who might survive the darkness. You may choose yourself.',
    icon: <HealthAndSafety fontSize="large" />,
    color: 'primary.main'
  },
  innocent: {
    title: 'You are a Citizen',
    body: 'Watch the room. Measure every claim. Help expose the Traitor before trust runs out.',
    icon: <Shield fontSize="large" />,
    color: 'primary.main'
  }
};

export function RoleCard({ role }: { role: Role }) {
  const roleCopy = copy[role];
  return (
    <Paper elevation={0} className="game-card role-card" sx={{ p: 3, minHeight: 300, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <Stack gap={2} alignItems="center">
        <Stack sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: roleCopy.color, alignItems: 'center', justifyContent: 'center' }}>
          {roleCopy.icon}
        </Stack>
        <Typography variant="overline" color="text.secondary">{roleLabels[role]}</Typography>
        <Typography variant="h4">{roleCopy.title}</Typography>
        <Typography color="text.secondary">{roleCopy.body}</Typography>
      </Stack>
    </Paper>
  );
}
