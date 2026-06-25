import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, SocketResponse } from '../shared/types.js';
import {
  acknowledgeRole,
  buildState,
  createRoom,
  disconnectPlayer,
  eliminatePlayer,
  getPlayerBySocket,
  joinRoom,
  leaveRoom,
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

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
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

app.get('/health', (_request, response) => response.json({ ok: true }));

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

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name, sessionId }, callback) => {
    handle(callback, () => {
      if (!name.trim()) throw new Error('Enter your name');
      const { room, player } = createRoom(name, socket.id, sessionId ?? socket.id);
      socket.join(room.id);
      return buildState(room, player.id);
    });
  });

  socket.on('joinRoom', ({ name, roomId, sessionId }, callback) => {
    handle(callback, () => {
      if (!name.trim()) throw new Error('Enter your name');
      if (!roomId.trim()) throw new Error('Enter a room code');
      const { room, player } = joinRoom(roomId, name, socket.id, sessionId ?? socket.id);
      socket.join(room.id);
      broadcastState(room.id);
      return buildState(room, player.id);
    });
  });

  socket.on('reconnectPlayer', ({ roomId, playerId, sessionId }, callback) => {
    handle(callback, () => {
      const { room, player } = reconnectPlayer(roomId, playerId, socket.id, sessionId);
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
      socket.to(match.room.id).emit('playerDisconnected', match.player.name);
      broadcastState(match.room.id);
    }
  });
});

server.listen(port, () => {
  console.log(`Traitors server listening on http://localhost:${port}`);
});
