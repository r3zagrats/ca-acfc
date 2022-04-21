const redisClient = require('./redis');

(async () => {
  await redisClient.connect()
  
  const [ ping, get, quit] = await Promise.all([
    redisClient.ping(),
    redisClient.get('key'),
    redisClient.quit()
  ])
  console.log(get)
})();

