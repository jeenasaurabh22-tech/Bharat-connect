import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Handle case where statusCode is not defined (standard unhandled error)
  if (!statusCode) {
    statusCode = 500;
  }

  const response = {
    code: statusCode,
    message,
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Log error using Pino
  if (statusCode >= 500) {
    logger.error({ err, reqId: req.id }, `Unhandled Error: ${message}`);
  } else {
    logger.warn({ reqId: req.id }, `Client Error [${statusCode}]: ${message}`);
  }

  res.status(statusCode).send(response);
};

export default errorHandler;
