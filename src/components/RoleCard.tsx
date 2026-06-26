import { Paper, Stack, Typography } from '@mui/material';
import type { Role } from '../../shared/types';
import { roleLabels } from '../content/labels';
import citizenImage from '../images/role-citizen.png';
import guardianImage from '../images/role-guardian.png';
import traitorImage from '../images/role-traitor.png';

const copy: Record<Role, { title: string; body: string; image: string }> = {
  traitor: {
    title: 'You are the Traitor',
    body: 'Secretly choose one player to eliminate each night. Blend in when everyone talks.',
    image: traitorImage
  },
  doctor: {
    title: 'You are the Guardian',
    body: 'Each night, choose one player who might survive the darkness. You may choose yourself.',
    image: guardianImage
  },
  innocent: {
    title: 'You are a Citizen',
    body: 'Watch the room. Measure every claim. Help expose the Traitor before trust runs out.',
    image: citizenImage
  }
};

export function RoleCard({ role }: { role: Role }) {
  const roleCopy = copy[role];
  return (
    <Paper elevation={0} className="game-card role-card screen-panel" sx={{ p: 3, minHeight: 300, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <Stack gap={2} alignItems="center">
        <img className="role-art" src={roleCopy.image} alt={roleLabels[role]} />
        <Typography variant="overline" color="text.secondary">{roleLabels[role]}</Typography>
        <Typography variant="h4">{roleCopy.title}</Typography>
        <Typography color="text.secondary">{roleCopy.body}</Typography>
      </Stack>
    </Paper>
  );
}
