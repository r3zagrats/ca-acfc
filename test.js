require('dotenv').config();
const redisClient = require('./redis');
const asyncGet = require('./utils/async-http-get');
const fs = require('fs');
const superagent = require('superagent');
const RestClient = require('./utils/sfmc-client');
const getCustomContent = async () => {
  const result = await superagent.get('http://localhost:8080/api/getcustomcontent');
  return result.body
  // return new Promise((resolve, reject) => {
  //   resolve(result.body);
  // })
}
(async () => {
  const begin = Date.now()
  const response = await getCustomContent()
  console.log(response)
  const totalTime = Date.now() - begin 
  console.log('time:', totalTime)
})().catch((err) => console.log({ status: 'error', message: err }));