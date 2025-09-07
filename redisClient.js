const Redis = require('ioredis');
const redis = new Redis({
    port: 6379, 
    host: 'localhost',  
});
redis.on('connect', () => {
    // console.log('Connected to Redis!');
});

redis.on('error', (err) => {
    // console.error('Redis error:', err);
});

module.exports = redis;