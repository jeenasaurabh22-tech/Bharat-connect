import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import userRepository from '../repositories/UserRepository.js';
import logger from '../config/logger.js';
let io = null;
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      if (v.length === 2) {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      }
      return acc;
    }, {});
};
export const initSocket = (httpServer, corsOptions) => {
  io = new Server(httpServer, {
    cors: corsOptions,
  });
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }
      if (!token) {
        logger.warn('Socket connection rejected: No authentication token provided.');
        return next(new Error('Authentication error: Token missing'));
      }
      const decoded = verifyAccessToken(token);
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        logger.warn('Socket connection rejected: User no longer exists.');
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      logger.error(`Socket authentication failed: ${error.message}`);
      return next(new Error('Authentication error: Invalid token'));
    }
  });
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`Socket Connected: User ${socket.user.name} (${userId}) joined with socket ID ${socket.id}`);
    socket.join(`user:${userId}`);
    socket.join(`role:${socket.user.role}`);
    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: User ${socket.user.name} (${userId}) disconnected.`);
    });
  });
  return io;
};
export const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
};