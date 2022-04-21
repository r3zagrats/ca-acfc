require('dotenv').config();
const redisClient = require('./redis');
const asyncGet = require('./utils/async-http-get');
const fs = require('fs');
const superagent = require('superagent');
(async () => {
  let response = await superagent
  .post(process.env.ZALO_OAUTH_URL)
  .set('secret_key', process.env.ZALO_APP_SECRET_KEY)
  .send(`refresh_token=Y3pSgjR-5b-p6EMGs-HPCvHMl9kGea4K_LIaeUMUQG29RhR3q8Pu789F_AxnmHqHpmxad9cCEIMNVyE4-u4SGQXfwOcmadm1yHcRglVcRXICER-Mhjzn4uiwwvUEd4O7eoAizf364Gs3CVoFtCOP2jrzix6BZ61_s6oLjxEb01wqBTI9fUSQo-f4g5dKWc9RMTiKhJaBq7CmXZBJCXcqQLUA8F1POhbgBeqZhp0TwXnqdmktNbacnSob1BJn5Zu`)
  .send(`app_id=${process.env.ZALO_APP_ID}`)
  .send('grant_type=refresh_token');
  console.log(response.body);
})();
