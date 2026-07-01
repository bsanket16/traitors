import { Stack, Typography } from '@mui/material';
import type { RoundResult } from '../../shared/types';

interface ResultCalloutProps {
  result: RoundResult | null;
  fallback?: string;
}

export function ResultCallout({ result, fallback }: ResultCalloutProps) {
  if (!result) return fallback ? <Typography color="text.secondary">{fallback}</Typography> : null;

  if (!result.eliminatedPlayerName) {
    return <Typography color="text.secondary">{result.message}</Typography>;
  }

  const actionText = result.kind === 'night' ? 'died tonight' : 'was eliminated';

  return (
    <Stack gap={0.4} alignItems="center" className="result-callout">
      <Typography className="result-callout-name" component="p">
        {result.eliminatedPlayerName}
      </Typography>
      <Typography color="text.secondary" fontWeight={800}>
        {actionText}
      </Typography>
    </Stack>
  );
}
