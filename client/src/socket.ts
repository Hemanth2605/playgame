import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

// In dev the server runs on port 3001 of the same machine that serves the app.
// For a deployed setup, set VITE_SERVER_URL to the server's public URL.
const URL: string =
  import.meta.env.VITE_SERVER_URL ?? `${location.protocol}//${location.hostname}:3001`;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL);
