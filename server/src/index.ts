import { createServer } from 'http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { RoomManager } from './rooms';

const PORT = Number(process.env.PORT) || 3001;

const httpServer = createServer((req, res) => {
  // Simple health check for hosting platforms.
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Quiz Clash server is running');
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

const manager = new RoomManager(io);
io.on('connection', (socket) => manager.attach(socket));

httpServer.listen(PORT, () => {
  console.log(`Quiz Clash server listening on http://localhost:${PORT}`);
});
