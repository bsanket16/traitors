import { HowToVote } from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { CinematicText } from '../components/CinematicText';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function DiscussionPage() {
  const { state, action } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;
  const resultLines = state.lastResult?.eliminatedPlayerName
    ? ['Last night, tragedy struck.', `${state.lastResult.eliminatedPlayerName} was found dead at sunrise.`]
    : ['The town awakens.', 'Against all odds, everyone survived the night.'];

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
        <Stack gap={2}>
          <CinematicText title="SUNRISE" lines={[...resultLines, 'The town gathers.', 'Whispers become accusations.', 'Who do you suspect?']} />
          <Typography color="text.secondary">Talk face-to-face. The app stays quiet.</Typography>
          {isOverseer && <Button startIcon={<HowToVote />} variant="contained" onClick={() => action('startVoting')}>Start the Council</Button>}
          {!isOverseer && <Typography color="text.secondary">Only the Overseer may begin the vote.</Typography>}
        </Stack>
      </Paper>
    </Stack>
  );
}
