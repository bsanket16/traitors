import type { ClientGameState, Phase, PublicPlayer, RevealedPlayer, Role, RoundResult, Winner } from '../shared/types.js';
import { recordGameAbandoned, recordGameCompleted, recordGameStarted, recordVillageCreated } from './analytics.js';

interface Player {
  id: string;
  sessionId: string;
  socketId: string;
  name: string;
  role: Role | null;
  isHost: boolean;
  isAlive: boolean;
  isConnected: boolean;
  hasSeenRole: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  currentRound: number;
  phase: Phase;
  doctorExists: boolean;
  killVotes: Map<string, string>;
  saveVotes: Map<string, string>;
  eliminationVotes: Map<string, string>;
  councilStartedWithAlive: number | null;
  pendingNightResult: RoundResult | null;
  lastResult: RoundResult | null;
  winner: Winner;
  gameStartedLogged: boolean;
  gameFinalized: boolean;
}

const rooms = new Map<string, Room>();

const randomId = (length: number) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const createRoomId = () => {
  let id = randomId(5);
  while (rooms.has(id)) id = randomId(5);
  return id;
};

const normalizedName = (name: string) => name.trim().toLocaleLowerCase();

const publicPlayer = (player: Player): PublicPlayer => ({
  id: player.id,
  name: player.name,
  isHost: player.isHost,
  isAlive: player.isAlive,
  isConnected: player.isConnected,
  hasSeenRole: player.hasSeenRole
});

const alivePlayers = (room: Room) => [...room.players.values()].filter((player) => player.isAlive);
const connectedAlivePlayers = (room: Room) => alivePlayers(room).filter((player) => player.isConnected);
const livingNonTraitors = (room: Room) => alivePlayers(room).filter((player) => player.role !== 'traitor').length;
const livingTraitors = (room: Room) => alivePlayers(room).filter((player) => player.role === 'traitor').length;

const requiredVotes = (room: Room) => Math.max(1, connectedAlivePlayers(room).length);
const submittedVotes = (room: Room, votes: Map<string, string>) =>
  [...votes.keys()].filter((playerId) => {
    const player = room.players.get(playerId);
    return Boolean(player?.isAlive && player.isConnected);
  }).length;

const shuffle = <T>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const getPendingCounts = (room: Room) => {
  if (room.phase === 'kill') return { submitted: submittedVotes(room, room.killVotes), required: requiredVotes(room) };
  if (room.phase === 'save') return { submitted: submittedVotes(room, room.saveVotes), required: requiredVotes(room) };
  if (room.phase === 'voting') return { submitted: submittedVotes(room, room.eliminationVotes), required: requiredVotes(room) };
  return null;
};

const connectedPlayersHaveSeenRoles = (room: Room) => {
  const connectedPlayers = [...room.players.values()].filter((player) => player.isConnected);
  return connectedPlayers.length > 0 && connectedPlayers.every((player) => player.hasSeenRole);
};

export const getRoom = (roomId: string) => rooms.get(roomId.toUpperCase()) ?? null;

export const getPlayerBySocket = (socketId: string) => {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.isConnected && player.socketId === socketId) return { room, player };
    }
  }
  return null;
};

export const hasConnectedPlayers = (room: Room) => [...room.players.values()].some((player) => player.isConnected);

export const buildState = (room: Room, playerId: string): ClientGameState => {
  const player = room.players.get(playerId);
  if (!player) throw new Error('Player not found');

  const revealRoles = room.phase === 'gameOver';

  return {
    roomId: room.id,
    hostId: room.hostId,
    players: [...room.players.values()].map(publicPlayer),
    currentPlayerId: player.id,
    currentPlayerRole: player.role,
    currentRound: room.currentRound,
    phase: player.isAlive ? room.phase : room.phase === 'gameOver' ? 'gameOver' : room.phase,
    doctorExists: room.doctorExists,
    winner: room.winner,
    lastResult: room.lastResult,
    revealedRoles: revealRoles
      ? [...room.players.values()].map((roomPlayer): RevealedPlayer => ({ ...publicPlayer(roomPlayer), role: roomPlayer.role ?? 'innocent' }))
      : null,
    submitted: {
      kill: room.killVotes.has(player.id),
      save: room.saveVotes.has(player.id),
      elimination: room.eliminationVotes.has(player.id)
    },
    pendingCounts: getPendingCounts(room)
  };
};

