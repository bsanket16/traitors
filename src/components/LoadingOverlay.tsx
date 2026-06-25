import { Backdrop, CircularProgress } from '@mui/material';

export function LoadingOverlay({ open }: { open: boolean }) {
  return (
    <Backdrop open={open} sx={{ zIndex: 1400, color: '#fff' }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
