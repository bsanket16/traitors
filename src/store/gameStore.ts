import { create } from 'zustand';
import type { ClientGameState, SocketResponse } from '../../shared/types';
import { socket } from '../socket';

type ActionName =
  | 'startGame'
  | 'acknowledgeRole'
  | 'revealResult'
  | 'startVoting'
  | 'nextRound'
  | 'restartGame'
  | 'newGame';

interface GameStore {
  state: ClientGameState | null;
  loading: boolean;
  error: string | null;
  toast: string | null;
  sessionId: string;
  connect: () => void;
  createRoom: (name: string) => Promise<boolean>;
  joinRoom: (name: string, roomId: string) => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  action: (name: ActionName) => Promise<boolean>;
  submitKillVote: (targetId: string) => Promise<boolean>;
  submitSaveVote: (targetId: string) => Promise<boolean>;
  submitEliminationVote: (targetId: string) => Promise<boolean>;
  clearToast: () => void;
}

const storageKey = 'the-traitor.session';
const sessionIdKey = 'the-traitor.sessionId';
const sessionId = sessionStorage.getItem(sessionIdKey) ?? crypto.randomUUID();
sessionStorage.setItem(sessionIdKey, sessionId);
let reconnectInFlight: Promise<boolean> | null = null;

const saveSession = (state: ClientGameState) => {
  sessionStorage.setItem(storageKey, JSON.stringify({ roomId: state.roomId, playerId: state.currentPlayerId }));
};

const clearSession = () => {
  sessionStorage.removeItem(storageKey);
  localStorage.removeItem(storageKey);
  localStorage.removeItem(sessionIdKey);
};

const readSession = () => {
  const saved = sessionStorage.getItem(storageKey);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as { roomId?: string; playerId?: string };
    if (!parsed.roomId || !parsed.playerId) return null;
    return { roomId: parsed.roomId, playerId: parsed.playerId };
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
};

const request = <T>(send: (callback: (response: SocketResponse<T>) => void) => void) =>
  new Promise<SocketResponse<T>>((resolve) => send(resolve));

const handleResponse = (set: (partial: Partial<GameStore>) => void, response: SocketResponse<ClientGameState>) => {
  if (!response.ok || !response.state) {
    set({ error: response.error ?? 'Something went wrong', loading: false });
    return false;
  }
  saveSession(response.state);
  set({ state: response.state, error: null, loading: false });
  return true;
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  loading: false,
  error: null,
  toast: null,
  sessionId,
  connect: () => {
    if (!socket.connected) socket.connect();
    socket.off('gameState');
    socket.off('toast');
    socket.off('playerDisconnected');
    socket.off('connect');
    socket.off('connect_error');
    socket.on('gameState', (state) => {
      saveSession(state);
      set({ state, error: null, loading: false });
    });
    socket.on('toast', (toast) => set({ toast }));
    socket.on('playerDisconnected', (name) => set({ toast: `${name} disconnected` }));
    socket.on('connect', () => {
      if (readSession()) void get().reconnect();
    });
    socket.on('connect_error', () => {
      set({ loading: false, error: 'Connection lost. Trying to reconnect...' });
    });
  },
  createRoom: async (name) => {
    get().connect();
    clearSession();
    set({ state: null, loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('createRoom', { name, sessionId }, callback));
    return handleResponse(set, response);
  },
  joinRoom: async (name, roomId) => {
    get().connect();
    clearSession();
    set({ state: null, loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('joinRoom', { name, roomId, sessionId }, callback));
    return handleResponse(set, response);
  },
  reconnect: async () => {
    const saved = readSession();
    if (!saved) return false;
    if (reconnectInFlight) return reconnectInFlight;
    get().connect();
    set({ loading: true, error: null });
    reconnectInFlight = request<ClientGameState>((callback) => socket.emit('reconnectPlayer', { ...saved, sessionId }, callback))
      .then((response) => {
        const ok = handleResponse(set, response);
        if (!ok) clearSession();
        return ok;
      })
      .finally(() => {
        reconnectInFlight = null;
      });
    return reconnectInFlight;
  },
  action: async (name) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit(name, callback));
    return handleResponse(set, response);
  },
  submitKillVote: async (targetId) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitKillVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  submitSaveVote: async (targetId) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitSaveVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  submitEliminationVote: async (targetId) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitEliminationVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  clearToast: () => set({ toast: null, error: null })
}));
