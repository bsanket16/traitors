import { Chip } from '@mui/material';

export function StatusBadge({ label, color = 'default' }: { label: string; color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }) {
  return <Chip label={label} color={color} size="small" />;
}
