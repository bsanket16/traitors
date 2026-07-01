import { HowToVote } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { CinematicText } from '../components/CinematicText';
import { ResultCallout } from '../components/ResultCallout';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function DiscussionPage() {
  const { state, action } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;
  const hadDeath = Boolean(state.lastResult?.eliminatedPlayerName);
  const subtitle = hadDeath ? undefined : 'Against all odds, everyone survived the night.';

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      {hadDeath && (
        <Paper elevation={0} className="game-card screen-panel result-panel">
          <ResultCallout result={state.lastResult} />
        </Paper>
      )}
      <CinematicText
        phase="Sunrise"
        title="THE VILLAGE WAKES"
        lines={[hadDeath ? 'Last night, tragedy struck.' : 'The town awakens.']}
        emphasis={subtitle}
        subtitle="Whispers become accusations. Who do you suspect?"
      />
      <Typography className="screen-panel" color="text.secondary" textAlign="center">
        {isOverseer
          ? 'Talk face-to-face. The app stays quiet.'
          : 'Talk face-to-face. The app stays quiet. Only the Overseer may begin the vote.'}
      </Typography>
      {isOverseer && <Button className="action-button" startIcon={<HowToVote />} variant="contained" onClick={() => action('startVoting')}>Call the Council</Button>}
    </Stack>
  );
}
