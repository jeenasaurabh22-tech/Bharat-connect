import dotenv from 'dotenv';
dotenv.config();
let connectionConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};
let rawQueueUrl = process.env.REDIS_URL;
if (rawQueueUrl && (rawQueueUrl.includes('redis://') || rawQueueUrl.includes('rediss://'))) {
  const match = rawQueueUrl.match(/(rediss?:\/\/[^\s'"]+)/);
  if (match) {
    rawQueueUrl = match[1];
  }
}
if (rawQueueUrl) {
  try {
    const parsed = new URL(rawQueueUrl);
    connectionConfig.host = parsed.hostname;
    connectionConfig.port = parseInt(parsed.port || '6379', 10);
    if (parsed.password) {
      connectionConfig.password = decodeURIComponent(parsed.password);
    }
    if (parsed.protocol === 'rediss:') {
      connectionConfig.tls = {};
    }
  } catch (err) {
  }
}
export const queueConnection = connectionConfig;