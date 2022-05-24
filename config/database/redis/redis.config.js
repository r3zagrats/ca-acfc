require('dotenv').config();
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.PSQL_HEROKU_REDIS_CONNECTION_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.on('ready', () => {
  console.log('\nconnection ready')
})

redisClient.on('end', () => {
  console.log('\nclose connection')
})

redisClient.on('error', (err) => console.log('\nSome error occurred while connecting to Redis server', err));

module.exports = redisClient;
