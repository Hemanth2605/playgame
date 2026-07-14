import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

// In dev the server runs on port 3001 of the same machine that serves the app.
// For a deployed setup, set VITE_SERVER_URL to the server's public URL.
//
// Trim it and drop any trailing slash: the value is typed into a hosting
// dashboard, and a stray space makes the browser resolve the host as "%20https"
// and every connection fails.
const configured = (import.meta.env.VITE_SERVER_URL ?? '').trim().replace(/\/+$/, '');

const URL: string = configured || `${location.protocol}//${location.hostname}:3001`;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL);
