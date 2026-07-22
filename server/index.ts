import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { randomBytes } from 'node:crypto';
import type { ClientToServerEvents, ServerToClientEvents, SocketResponse } from '../shared/types.js';
import type { Room } from './game.js';
import {
  acknowledgeRole,
  advanceReadyPhase,
  buildState,
  createRoom,
  disconnectPlayer,
  eliminatePlayer,
  getPlayerBySocket,
  joinRoom,
  leaveRoom,
  hasConnectedPlayers,
  markGameAbandoned,
  reconnectPlayer,
  revealResultByOverseer,
  resetToLobby,
  restartGame,
  startGame,
  startVoting,
  submitEliminationVote,
  submitKillVote,
  submitSaveVote,
  nextRound
} from './game.js';
import { getAnalytics, recordFeedback } from './analytics.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client');
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) throw new Error('ADMIN_PASSWORD must be set before starting the server.');
const adminTokens = new Set<string>();
const abandonedGameTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearAbandonedGameTimer = (roomId: string) => {
  const timer = abandonedGameTimers.get(roomId);
  if (timer) clearTimeout(timer);
  abandonedGameTimers.delete(roomId);
};

const scheduleAbandonedGameCheck = (room: Room) => {
  if (hasConnectedPlayers(room)) return;
  clearAbandonedGameTimer(room.id);
  abandonedGameTimers.set(room.id, setTimeout(() => {
    if (!hasConnectedPlayers(room)) markGameAbandoned(room);
    abandonedGameTimers.delete(room.id);
  }, 30 * 60 * 1000));
};

app.post('/api/feedback', async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const contact = typeof request.body?.contact === 'string' ? request.body.contact.trim() : '';
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
  if (!name || !message) return response.status(400).json({ error: 'Please enter your name and feedback.' });
  if (name.length > 80 || contact.length > 160 || message.length > 4000) return response.status(400).json({ error: 'Please shorten your feedback.' });
  try {
    await recordFeedback({ name, contact, message });
    return response.status(201).json({ ok: true });
  } catch (error) {
    console.error('Could not save feedback:', error);
    return response.status(503).json({ error: 'Feedback could not be saved. Please try again.' });
  }
});

app.post('/api/admin/login', (request, response) => {
  if (request.body?.password !== adminPassword) return response.status(401).json({ error: 'Incorrect password.' });
  const token = randomBytes(32).toString('hex');
  adminTokens.add(token);
  return response.json({ token });
});

app.get('/api/admin/stats', async (request, response) => {
  const token = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !adminTokens.has(token)) return response.status(401).json({ error: 'Admin access required.' });
  try {
    return response.json(await getAnalytics());
  } catch (error) {
    console.error('Could not load analytics:', error);
    return response.status(503).json({ error: 'Analytics are temporarily unavailable.' });
  }
});
app.use(express.static(clientDist));

app.get('/health', (_request, response) => response.json({ ok: true }));
app.get('*', (_request, response) => response.sendFile(path.join(clientDist, 'index.html')));

const port = Number(process.env.PORT ?? 3001);

const broadcastState = (roomId: string) => {
  const sockets = io.sockets.adapter.rooms.get(roomId);
  if (!sockets) return;

  for (const socketId of sockets) {
    const socket = io.sockets.sockets.get(socketId);
    const match = socket ? getPlayerBySocket(socket.id) : null;
    if (socket && match) socket.emit('gameState', buildState(match.room, match.player.id));
  }
};

const handle = <T>(callback: (response: SocketResponse<T>) => void, action: () => T) => {
  try {
    callback({ ok: true, state: action() });
  } catch (error) {
    callback({ ok: false, error: error instanceof Error ? error.message : 'Something went wrong' });
  }
};

const detachSocketFromCurrentRoom = (socketId: string) => {
  const previous = leaveRoom(socketId);
  if (!previous) return;
  socketId && io.sockets.sockets.get(socketId)?.leave(previous.room.id);
  broadcastState(previous.room.id);
  scheduleAbandonedGameCheck(previous.room);
};

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name, sessionId }, callback) => {
    handle(callback, () => {
      if (!name.trim()) throw new Error('Enter your name');
      detachSocketFromCurrentRoom(socket.id);
      const { room, player } = createRoom(name, socket.id, sessionId ?? socket.id);
      socket.join(room.id);
      return buildState(room, player.id);
    });
  });

  socket.on('joinRoom', ({ name, roomId, sessionId }, callback) => {
    handle(callback, () => {
      if (!name.trim()) throw new Error('Enter your name');
      if (!roomId.trim()) throw new Error('Enter a room code');
      detachSocketFromCurrentRoom(socket.id);
      const { room, player } = joinRoom(roomId, name, socket.id, sessionId ?? socket.id);
      socket.join(room.id);
      broadcastState(room.id);
      return buildState(room, player.id);
    });
  });

  socket.on('reconnectPlayer', ({ roomId, playerId, sessionId }, callback) => {
    handle(callback, () => {
      const current = getPlayerBySocket(socket.id);
      if (current && (current.room.id !== roomId || current.player.id !== playerId)) detachSocketFromCurrentRoom(socket.id);
      const { room, player } = reconnectPlayer(roomId, playerId, socket.id, sessionId);
      clearAbandonedGameTimer(room.id);
      socket.join(room.id);
      broadcastState(room.id);
      return buildState(room, player.id);
    });
  });

  socket.on('leaveRoom', (callback) => {
    handle(callback, () => {
      const match = leaveRoom(socket.id);
      if (match) {
        socket.leave(match.room.id);
        broadcastState(match.room.id);
        scheduleAbandonedGameCheck(match.room);
      }
      return null;
    });
  });

  socket.on('startGame', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      startGame(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('assignRoles', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      startGame(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('acknowledgeRole', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      acknowledgeRole(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('submitKillVote', ({ targetId }, callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      submitKillVote(match.room, match.player.id, targetId);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('submitSaveVote', ({ targetId }, callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      submitSaveVote(match.room, match.player.id, targetId);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('revealResult', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      revealResultByOverseer(match.room, match.player.id);
      broadcastState(match.room.id);
      if (match.room.phase === 'gameOver') io.to(match.room.id).emit('gameOver', buildState(match.room, match.player.id));
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('startVoting', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      startVoting(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('submitEliminationVote', ({ targetId }, callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      submitEliminationVote(match.room, match.player.id, targetId);
      broadcastState(match.room.id);
      if (match.room.phase === 'gameOver') io.to(match.room.id).emit('gameOver', buildState(match.room, match.player.id));
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('eliminatePlayer', ({ targetId }, callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      eliminatePlayer(match.room, match.player.id, targetId);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('nextRound', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      nextRound(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('restartGame', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      restartGame(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('newGame', (callback) => {
    handle(callback, () => {
      const match = getPlayerBySocket(socket.id);
      if (!match) throw new Error('You are not in a room');
      resetToLobby(match.room, match.player.id);
      broadcastState(match.room.id);
      return buildState(match.room, match.player.id);
    });
  });

  socket.on('disconnect', () => {
    const match = disconnectPlayer(socket.id);
    if (match) {
      advanceReadyPhase(match.room);
      socket.to(match.room.id).emit('playerDisconnected', match.player.name);
      broadcastState(match.room.id);
      scheduleAbandonedGameCheck(match.room);
    }
  });
});

server.listen(port, () => {
  console.log(`The Traitor server listening on http://localhost:${port}`);
});
