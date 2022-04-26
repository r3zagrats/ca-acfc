require('dotenv').config();
const { createClient } = require('redis');

const client = createClient({
  url: process.env.PSQL_HEROKU_HEROKU_CONNECTION_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

client.on('ready', () => {
  console.log('\nconnection ready')
})

client.on('end', () => {
  console.log('\nclose connection')
})

client.on('error', (err) => console.log('\nRedis Client Error', err));

module.exports = client;
