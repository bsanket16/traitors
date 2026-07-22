import { ArrowBack, LockOpen } from '@mui/icons-material';
import { Alert, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';

interface Analytics {
  villagesCreated: number; gamesPlayed: number; completedGames: number; abandonedGames: number; averageGroupSize: number; traitorWins: number; citizenWins: number; feedbackReceived: number; completionRate: number; lastUpdatedAt: string | null;
  feedback: Array<{ name: string; contact: string; message: string; createdAt: string }>;
}

const tokenKey = 'the-traitor.admin-token';

export function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) ?? '');
  const [stats, setStats] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStats = async (accessToken = token) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${accessToken}` } });
      const result = await response.json() as Analytics & { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not load analytics.');
      setStats(result);
      setError('');
    } catch (loadError) {
      setStats(null);
      sessionStorage.removeItem(tokenKey);
      setToken('');
      setError(loadError instanceof Error ? loadError.message : 'Could not load analytics.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadStats(); }, []); // Check a remembered session once.

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const result = await response.json() as { token?: string; error?: string };
      if (!response.ok || !result.token) throw new Error(result.error ?? 'Could not sign in.');
      sessionStorage.setItem(tokenKey, result.token);
      setToken(result.token);
      setPassword('');
      await loadStats(result.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
      setLoading(false);
    }
  };

  const statCards = stats ? [
    ['Games played', stats.gamesPlayed], ['Villages created', stats.villagesCreated], ['Average group size', stats.averageGroupSize.toFixed(1)], ['Citizen wins', stats.citizenWins], ['Traitor wins', stats.traitorWins], ['Completed games', stats.completedGames], ['Left unfinished', stats.abandonedGames], ['Completion rate', `${Math.round(stats.completionRate * 100)}%`], ['Feedback received', stats.feedbackReceived]
  ] : [];

  return <Page>
    <IconButton aria-label="Back" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}><ArrowBack /></IconButton>
    <Stack className="app-panel" gap={2}>
      <Typography variant="h2">Admin Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!token && <Paper className="game-card screen-panel" sx={{ p: 2.5 }}><Stack component="form" gap={2} onSubmit={login}><TextField label="Admin password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus /><Button className="action-button" startIcon={<LockOpen />} type="submit" variant="contained" disabled={loading || !password}>Unlock dashboard</Button></Stack></Paper>}
      {token && <>
        <Stack className="admin-stat-grid">{statCards.map(([label, value]) => <Paper key={label} className="game-card admin-stat-card" sx={{ p: 2 }}><Typography color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography></Paper>)}</Stack>
        <Button variant="outlined" onClick={() => void loadStats()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh stats'}</Button>
        <Typography color="text.secondary">{stats?.lastUpdatedAt ? `Last updated ${new Date(stats.lastUpdatedAt).toLocaleString()}` : 'No activity yet.'}</Typography>
        {Boolean(stats?.feedback.length) && <><Typography variant="h5">Latest feedback</Typography><Stack gap={1}>{stats?.feedback.map((item) => <Paper key={`${item.createdAt}-${item.name}`} className="game-card" sx={{ p: 2 }}><Typography fontWeight={800}>{item.name}</Typography>{item.contact && <Typography color="text.secondary">{item.contact}</Typography>}<Typography mt={0.6}>{item.message}</Typography></Paper>)}</Stack></>}
      </>}
    </Stack>
  </Page>;
}