export const createRoom = (name: string, socketId: string, sessionId: string) => {
  const roomId = createRoomId();
  const playerId = randomId(12);
  const player: Player = {
    id: playerId,
    sessionId,
    socketId,
    name: name.trim(),
    role: null,
    isHost: true,
    isAlive: true,
    isConnected: true,
    hasSeenRole: false
  };

  const room: Room = {
    id: roomId,
    hostId: playerId,
    players: new Map([[playerId, player]]),
    currentRound: 1,
    phase: 'lobby',
    doctorExists: false,
    killVotes: new Map(),
    saveVotes: new Map(),
    eliminationVotes: new Map(),
    councilStartedWithAlive: null,
    pendingNightResult: null,
    lastResult: null,
    winner: null,
    gameStartedLogged: false,
    gameFinalized: false
  };

  rooms.set(roomId, room);
  recordVillageCreated();
  return { room, player };
};

export const joinRoom = (roomId: string, name: string, socketId: string, sessionId: string) => {
  const room = getRoom(roomId);
  if (!room) throw new Error('Room not found');
  if (room.phase !== 'lobby') throw new Error('This game has already started');
  if (room.players.size >= 12) throw new Error('Room is full');
  if ([...room.players.values()].some((player) => normalizedName(player.name) === normalizedName(name))) {
    throw new Error('That name is already taken in this village. Choose another.');
  }

  const playerId = randomId(12);
  const player: Player = {
    id: playerId,
    sessionId,
    socketId,
    name: name.trim(),
    role: null,
    isHost: false,
    isAlive: true,
    isConnected: true,
    hasSeenRole: false
  };

  room.players.set(playerId, player);
  return { room, player };
};

export const reconnectPlayer = (roomId: string, playerId: string, socketId: string, sessionId?: string) => {
  const room = getRoom(roomId);
  const player = room?.players.get(playerId);
  if (!room || !player) throw new Error('Could not reconnect to that room');
  if (sessionId && player.sessionId && player.sessionId !== sessionId) throw new Error('That village session belongs to another device');

  player.socketId = socketId;
  player.sessionId = sessionId ?? player.sessionId;
  player.isConnected = true;
  return { room, player };
};

export const disconnectPlayer = (socketId: string) => {
  const match = getPlayerBySocket(socketId);
  if (!match) return null;
  match.player.isConnected = false;
  match.player.socketId = '';
  return match;
};

export const leaveRoom = (socketId: string) => {
  const match = getPlayerBySocket(socketId);
  if (!match) return null;
  const { room, player } = match;

  if (room.phase !== 'lobby') {
    player.isConnected = false;
    player.socketId = '';
    return { room, player };
  }

  room.players.delete(player.id);
  if (player.isHost) {
    const nextHost = room.players.values().next().value as Player | undefined;
    if (nextHost) {
      nextHost.isHost = true;
      room.hostId = nextHost.id;
    }
  }
  if (room.players.size === 0) rooms.delete(room.id);
  return { room, player };
};

export const startGame = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer can begin the game');
  if (room.players.size < 4) throw new Error('The Traitor needs at least 4 players');
  if (room.phase !== 'lobby') throw new Error('Game already started');

  const players = shuffle([...room.players.values()]);
  room.doctorExists = players.length >= 6;
  players.forEach((player) => {
    player.role = 'innocent';
    player.isAlive = true;
    player.hasSeenRole = false;
  });
  players[0].role = 'traitor';
  if (room.doctorExists) players[1].role = 'doctor';
  room.phase = 'roleReveal';
  room.currentRound = 1;
  room.killVotes.clear();
  room.saveVotes.clear();
  room.eliminationVotes.clear();
  room.councilStartedWithAlive = null;
  room.pendingNightResult = null;
  room.lastResult = null;
  room.winner = null;
  room.gameStartedLogged = true;
  room.gameFinalized = false;
  recordGameStarted(room.players.size);
  return room;
};

const finishGame = (room: Room, winner: Exclude<Winner, null>) => {
  room.winner = winner;
  room.phase = 'gameOver';
  if (room.gameStartedLogged && !room.gameFinalized) {
    room.gameFinalized = true;
    recordGameCompleted(winner);
  }
};

