import { Button, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { CinematicText } from '../components/CinematicText';
import { CountdownTimer } from '../components/CountdownTimer';
import { ResultCallout } from '../components/ResultCallout';
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
  const councilSubtitle = state.lastResult?.tied ? 'No name carried enough weight. No one was banished.' : undefined;

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      {!ready && <CountdownTimer seconds={5} onComplete={reveal} label={voteResult ? 'Votes submitted. The Council is counting...' : 'Votes submitted. Preparing the reveal...'} />}
      {!voteResult && ready && (
        <>
          <CinematicText phase="Sunrise" title="THE RESULT IS SEALED" lines={['The village waits for the Overseer. The next truth is seconds away.']} />
          {isOverseer && <Button className="action-button" variant="contained" onClick={() => action('revealResult')}>Reveal Result</Button>}
        </>
      )}
      {voteResult && ready && (
        <>
          <CinematicText phase="Council" title="THE COUNCIL HAS SPOKEN" lines={['The village has made its choice.']} emphasis={councilSubtitle} />
          <ResultCallout result={state.lastResult} />
          {isOverseer && <Button className="action-button" variant="contained" onClick={() => action('nextRound')}>Enter the Next Night</Button>}
        </>
      )}
      {!isOverseer && <Typography className="screen-panel" textAlign="center" color="text.secondary">Waiting for the Overseer.</Typography>}
    </Stack>
  );
}
