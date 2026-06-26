import { CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Rumor } from './Rumor';

export function CountdownTimer({ seconds, onComplete, label = 'Revealing the result...' }: { seconds: number; onComplete: () => void; label?: string }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          onComplete();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onComplete, seconds]);

  return (
    <Stack className="screen-panel" alignItems="center" gap={2}>
      <CircularProgress color="primary" size={92} variant="determinate" value={(remaining / seconds) * 100} />
      <Typography variant="h2">{remaining}</Typography>
      <Typography color="text.secondary">{label}</Typography>
      <Rumor />
    </Stack>
  );
}
