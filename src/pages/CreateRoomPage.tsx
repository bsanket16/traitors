import { AcUnit, ArrowBack } from '@mui/icons-material';
import { Alert, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { useGameStore } from '../store/gameStore';

export function CreateRoomPage() {
  const [name, setName] = useState('');
  const { createRoom, error } = useGameStore();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await createRoom(name)) navigate('/lobby');
  };

  return (
    <Page>
      <IconButton aria-label="Back" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}><ArrowBack /></IconButton>
      <Stack className="center-stack" component="form" onSubmit={submit}>
        <Typography variant="h2">New Village</Typography>
        <Paper elevation={0} className="game-card screen-panel" sx={{ p: 2.5 }}>
          <Stack gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Player Name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
            <Button className="action-button" startIcon={<AcUnit />} type="submit" variant="contained" disabled={!name.trim()}>New Village</Button>
          </Stack>
        </Paper>
      </Stack>
    </Page>
  );
}
