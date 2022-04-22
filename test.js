require('dotenv').config();
const redisClient = require('./redis');
const asyncGet = require('./utils/async-http-get');
const fs = require('fs');
const superagent = require('superagent');
const RestClient = require('./utils/sfmc-client');
(async () => {
  const data = await RestClient.getJourney('DEAudience-c89cc239-cd50-c0d1-8491-0dbc5a48a595')
  console.log(data.body);
})().catch((err) => console.log({ status: 'error', message: err }));

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}