import { Server } from 'socket.io';
import MockAccount from '../models/mockAccount.js';

export const initWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('getAccountData', async (userId) => {
      try {
        const account = await MockAccount.findOne({ userId });
        if (account) {
          socket.emit('accountData', account);
        } else {
          socket.emit('error', 'Account not found');
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        socket.emit('error', 'Error fetching account data');
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};
