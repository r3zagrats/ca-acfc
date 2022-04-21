const { createClient } = require('redis');

const client = createClient({
  url: 'redis://:ped7fa24fe4f7138a5db1b0a6c682e38348d31d120b01754a7168aa1c6f996375@ec2-54-227-24-175.compute-1.amazonaws.com:29620',
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

client.on('ready', () => {
  console.log('connection ready')
})

client.on('end', () => {
  console.log('close connection')
})

client.on('error', (err) => console.log('Redis Client Error', err));

module.exports = client;
