require('dotenv').config();
const redisClient = require('./redis');
const asyncGet = require('./utils/async-http-get');
const fs = require('fs');
const superagent = require('superagent');
(async () => {
  const result = await asyncGet(
    'http://image.mc.gimasys.com/lib/fe28117170640474731277/m/1/6ea1cd47-cc78-4399-833b-d2123dd6d118.gif',
    'test.gif'
  );
  console.log('result: ', result);
  const file = fs.createReadStream(`./public/data/test.gif`);
  const response = await superagent
    .post(`${process.env.ZALO_UPLOAD_URL}gif`)
    .set(
      'access_token',
      '5jBUQZQfSmWKqDXlDAnu21lNr6a-i0D9Mil9KH_R13Ldy_Oj6_Ww8Lh9v4CAyqLqBDIA47RjK2e5bFuo8kLMLM3qeKe-nN1-MU3GIHNO6onvgB8qF9XkMcQWndmLdXSOIwBdUXg1CHzwaE4eAR4tJ6UgxsiGXZbNJeJYRmY7DmXhdDjeEhyE25REr10QmNGDVTtPR3Fz3MbVWD0C7R5_RsQeZWa2Wo4MRQFjTYwoDXDQkUeg7vGc2aQJz6bek4162uYEHbkUGc0FdhL1Vuv1V0scgtvMssWR2iMLDMJEKpC2ml83Lj8P13FIupfFtW0eFSVj2Hp46XGzlkeEIfG07HFltNfEpn0OSHP9cLOqjNKC'
    )
    .set('content-type', 'multipart/form-data')
    .field('file', file);
  console.log('response', response.text);
})();
