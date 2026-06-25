import { Alert, Snackbar } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Page } from './components/Page';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { EliminatedPage } from './pages/EliminatedPage';
import { GameOverPage } from './pages/GameOverPage';
import { HomePage } from './pages/HomePage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { LobbyPage } from './pages/LobbyPage';
import { PhaseVotePage } from './pages/PhaseVotePage';
import { ResultPage } from './pages/ResultPage';
import { RoleRevealPage } from './pages/RoleRevealPage';
import { useGameStore } from './store/gameStore';
import type { Phase } from '../shared/types';

const phasePath: Record<Phase, string> = {
  lobby: '/lobby',
  roleReveal: '/role',
  kill: '/kill',
  save: '/save',
  result: '/result',
  discussion: '/discussion',
  voting: '/voting',
  gameOver: '/game-over'
};

function RequireGame({ children }: { children: JSX.Element }) {
  const state = useGameStore((store) => store.state);
  const reconnect = useGameStore((store) => store.reconnect);
  const loading = useGameStore((store) => store.loading);
  const location = useLocation();

  useEffect(() => {
    if (!state) void reconnect();
  }, [reconnect, state]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (state && state.phase !== 'lobby' && state.phase !== 'gameOver') {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [state]);

  if (!state) {
    return (
      <Page>
        <LoadingOverlay open={loading} />
      </Page>
    );
  }

  const currentPlayer = state.players.find((player) => player.id === state.currentPlayerId);
  const isOverseer = state.currentPlayerId === state.hostId;
  const targetPath = !currentPlayer?.isAlive && !isOverseer && state.phase !== 'result' && state.phase !== 'gameOver' ? '/eliminated' : phasePath[state.phase];
  if (location.pathname !== targetPath) return <Navigate to={targetPath} replace />;
  return children;
}

function AnimatedRoute({ children }: { children: JSX.Element }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const loading = useGameStore((store) => store.loading);
  const error = useGameStore((store) => store.error);
  const toast = useGameStore((store) => store.toast);
  const clearToast = useGameStore((store) => store.clearToast);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
          <Route path="/create" element={<AnimatedRoute><CreateRoomPage /></AnimatedRoute>} />
          <Route path="/join" element={<AnimatedRoute><JoinRoomPage /></AnimatedRoute>} />
          <Route path="/lobby" element={<RequireGame><Page><LobbyPage /></Page></RequireGame>} />
          <Route path="/role" element={<RequireGame><Page><RoleRevealPage /></Page></RequireGame>} />
          <Route path="/kill" element={<RequireGame><Page><PhaseVotePage kind="kill" /></Page></RequireGame>} />
          <Route path="/save" element={<RequireGame><Page><PhaseVotePage kind="save" /></Page></RequireGame>} />
          <Route path="/result" element={<RequireGame><Page><ResultPage /></Page></RequireGame>} />
          <Route path="/discussion" element={<RequireGame><Page><DiscussionPage /></Page></RequireGame>} />
          <Route path="/voting" element={<RequireGame><Page><PhaseVotePage kind="elimination" /></Page></RequireGame>} />
          <Route path="/eliminated" element={<RequireGame><Page><EliminatedPage /></Page></RequireGame>} />
          <Route path="/game-over" element={<RequireGame><Page><GameOverPage /></Page></RequireGame>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <LoadingOverlay open={loading} />
      <Snackbar open={Boolean(error || toast)} autoHideDuration={3600} onClose={clearToast}>
        <Alert severity={error ? 'error' : 'info'} onClose={clearToast}>{error || toast}</Alert>
      </Snackbar>
    </>
  );
}
