const Redis = require('ioredis');

// Create a single Redis connection with retry strategy
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PWD,
  tls: true,
  maxRetriesPerRequest: null,
  retryStrategy: function (times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: 10000, // 10 seconds
  keepAlive: 30000, // 30 seconds
  reconnectOnError: function (err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

redisClient.on('reconnecting', (times) => {
  console.log(`[Redis] Reconnecting... Attempt ${times}`);
});

redisClient.on('close', () => {
  console.log('[Redis] Connection closed');
});

// Handle process termination
process.on('SIGINT', () => {
  redisClient.quit().then(() => {
    console.log('[Redis] Connection closed on process termination');
    process.exit(0);
  });
});

// Add a ping function to check connection
const checkConnection = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Ping failed:', error);
    return false;
  }
};

module.exports = {
  client: redisClient,
  checkConnection
};