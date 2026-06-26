import { ArrowBack, Group } from '@mui/icons-material';
import { Alert, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { useGameStore } from '../store/gameStore';

export function JoinRoomPage() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const { joinRoom, error } = useGameStore();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await joinRoom(name, roomId)) navigate('/lobby');
  };

  return (
    <Page>
      <IconButton aria-label="Back" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}><ArrowBack /></IconButton>
      <Stack className="center-stack" component="form" onSubmit={submit}>
        <Typography variant="h2">Join Village</Typography>
        <Paper elevation={0} className="game-card screen-panel" sx={{ p: 2.5 }}>
          <Stack gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Player Name" value={name} onChange={(event) => setName(event.target.value)} />
            <TextField label="Village Code" value={roomId} onChange={(event) => setRoomId(event.target.value.toUpperCase())} />
            <Button startIcon={<Group />} type="submit" variant="contained" disabled={!name.trim() || !roomId.trim()}>Join Village</Button>
          </Stack>
        </Paper>
      </Stack>
    </Page>
  );
}
