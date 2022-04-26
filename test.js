const redisClient = require('./db/redis')

;(async () => {
  await redisClient.connect();
  const result = await redisClient.get('key');
  console.log(result);
  await redisClient.quit()
})()