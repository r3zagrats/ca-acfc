const { v1: Uuidv1 } = require('uuid');
const JWT = require('../utils/jwtDecoder');
const logger = require('../utils/logger');
var request = require('../utils/await-request');
const neDB = require('./neDB');
const SFClient = require('../utils/sfmc-client');
//const queue = require('../routes/queue');
const api = require('../routes/api');
const admin = require('../firebase');
const superagent = require('superagent');
const RestClient = require('../utils/sfmc-client');
const fsPromises = require('fs/promises');
const { Storage } = require('@google-cloud/storage');
const bucketName = 'crucial-zodiac-341510.appspot.com';
const filePath = './log/ZNSsent.txt';
const destFileName = 'ZNSsent.txt';
const storage = new Storage();
/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.execute = async (req, res) => {
  try {
    const data = JWT(req.body);
    console.log('data.inArguments: ', data.inArguments[0]);
    const msgTypes = await neDB.getDB(data.inArguments[0].messType);
    let Content = data.inArguments[0].ContentBuilder;
    for (const [key, value] of Object.entries(data.inArguments[0])) {
      Content = Content.replace(
        new RegExp(`%%${key}%%`.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), 'g'),
        value
      );
    }
    switch (msgTypes[0].method) {
      case 'Zalo': {
        console.log('Gui tin nhan ZNS');
        let tmpAccessToken = msgTypes[0].accessToken;
        // if (data.inArguments[0].ZaloId !== '') {
        console.log('End Point: ', msgTypes[0]);
        if (checkIsExpiredAccessToken(Number(msgTypes[0].expiresTime))) {
          console.log(`Access Token cua  ${msgTypes[0].name} het han`);
          let response = await superagent
            .post(`${msgTypes[0].authUrl}`)
            .set('secret_key', msgTypes[0].appSecretKey)
            .send(`refresh_token=${msgTypes[0].refreshToken}`)
            .send(`app_id=${msgTypes[0].appId}`)
            .send('grant_type=refresh_token');
          response = JSON.parse(response.text);
          console.log(`AccessToken Response cua ${msgTypes[0].name}: "`, response);
          if (response.access_token) {
            tmpAccessToken = response.access_token;
            let updateInfo = {
              ...msgTypes[0],
              expiresTime: Date.now() + response.expires_in * 1000,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            };
            console.log(`updateInfo cua OA ${msgTypes[0].name}: `, updateInfo);
            const result = await superagent
              .put(`${req.headers.host || req.headers.origin}/db/service/`)
              .set('Authorization', `JWT ${process.env.JWT}`)
              .set('Content-Type', 'application/json')
              .send(JSON.stringify(updateInfo));
            console.log(`Cap nhat db thanh cong cho OA ${msgTypes[0].name}: `, result.text);
          }
          console.log('Da cap nhat accessToken');
        } else {
          console.log(`Access Token cua ${msgTypes[0].name} con han`);
        }
        console.log('Noi dung can gui: ', Content);
        console.log('tmpAccessToken: ', tmpAccessToken);
        const response = await superagent
          .post('https://openapi.zalo.me/v2.0/oa/message')
          .set('Content-Type', 'application/json')
          .set('access_token', tmpAccessToken)
          .send(Content);
        console.log('Response data: ', response.text);
        const znsSentTracking = JSON.parse(response.text);
        const temp = {
          MsgId: znsSentTracking.error === 0 ? znsSentTracking.data.message_id : '',
          ZaloId: znsSentTracking.error === 0 ? znsSentTracking.data.user_id : '',
          UTCTime: new Date().toUTCString(),
          Timestamp: new Date().getTime(),
          Error: znsSentTracking.error,
          Message: znsSentTracking.message,
        };
        const firstStep = RestClient.insertZaloSendLog(
          JSON.stringify({
            items: [temp],
          })
        );
        const secondStep = fsPromises.appendFile(
          './public/ZNSsent.txt',
          `, ${JSON.stringify(temp)} \n`
        );
        const thirdStep = storage.bucket(bucketName).upload(filePath, {
          destination: destFileName,
        });
        const finalResult = await Promise.all([firstStep, secondStep, thirdStep]);
        console.log(`${filePath} uploaded to ${bucketName}`);
        if (znsSentTracking.error === 0) {
          res.status(200).send({ Status: 'Accept' });
        } else {
          res.status(500).send({ Status: 'Error' });
        }
        // }
        break;
      }
      case 'Webpush': {
        console.log('Webpush method');
        let FirebaseToken = data.inArguments[0].FirebaseToken;
        if (FirebaseToken !== '') {
          for (const [key, value] of Object.entries(data.inArguments[0])) {
            Content = Content.replace(
              new RegExp(`%%${key}%%`.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), 'g'),
              value
            );
          }
          var payload = {
            notification: JSON.parse(Content),
          };
          admin
            .messaging()
            .sendToDevice(FirebaseToken, payload)
            .then((response) => {
              console.log('Sent successfully.\n');
              console.log(response);
            })
            .catch((error) => {
              console.log('Sent failed.\n');
              console.log(error);
            });
        }
        res.status(200).send({ Status: 'Accept' });
        break;
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ Status: 'Error' });
  }
};

/**
 * msgTypes[0] that receives a notification when a user saves the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.save = async (req, res) => {
  //console.log(req.body.toString());
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  msgTypes[0] that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  msgTypes[0] that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.stop = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 * msgTypes[0] that receives a notification when a user performs
 * some validation as part of the publishing process.
 * @param req
 * @param res
 */
exports.validate = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

const checkIsExpiredAccessToken = (tokenExpiresTime) => {
  console.log('Current Time: ', new Date(Date.now()));
  console.log('Expired Time: ', new Date(tokenExpiresTime));
  console.log(tokenExpiresTime - Date.now());
  if (tokenExpiresTime - Date.now() < 600000) return true;
  else return false;
};
