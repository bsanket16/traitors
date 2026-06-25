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

const storageKey = 'traitors.session';
const sessionId = localStorage.getItem('traitors.sessionId') ?? crypto.randomUUID();
localStorage.setItem('traitors.sessionId', sessionId);

const saveSession = (state: ClientGameState) => {
  localStorage.setItem(storageKey, JSON.stringify({ roomId: state.roomId, playerId: state.currentPlayerId }));
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
    socket.on('gameState', (state) => {
      saveSession(state);
      set({ state, error: null });
    });
    socket.on('toast', (toast) => set({ toast }));
    socket.on('playerDisconnected', (name) => set({ toast: `${name} disconnected` }));
  },
  createRoom: async (name) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('createRoom', { name, sessionId }, callback));
    return handleResponse(set, response);
  },
  joinRoom: async (name, roomId) => {
    get().connect();
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('joinRoom', { name, roomId, sessionId }, callback));
    return handleResponse(set, response);
  },
  reconnect: async () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return false;
    get().connect();
    set({ loading: true, error: null });
    const { roomId, playerId } = JSON.parse(saved) as { roomId: string; playerId: string };
    const response = await request<ClientGameState>((callback) => socket.emit('reconnectPlayer', { roomId, playerId, sessionId }, callback));
    return handleResponse(set, response);
  },
  action: async (name) => {
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit(name, callback));
    return handleResponse(set, response);
  },
  submitKillVote: async (targetId) => {
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitKillVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  submitSaveVote: async (targetId) => {
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitSaveVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  submitEliminationVote: async (targetId) => {
    set({ loading: true, error: null });
    const response = await request<ClientGameState>((callback) => socket.emit('submitEliminationVote', { targetId }, callback));
    return handleResponse(set, response);
  },
  clearToast: () => set({ toast: null, error: null })
}));
