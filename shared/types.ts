export type Role = 'traitor' | 'doctor' | 'innocent';
export type Phase = 'lobby' | 'roleReveal' | 'kill' | 'save' | 'result' | 'discussion' | 'voting' | 'gameOver';
export type Winner = 'traitor' | 'innocents' | null;

export interface PublicPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  isConnected: boolean;
  hasSeenRole: boolean;
}

export interface RevealedPlayer extends PublicPlayer {
  role: Role;
}

export interface RoundResult {
  round: number;
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  message: string;
  tied: boolean;
  kind: 'night' | 'vote';
}

export interface ClientGameState {
  roomId: string;
  hostId: string;
  players: PublicPlayer[];
  currentPlayerId: string;
  currentPlayerRole: Role | null;
  currentRound: number;
  phase: Phase;
  doctorExists: boolean;
  winner: Winner;
  lastResult: RoundResult | null;
  revealedRoles: RevealedPlayer[] | null;
  submitted: {
    kill: boolean;
    save: boolean;
    elimination: boolean;
  };
  pendingCounts: {
    submitted: number;
    required: number;
  } | null;
}

export interface SocketResponse<T = ClientGameState> {
  ok: boolean;
  state?: T;
  error?: string;
}

export interface ServerToClientEvents {
  gameState: (state: ClientGameState) => void;
  toast: (message: string) => void;
  playerDisconnected: (playerName: string) => void;
  gameOver: (state: ClientGameState) => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: { name: string; sessionId?: string }, callback: (response: SocketResponse) => void) => void;
  joinRoom: (payload: { name: string; roomId: string; sessionId?: string }, callback: (response: SocketResponse) => void) => void;
  reconnectPlayer: (payload: { roomId: string; playerId: string; sessionId?: string }, callback: (response: SocketResponse) => void) => void;
  leaveRoom: (callback: (response: SocketResponse<null>) => void) => void;
  startGame: (callback: (response: SocketResponse) => void) => void;
  assignRoles: (callback: (response: SocketResponse) => void) => void;
  acknowledgeRole: (callback: (response: SocketResponse) => void) => void;
  submitKillVote: (payload: { targetId: string }, callback: (response: SocketResponse) => void) => void;
  submitSaveVote: (payload: { targetId: string }, callback: (response: SocketResponse) => void) => void;
  revealResult: (callback: (response: SocketResponse) => void) => void;
  startVoting: (callback: (response: SocketResponse) => void) => void;
  submitEliminationVote: (payload: { targetId: string }, callback: (response: SocketResponse) => void) => void;
  eliminatePlayer: (payload: { targetId: string }, callback: (response: SocketResponse) => void) => void;
  nextRound: (callback: (response: SocketResponse) => void) => void;
  restartGame: (callback: (response: SocketResponse) => void) => void;
  newGame: (callback: (response: SocketResponse) => void) => void;
}
