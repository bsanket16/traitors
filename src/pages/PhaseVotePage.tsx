import { Alert, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CinematicText } from '../components/CinematicText';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { RoomHeader } from '../components/RoomHeader';
import { VoteCard } from '../components/VoteCard';
import { WaitingScreen } from '../components/WaitingScreen';
import { useGameStore } from '../store/gameStore';

type VoteKind = 'kill' | 'save' | 'elimination';

const copy: Record<VoteKind, { title: string; lines: string[]; subtitle: string; confirm: string }> = {
  kill: {
    title: 'THE NIGHT HAS FALLEN',
    lines: ['A shadow moves through the darkness.', 'Choose a player.'],
    subtitle: 'Your selection is private. Do not reveal your choice.',
    confirm: 'Your selection is private and cannot be changed.'
  },
  save: {
    title: 'FATE HANGS IN THE BALANCE',
    lines: ['Someone may yet survive the night.', 'Choose a player.'],
    subtitle: 'Your selection is private. Do not reveal your choice.',
    confirm: 'Your selection is private and cannot be changed.'
  },
  elimination: {
    title: 'THE COUNCIL DECIDES',
    lines: ['Every voice matters.', 'Who do you believe is the Traitor?'],
    subtitle: 'Choose carefully. The room will remember.',
    confirm: 'Your vote is final once submitted.'
  }
};

export function PhaseVotePage({ kind }: { kind: VoteKind }) {
  const { state, error, submitKillVote, submitSaveVote, submitEliminationVote } = useGameStore();
  const [targetId, setTargetId] = useState<string | null>(null);
  if (!state) return null;

  const submitted = state.submitted[kind];
  const currentPlayer = state.players.find((player) => player.id === state.currentPlayerId);
  const choices = state.players.filter((player) => player.isAlive && (kind === 'save' || player.id !== state.currentPlayerId));
  const target = state.players.find((player) => player.id === targetId);
  const submit = async () => {
    if (!targetId) return;
    if (kind === 'kill') await submitKillVote(targetId);
    if (kind === 'save') await submitSaveVote(targetId);
    if (kind === 'elimination') await submitEliminationVote(targetId);
    setTargetId(null);
  };

  if (!currentPlayer?.isAlive) return <WaitingScreen submitted={state.pendingCounts?.submitted} required={state.pendingCounts?.required} />;
  if (submitted) return <WaitingScreen submitted={state.pendingCounts?.submitted} required={state.pendingCounts?.required} />;

  return (
    <Stack gap={2}>
      <RoomHeader state={state} />
      {error && <Alert severity="error">{error}</Alert>}
      <CinematicText title={copy[kind].title} lines={copy[kind].lines} subtitle={copy[kind].subtitle} />
      <Stack gap={1.2}>
        {choices.map((player, index) => (
          <motion.div key={player.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.06 }}>
            <VoteCard player={player} onSelect={() => setTargetId(player.id)} />
          </motion.div>
        ))}
      </Stack>
      <Typography color="text.secondary" textAlign="center">Every player participates. Do not discuss your selection.</Typography>
      <ConfirmationDialog
        open={Boolean(target)}
        title="Submit vote?"
        body={`Your choice: ${target?.name}. ${copy[kind].confirm}`}
        onCancel={() => setTargetId(null)}
        onConfirm={submit}
      />
    </Stack>
  );
}
