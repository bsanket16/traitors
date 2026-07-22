import { Paper, Stack, Typography } from '@mui/material';
import type { Role } from '../../shared/types';
import { roleLabels } from '../content/labels';
import { RoleEmblem } from './RoleEmblem';

const copy: Record<Role, { title: string; body: string }> = {
  traitor: {
    title: 'You are the Traitor',
    body: 'Secretly choose one player to eliminate each night. Blend in when everyone talks.'
  },
  doctor: {
    title: 'You are the Guardian',
    body: 'Each night, choose one other player who might survive the darkness.'
  },
  innocent: {
    title: 'You are a Citizen',
    body: 'Watch the room. Measure every claim. Help expose the Traitor before trust runs out.'
  }
};

export function RoleCard({ role }: { role: Role }) {
  const roleCopy = copy[role];
  return (
    <Paper elevation={0} className="game-card role-card screen-panel" sx={{ p: 3, minHeight: 300, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <Stack gap={2} alignItems="center">
        <RoleEmblem className="role-art" role={role} />
        <Typography variant="overline" color="text.secondary">{roleLabels[role]}</Typography>
        <Typography variant="h4">{roleCopy.title}</Typography>
        <Typography color="text.secondary">{roleCopy.body}</Typography>
      </Stack>
    </Paper>
  );
}
