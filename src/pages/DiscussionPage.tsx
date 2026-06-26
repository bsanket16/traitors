import { HowToVote } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { CinematicText } from '../components/CinematicText';
import { RoomHeader } from '../components/RoomHeader';
import { useGameStore } from '../store/gameStore';

export function DiscussionPage() {
  const { state, action } = useGameStore();
  if (!state) return null;
  const isOverseer = state.currentPlayerId === state.hostId;
  const eliminatedName = state.lastResult?.eliminatedPlayerName;
  const hadDeath = Boolean(eliminatedName);
  const subtitle = hadDeath
    ? `${eliminatedName} was found dead at sunrise.`
    : 'Against all odds, everyone survived the night.';

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      <CinematicText
        phase="Sunrise"
        title="THE VILLAGE WAKES"
        lines={[hadDeath ? 'Last night, tragedy struck.' : 'The town awakens.']}
        emphasis={subtitle}
        subtitle="Whispers become accusations. Who do you suspect?"
      />
      <Typography className="screen-panel" color="text.secondary" textAlign="center">Talk face-to-face. The app stays quiet.</Typography>
      {isOverseer && <Button className="action-button" startIcon={<HowToVote />} variant="contained" onClick={() => action('startVoting')}>Call the Council</Button>}
      {!isOverseer && <Typography className="screen-panel" color="text.secondary" textAlign="center">Only the Overseer may begin the vote.</Typography>}
    </Stack>
  );
}