export const markGameAbandoned = (room: Room) => {
  if (!room.gameStartedLogged || room.gameFinalized || room.phase === 'gameOver') return;
  room.gameFinalized = true;
  recordGameAbandoned();
};

export const acknowledgeRole = (room: Room, playerId: string) => {
  const player = room.players.get(playerId);
  if (!player) throw new Error('Player not found');
  if (room.phase !== 'roleReveal') throw new Error('Roles are not being revealed now');
  player.hasSeenRole = true;
  if (connectedPlayersHaveSeenRoles(room)) room.phase = 'kill';
};

const checkTraitorWin = (room: Room) => {
  if (livingTraitors(room) >= livingNonTraitors(room)) {
    finishGame(room, 'traitor');
    return true;
  }
  return false;
};

export const submitKillVote = (room: Room, playerId: string, targetId: string) => {
  const player = room.players.get(playerId);
  const target = room.players.get(targetId);
  if (room.phase !== 'kill') throw new Error('Kill voting is not active');
  if (!player?.isAlive) throw new Error('Only alive players can vote');
  if (!target?.isAlive || target.id === player.id) throw new Error('Choose another alive player');
  if (room.killVotes.has(playerId)) throw new Error('You already submitted');
  room.killVotes.set(playerId, targetId);
  if (submittedVotes(room, room.killVotes) >= requiredVotes(room)) {
    if (room.doctorExists) room.phase = 'save';
    else resolveNight(room);
  }
};

export const submitSaveVote = (room: Room, playerId: string, targetId: string) => {
  const player = room.players.get(playerId);
  const target = room.players.get(targetId);
  if (room.phase !== 'save') throw new Error('Save voting is not active');
  if (!player?.isAlive) throw new Error('Only alive players can vote');
  if (!target?.isAlive || target.id === player.id) throw new Error('Choose another alive player');
  if (room.saveVotes.has(playerId)) throw new Error('You already submitted');
  room.saveVotes.set(playerId, targetId);
  if (submittedVotes(room, room.saveVotes) >= requiredVotes(room)) resolveNight(room);
};

export const resolveNight = (room: Room) => {
  const traitor = [...room.players.values()].find((player) => player.role === 'traitor');
  const doctor = [...room.players.values()].find((player) => player.role === 'doctor');
  const targetId = traitor ? room.killVotes.get(traitor.id) : null;
  const savedId = doctor ? room.saveVotes.get(doctor.id) : null;
  const target = targetId ? room.players.get(targetId) : null;
  const saved = Boolean(room.doctorExists && targetId && savedId === targetId);

  if (target && !saved) target.isAlive = false;

  room.pendingNightResult = {
    round: room.currentRound,
    eliminatedPlayerId: target && !saved ? target.id : null,
    eliminatedPlayerName: target && !saved ? target.name : null,
    message: saved || !target ? 'No one died tonight.' : `${target.name} was eliminated.`,
    tied: false,
    kind: 'night'
  };
  room.phase = 'result';
};

export const revealResult = (room: Room) => {
  if (room.phase !== 'result') throw new Error('There is no result to reveal');
  if (room.pendingNightResult) {
    room.lastResult = room.pendingNightResult;
    room.pendingNightResult = null;
  }
  if (!checkTraitorWin(room)) room.phase = 'discussion';
};

export const revealResultByOverseer = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer may continue');
  revealResult(room);
};

export const startVoting = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer may start voting');
  if (room.phase !== 'discussion') throw new Error('Discussion is not active');
  room.eliminationVotes.clear();
  room.councilStartedWithAlive = alivePlayers(room).length;
  room.phase = 'voting';
};

export const submitEliminationVote = (room: Room, playerId: string, targetId: string) => {
  const player = room.players.get(playerId);
  const target = room.players.get(targetId);
  if (room.phase !== 'voting') throw new Error('Elimination voting is not active');
  if (!player?.isAlive) throw new Error('Only alive players can vote');
  if (!target?.isAlive || target.id === player.id) throw new Error('Choose another alive player');
  if (room.eliminationVotes.has(playerId)) throw new Error('You already submitted');
  room.eliminationVotes.set(playerId, targetId);
  if (submittedVotes(room, room.eliminationVotes) >= requiredVotes(room)) resolveElimination(room);
};

