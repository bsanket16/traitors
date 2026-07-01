import type { Phase, Role } from '../../shared/types';

export const roleLabels: Record<Role, string> = {
  traitor: 'Traitor',
  doctor: 'Guardian',
  innocent: 'Citizen'
};

export const phaseLabels: Record<Phase, string> = {
  lobby: 'Lobby',
  roleReveal: 'Role Reveal',
  kill: 'Night',
  save: 'Balance',
  result: 'Result',
  discussion: 'Sunrise',
  voting: 'Council',
  gameOver: 'Game Over'
};

export const winnerLabels: Record<string, string> = {
  traitor: 'Traitor Wins',
  traitors: 'Traitor Wins',
  innocents: 'Citizen Wins'
};
