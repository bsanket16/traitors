import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../shared/types';

const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2500,
  timeout: 8000
});
