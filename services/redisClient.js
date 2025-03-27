const Redis = require('ioredis');

// Create a single Redis connection
const redisClient = new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    username:process.env.REDIS_USER,
    password:process.env.REDIS_PWD,
    tls: true,
    maxRetriesPerRequest: null, // Helps avoid certain connection issues
  });


module.exports = redisClient;