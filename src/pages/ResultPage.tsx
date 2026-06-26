import { Button, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { CinematicText } from '../components/CinematicText';
import { CountdownTimer } from '../components/CountdownTimer';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function ResultPage() {
  const { state, action } = useGameStore();
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => {
    setReady(true);
  }, []);
  if (!state) return null;

  const isOverseer = state.currentPlayerId === state.hostId;
  const voteResult = state.lastResult?.kind === 'vote' && state.lastResult.round === state.currentRound;
  const resultText = state.lastResult?.tied
    ? ['The Council fractured.', 'No name carried enough weight. No one was banished.']
    : state.lastResult?.eliminatedPlayerName
    ? ['Last night, tragedy struck.', `${state.lastResult.eliminatedPlayerName} was found dead at sunrise.`]
    : ['The town awakens.', 'Against all odds, everyone survived the night.'];

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      {!ready && <CountdownTimer seconds={5} onComplete={reveal} label={voteResult ? 'Votes submitted. The Council is counting...' : 'Votes submitted. Preparing the reveal...'} />}
      {!voteResult && ready && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
          <Stack gap={2}>
            <CinematicText phase="Sunrise" title="THE RESULT IS SEALED" lines={['The village waits for the Overseer.', 'The next truth is seconds away.']} />
            {isOverseer && <Button variant="contained" onClick={() => action('revealResult')}>Reveal Result</Button>}
          </Stack>
        </Paper>
      )}
      {voteResult && ready && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
          <Stack gap={2}>
            <CinematicText phase="Council" title="THE COUNCIL HAS SPOKEN" lines={resultText} />
            {isOverseer && <Button variant="contained" onClick={() => action('nextRound')}>Enter the Next Night</Button>}
          </Stack>
        </Paper>
      )}
      {!isOverseer && <Typography textAlign="center" color="text.secondary">Waiting for the Overseer.</Typography>}
    </Stack>
  );
}
