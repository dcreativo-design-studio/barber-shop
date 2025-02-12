import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('newBooking', (data) => {
      io.emit('bookingUpdate', data);
    });
  });

  return io;
}
