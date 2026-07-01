import { RoleEmblem } from './RoleEmblem';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="The Traitor">
      <RoleEmblem role="traitor" className="brand-logo-mark" />
      <div className="brand-logo-copy">
        <span>The</span>
        <strong>Traitor</strong>
      </div>
    </div>
  );
}
