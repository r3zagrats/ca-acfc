require('dotenv').config();
const fs = require('fs');

const superagent = require('superagent');
const JWT = require('../utils/jwtDecoder');
const FuelRestUtils = require('../services/fuel-rest');

const asyncGet = require('../utils/async-http-get');
const redisClient = require('../config/database/redis/redis.config');
const refreshZaloToken = require('../services/zalo/refreshZaloToken');

const IsExpiredToken = (timestamp) => {
  console.log('\nCurrent Time: ', new Date(Date.now()).toUTCString());
  console.log('Expired Time: ', new Date(timestamp).toUTCString());
  console.log(timestamp - Date.now());
  if (timestamp - Date.now() < 600000) return true;
  return false;
};

const transformContent = (input) => {
  Object.keys(input).forEach((key) => {
    input.ContentValue = input.ContentValue.replaceAll(`%%${key}%%`, input[key]);
  });
  return input.ContentValue;
};

const SFMCCAController = {
  /**
   * The Journey Builder calls this method for each contact processed by the journey.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  execute: async (req, res) => {
    const { inArguments : receivedData } = JWT(req.body);
    console.log('\nReceived Data:', receivedData[0]);

    console.log('\nReceived transformedContent:', receivedData[0].ContentValue)
    // Transform transformedContent
    let transformedContent = transformContent(receivedData[0]);

    console.log('\nTransformed transformedContent', transformedContent);
    try {
      switch (receivedData[0].Channels) {
        case 'Zalo Message': {
          transformedContent = JSON.parse(transformedContent);
          console.log('\nContent', transformedContent);
          // Query OA Info
          const tmpAccessToken = await refreshZaloToken(receivedData[0].Senders);
          console.log('\ntmpAccessToken: ', tmpAccessToken);
          if (transformedContent.type === 'AttachedFile') {
            // Check if file exists
            await redisClient.connect();
            let fileInfo = await redisClient.get(transformedContent.value.name);
            let tmpToken = '';
            if (fileInfo === null || IsExpiredToken(fileInfo.expires_in) === true) {
              console.log('\nfileInfo: ', fileInfo);
              const result = await asyncGet(transformedContent.value.url, transformedContent.value.name);
              console.log('\nresult: ', result);
              const file = fs.createReadStream(`./public/data/${transformedContent.value.name}`);
              const response = await superagent
                .post(
                  `${process.env.ZALO_UPLOAD_URL}${
                    transformedContent.value.extension === 'gif' ? 'gif' : 'file'
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
                transformedContent.value.name,
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
            if (transformedContent.value.extension === 'gif') {
              transformedContent.payloadData.message.attachment.payload.elements[0].attachment_id = tmpToken;
            } else {
              transformedContent.payloadData.message.attachment.payload.token = tmpToken;
            }
            await redisClient.quit();
          }
          transformedContent.payloadData.recipient.user_id = receivedData[0].DEFields;
          const zmContent = transformedContent.payloadData;
          console.log('\nzmContent:', JSON.stringify(zmContent));
          // Send Message
          const response = await superagent
            .post('https://openapi.zalo.me/v2.0/oa/message')
            .set('transformedContent-Type', 'application/json')
            .set('access_token', tmpAccessToken)
            .send(JSON.stringify(zmContent));
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          // if (znsSendLog.error !== 0) throw znsSendLog.message;
          const insertDEResponse = await FuelRestUtils.insertDEZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: receivedData[0].Senders,
                  ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
                  MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
                  UTCTime: new Date().toUTCString(),
                  Timestamp: new Date().getTime(),
                  StatusCode: znsSendLog.error,
                  ErrorMessage: znsSendLog.message,
                  Message: JSON.stringify(zmContent.message),
                },
              ],
            })
          );
          console.log(insertDEResponse.body);
          res.status(200).send({ Status: 'Successfull' });
          break;
        }
        case 'Zalo Notification Service': {
          transformedContent = JSON.parse(transformedContent);
          console.log('\nContent', transformedContent);
          const znsPayload = {
            username: process.env.ACFC_ZNS_USERNAME,
            mobile: receivedData[0].DEFields,
            bid: Date.now(),
            zns: {
              oa_id: receivedData[0].Senders,
              template_id: transformedContent.template_id,
              template_data: {
                ...transformedContent.template_data,
              },
            },
          };
          console.log('znsPayload:', znsPayload);
          const response = await superagent
            .post('https://cloud.vietguys.biz:4438/api/zalo/v1/send')
            .set('transformedContent-Type', 'application/json')
            .set('Authorization', `Bearer ${process.env.ACFC_ZNS_TOKEN}`)
            .send(JSON.stringify(znsPayload));
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          //   if (znsSendLog.error !== 0) throw znsSendLog.message;
          const insertDEResponse = await FuelRestUtils.insertDEZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: receivedData[0].Senders,
                  MsgId: znsSendLog.resultCode === 0 ? znsSendLog.transaction_id : '',
                  UTCTime: new Date().toUTCString(),
                  Timestamp: new Date().getTime(),
                  StatusCode: znsSendLog.resultCode,
                  ErrorMessage: znsSendLog.resultDesc,
                  Message: JSON.stringify(znsPayload),
                },
              ],
            })
          );
          console.log(insertDEResponse.body);
          res.status(200).send({ Status: 'Successfull' });
          break;
        }
        case 'Web Push Notification': {
          // console.log('\nWebpush method');
          // let FirebaseToken = receivedData[0].FirebaseToken;
          // if (FirebaseToken !== '') {
          //   var payload = {
          //     notification: JSON.parse(transformedContent),
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
          let result = await superagent
            .post('https://cloudsms.vietguys.biz:4438/api/index.php')
            .field('from', receivedData[0].Senders)
            .field('u', process.env.SMS_USER)
            .field('pwd', process.env.SMS_PWD)
            .field('phone', receivedData[0].DEFields)
            .field('sms', transformedContent)
            .field('bid', Date.now())
            .field('json', '1');
          result = JSON.parse(result.text);
          console.log('result', result);
          const insertDEResponse = await FuelRestUtils.insertDESMSSendLog(
            JSON.stringify({
              items: [
                {
                  Sender: transformedContent.from,
                  Receiver: receivedData[0].DEFields,
                  transformedContent: transformedContent.sms,
                  MsgId: result.msgid,
                  Status: result.error === 0 ? 'success' : 'error',
                  ErrorCode: result.error,
                  ErrorMsg: result.log,
                  UTCTime: new Date().toUTCString(),
                  Timestamp: new Date().getTime(),
                },
              ],
            })
          );
          console.log(insertDEResponse.body);
          res.status(200).send({ Status: 'Successful' });
          break;
        }
        default: {
          throw new Error('This Channel is not supported');
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: 'Error', message: error });
    }
  },

  /**
   * OAInfo that receives a notification when a user saves the journey.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  save: async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  },

  /**
   *  OAInfo that receives a notification when a user publishes the journey.
   * @param req
   * @param res
   */
  publish: async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  },

  /**
   *  OAInfo that receives a notification when a user publishes the journey.
   * @param req
   * @param res
   */
  stop: async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  },

  /**
   * OAInfo that receives a notification when a user performs
   * some validation as part of the publishing process.
   * @param req
   * @param res
   */
  validate: async (req, res) => {
    res.status(200).send({
      status: 'ok',
    });
  },
};

module.exports = SFMCCAController;
