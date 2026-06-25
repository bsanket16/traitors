import { Box, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface CinematicTextProps {
  title: string;
  lines: string[];
  subtitle?: string;
}

export function CinematicText({ title, lines, subtitle }: CinematicTextProps) {
  const fullText = useMemo(() => lines.join('\n\n'), [lines]);
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
      <Stack gap={1.4} textAlign="center" alignItems="center" className="cinematic-copy">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
          <Typography variant="h3" component="h1">{title}</Typography>
        </motion.div>
        <Typography className="typewriter-text" color="text.secondary" whiteSpace="pre-line">
          {shown}
        </Typography>
        {subtitle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: shown.length === fullText.length ? 1 : 0 }} transition={{ duration: 0.35 }}>
            <Typography className="cinematic-subtitle" color="text.primary" fontWeight={800}>{subtitle}</Typography>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
}
