import { Box, Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface CinematicTextProps {
  title: string;
  lines: string[];
  subtitle?: string;
  emphasis?: string;
  phase?: string;
}

export function CinematicText({ title, lines, subtitle, emphasis, phase }: CinematicTextProps) {
  const fullText = useMemo(() => lines.join(' '), [lines]);
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setShown(fullText.slice(0, index));
      if (index >= fullText.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [fullText]);

  return (
    <Box className="cinematic-panel">
      <Stack gap={1.2} textAlign="center" alignItems="center" className="cinematic-copy">
        {phase && <Chip className="phase-pill" size="small" label={phase} variant="outlined" />}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
          <Typography variant="h3" component="h1">{title}</Typography>
        </motion.div>
        <Typography className="typewriter-text" color="text.secondary">
          {shown}
        </Typography>
        {emphasis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: shown.length === fullText.length ? 1 : 0 }} transition={{ duration: 0.35 }}>
            <Typography className="cinematic-emphasis">{emphasis}</Typography>
          </motion.div>
        )}
        {subtitle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: shown.length === fullText.length ? 1 : 0 }} transition={{ duration: 0.35 }}>
            <Typography className="cinematic-subtitle" color="text.primary" fontWeight={800}>{subtitle}</Typography>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
}
