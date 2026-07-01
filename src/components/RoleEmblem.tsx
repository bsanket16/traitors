import type { Role } from '../../shared/types';
import citizenArt from '../images/role-citizen.png';
import guardianArt from '../images/role-guardian.png';
import traitorArt from '../images/role-traitor.png';

type EmblemRole = Extract<Role, 'traitor' | 'doctor' | 'innocent'>;

interface RoleEmblemProps {
  role: EmblemRole;
  className?: string;
}

const artByRole: Record<EmblemRole, { src: string; label: string }> = {
  traitor: { src: traitorArt, label: 'Traitor emblem' },
  doctor: { src: guardianArt, label: 'Guardian emblem' },
  innocent: { src: citizenArt, label: 'Citizen emblem' }
};

export function RoleEmblem({ role, className }: RoleEmblemProps) {
  const art = artByRole[role];

  return <img className={className} src={art.src} alt={art.label} draggable={false} />;
}
