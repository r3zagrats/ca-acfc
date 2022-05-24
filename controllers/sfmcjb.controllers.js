'use strict';
require('dotenv').config();
const JWT = require('../utils/jwtDecoder');
//const queue = require('../routes/queue');
// const admin = require('../firebase');
const superagent = require('superagent');
const fuelSDKClient = require('../config/sfmc/fuel-sdk/fuel-sdk.config');
const fsPromises = require('fs/promises');
// const { Storage } = require('@google-cloud/storage');
// const bucketName = 'crucial-zodiac-341510.appspot.com';

// const storage = new Storage();
// const pgClient = require('../config/database/postgresql/postgresql.config');
const asyncGet = require('../utils/async-http-get');
const fs = require('fs');
const redisClient = require('../config/database/redis/redis.config');
const refreshZaloToken = require('../services/zalo/refreshZaloToken');

class SFMCCAController {
  /**
   * The Journey Builder calls this method for each contact processed by the journey.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  execute = async (req, res) => {
    const data = JWT(req.body);
    console.log('\ndata.inArguments: ', data.inArguments[0]);

    let Content = data.inArguments[0].ContentValue;
    // Handle Content
    for (const [key, value] of Object.entries(data.inArguments[0])) {
      Content = Content.replaceAll(`%%${key}%%`, value);
    }
    console.log('\nContent', Content);
    Content = JSON.parse(Content);
    try {
      switch (data.inArguments[0].Channels) {
        case 'Zalo Message': {
          // Query OA Info
          const tmpAccessToken = await refreshZaloToken(data.inArguments[0].Endpoints);
          console.log('\ntmpAccessToken: ', tmpAccessToken);
          if (Content.type === 'AttachedFile') {
            // Check if file exists
            await redisClient.connect();
            let fileInfo = await redisClient.get(Content.value.name);
            let tmpToken = '';
            if (fileInfo === null || IsExpiredToken(fileInfo.expires_in) === true) {
              console.log('\nfileInfo: ', fileInfo);
              const result = await asyncGet(Content.value.url, Content.value.name);
              console.log('\nresult: ', result);
              const file = fs.createReadStream(`./public/data/${Content.value.name}`);
              const response = await superagent
                .post(
                  `${process.env.ZALO_UPLOAD_URL}${
                    Content.value.extension === 'gif' ? 'gif' : 'file'
                  }`
                )
                .set('access_token', tmpAccessToken)
                .set('content-type', 'multipart/form-data')
                .field('file', file);
              console.log('\nresponse', response.body);
              if (response.body.error === 0) {
                tmpToken = response.body.data.token || response.body.data.attachment_id;
              } else {
                throw response.body.message;
              }
              await redisClient.set(
                Content.value.name,
                JSON.stringify({
                  token: tmpToken,
                  expires_in: Date.now() + 604800000,
                })
              );
            } else {
              console.log('\nfileInfo: ', fileInfo);
              fileInfo = JSON.parse(fileInfo);
              tmpToken = fileInfo.token;
            }
            console.log('\ntmpToken:', tmpToken);
            if (Content.value.extension === 'gif') {
              Content.payloadData.message.attachment.payload.elements[0].attachment_id = tmpToken;
            } else {
              Content.payloadData.message.attachment.payload.token = tmpToken;
            }
            await redisClient.quit();
          }
          let znsContent = Content.payloadData;
          console.log('\nznsContent:', JSON.stringify(znsContent));
          // Send Message
          const response = await superagent
            .post('https://openapi.zalo.me/v2.0/oa/message')
            .set('Content-Type', 'application/json')
            .set('access_token', tmpAccessToken)
            .send(JSON.stringify(znsContent));
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          if (znsSendLog.error !== 0) throw znsSendLog.message;
          const firstStep = await fuelSDKClient.insertZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: data.inArguments[0].Endpoints,
                  ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
                  MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
                  UTCTime: new Date().toUTCString(),
                  Timestamp: new Date().getTime(),
                  StatusCode: znsSendLog.error,
                  ErrorMessage: znsSendLog.message,
                  Message: JSON.stringify(znsContent.message),
                },
              ],
            })
          );
          res.status(200).send({ Status: 'Successfull' });
          break;
        }
        case 'Zalo Notification Service': {
          const tmpAccessToken = await refreshZaloToken(data.inArguments[0].Endpoints);
          console.log('\ntmpAccessToken: ', tmpAccessToken);
          console.log('ZNS content', { ...Content, tracking_id: Date.now() });
          const response = await superagent
            .post('https://business.openapi.zalo.me/message/template')
            .set('Content-Type', 'application/json')
            .set('access_token', tmpAccessToken)
            .send(JSON.stringify({ ...Content, tracking_id: Date.now() }));
          console.log('response', response.body);
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          if (znsSendLog.error !== 0) throw znsSendLog.message;
          const firstStep = await fuelSDKClient.insertZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: data.inArguments[0].Endpoints,
                  MsgId: znsSendLog.error === 0 ? znsSendLog.data.msg_id : '',
                  UTCTime: new Date().toUTCString(),
                  Timestamp: new Date().getTime(),
                  StatusCode: znsSendLog.error,
                  ErrorMessage: znsSendLog.message,
                  Message: JSON.stringify({ ...Content, tracking_id: Date.now() }),
                },
              ],
            })
          );
          res.status(200).send({ Status: 'Successfull' });
          break;
        }
        case 'Web Push Notification': {
          // console.log('\nWebpush method');
          // let FirebaseToken = data.inArguments[0].FirebaseToken;
          // if (FirebaseToken !== '') {
          //   var payload = {
          //     notification: JSON.parse(Content),
          //   };
          //   admin
          //     .messaging()
          //     .sendToDevice(FirebaseToken, payload)
          //     .then((response) => {
          //       console.log('\nSent successfully.\n');
          //       console.log(response);
          //     })
          //     .catch((error) => {
          //       console.log('\nSent failed.\n');
          //       console.log(error);
          //     });
          // }
          console.log('\nThis is Web Push Notification Channel.');
          res.status(200).send({ Status: 'Successful' });
          break;
        }
        case 'SMS': {
          console.log('\nThis is SMS Channel.');
          res.status(200).send({ Status: 'Successful' });
          break;
        }
        default: {
          throw 'This Channel is not supported';
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: 'Error', message: error });
    }
  };

  /**
   * OAInfo that receives a notification when a user saves the journey.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  save = async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  };

  /**
   *  OAInfo that receives a notification when a user publishes the journey.
   * @param req
   * @param res
   */
  publish = async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  };

  /**
   *  OAInfo that receives a notification when a user publishes the journey.
   * @param req
   * @param res
   */
  stop = async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  };

  /**
   * OAInfo that receives a notification when a user performs
   * some validation as part of the publishing process.
   * @param req
   * @param res
   */
  validate = async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  };
}

module.exports = new SFMCCAController();