export const advanceReadyPhase = (room: Room) => {
  if (room.phase === 'roleReveal' && connectedPlayersHaveSeenRoles(room)) room.phase = 'kill';
  if (room.phase === 'kill' && submittedVotes(room, room.killVotes) >= requiredVotes(room)) {
    if (room.doctorExists) room.phase = 'save';
    else resolveNight(room);
  }
  if (room.phase === 'save' && submittedVotes(room, room.saveVotes) >= requiredVotes(room)) resolveNight(room);
  if (room.phase === 'voting' && submittedVotes(room, room.eliminationVotes) >= requiredVotes(room)) resolveElimination(room);
};

export const eliminatePlayer = (room: Room, playerId: string, targetId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer can eliminate a player');
  const target = room.players.get(targetId);
  if (!target?.isAlive) throw new Error('Player is already eliminated');
  const finalCouncil = alivePlayers(room).length <= 4;
  target.isAlive = false;
  room.lastResult = {
    round: room.currentRound,
    eliminatedPlayerId: target.id,
    eliminatedPlayerName: target.name,
    message: `${target.name} was eliminated.`,
    tied: false,
    kind: 'vote'
  };
  if (target.role === 'traitor') {
    finishGame(room, 'innocents');
  } else if (finalCouncil) {
    finishGame(room, 'traitor');
  } else {
    checkTraitorWin(room);
  }
};

const resolveElimination = (room: Room) => {
  const finalCouncil = (room.councilStartedWithAlive ?? alivePlayers(room).length) <= 4;
  const tally = new Map<string, number>();
  for (const targetId of room.eliminationVotes.values()) tally.set(targetId, (tally.get(targetId) ?? 0) + 1);
  const highScore = Math.max(...tally.values());
  const leaders = [...tally.entries()].filter(([, votes]) => votes === highScore);

  if (leaders.length !== 1) {
    room.lastResult = {
      round: room.currentRound,
      eliminatedPlayerId: null,
      eliminatedPlayerName: null,
      message: finalCouncil
        ? 'The final Council failed to reveal the Traitor. The shadows take the room.'
        : 'The group could not reach a decision. No player was eliminated.',
      tied: true,
      kind: 'vote'
    };
    if (finalCouncil) {
      finishGame(room, 'traitor');
    } else {
      room.phase = 'result';
    }
    return;
  }

  const [targetId] = leaders[0];
  const target = room.players.get(targetId);
  if (!target) return;
  target.isAlive = false;
  room.lastResult = {
    round: room.currentRound,
    eliminatedPlayerId: target.id,
    eliminatedPlayerName: target.name,
    message: `${target.name} was eliminated.`,
    tied: false,
    kind: 'vote'
  };

  if (target.role === 'traitor') {
    finishGame(room, 'innocents');
    return;
  }
  if (finalCouncil) {
    finishGame(room, 'traitor');
    return;
  }
  if (!checkTraitorWin(room)) room.phase = 'result';
};

export const nextRound = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer may continue');
  if (room.phase === 'gameOver') return;
  if (room.phase !== 'result' && room.phase !== 'discussion') throw new Error('The next round is not ready');
  if (checkTraitorWin(room)) return;
  room.currentRound += 1;
  room.killVotes.clear();
  room.saveVotes.clear();
  room.eliminationVotes.clear();
  room.councilStartedWithAlive = null;
  room.pendingNightResult = null;
  room.phase = 'kill';
};

const resetRoomToLobby = (room: Room) => {
  for (const player of room.players.values()) {
    player.role = null;
    player.isAlive = true;
    player.hasSeenRole = false;
  }
  room.currentRound = 1;
  room.phase = 'lobby';
  room.doctorExists = false;
  room.killVotes.clear();
  room.saveVotes.clear();
  room.eliminationVotes.clear();
  room.councilStartedWithAlive = null;
  room.pendingNightResult = null;
  room.lastResult = null;
  room.winner = null;
};

export const resetToLobby = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer may start a new game');
  if (room.phase !== 'gameOver') throw new Error('New Game is available after the game ends');
  resetRoomToLobby(room);
};

export const restartGame = (room: Room, playerId: string) => {
  if (room.hostId !== playerId) throw new Error('Only the Overseer may restart');
  markGameAbandoned(room);
  resetRoomToLobby(room);
  startGame(room, playerId);
};
