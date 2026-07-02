import morgan from 'morgan';
import logger from '../config/logger.js';

// Format morgan logs to stream into pino
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

export default requestLogger;
