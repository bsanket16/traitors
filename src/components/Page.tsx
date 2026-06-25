import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';

export function Page({ children }: PropsWithChildren) {
  return (
    <Box className="app-stage">
      <Box className="page-shell">{children}</Box>
    </Box>
  );
}
