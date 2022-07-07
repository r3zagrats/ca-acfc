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

const SFMCCAController = {
  /**
   * The Journey Builder calls this method for each contact processed by the journey.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  execute: async (req, res) => {
    const data = JWT(req.body);
    console.log('\ndata.inArguments: ', data.inArguments[0]);

    let Content = data.inArguments[0].ContentValue;
    // Handle Content
    Object.keys(data.inArguments[0]).forEach((key) => {
      Content = Content.replaceAll(`%%${key}%%`, data.inArguments[0][key]);
    });
    // for (const [key, value] of Object.entries(data.inArguments[0])) {
    //     Content = Content.replaceAll(`%%${key}%%`, value);
    // }
    Content = JSON.parse(Content);
    console.log('\nContent', Content);
    try {
      switch (data.inArguments[0].Channels) {
        case 'Zalo Message': {
          // Query OA Info
          const tmpAccessToken = await refreshZaloToken(data.inArguments[0].Senders);
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
          Content.payloadData.recipient.user_id = data.inArguments[0].DEFields;
          const zmContent = Content.payloadData;
          console.log('\nzmContent:', JSON.stringify(zmContent));
          // Send Message
          const response = await superagent
            .post('https://openapi.zalo.me/v2.0/oa/message')
            .set('Content-Type', 'application/json')
            .set('access_token', tmpAccessToken)
            .send(JSON.stringify(zmContent));
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          // if (znsSendLog.error !== 0) throw znsSendLog.message;
          const insertDEResponse = await FuelRestUtils.insertDEZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: data.inArguments[0].Senders,
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
          const znsPayload = {
            username: process.env.ACFC_ZNS_USERNAME,
            mobile: data.inArguments[0].DEFields,
            bid: Date.now(),
            zns: {
              oa_id: data.inArguments[0].Senders,
              template_id: Content.template_id,
              template_data: {
                ...Content.template_data,
              },
            },
          };

          console.log('znsPayload:', znsPayload);

          const response = await superagent
            .post('https://cloud.vietguys.biz:4438/api/zalo/v1/send')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${process.env.ACFC_ZNS_TOKEN}`)
            .send(JSON.stringify(znsPayload));
          const znsSendLog = response.body;
          console.log('\nznsSendLog:', znsSendLog);
          //   if (znsSendLog.error !== 0) throw znsSendLog.message;
          const insertDEResponse = await FuelRestUtils.insertDEZaloOASendLog(
            JSON.stringify({
              items: [
                {
                  OAId: data.inArguments[0].Senders,
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
          let result = await superagent
            .post('https://cloudsms.vietguys.biz:4438/api/index.php')
            .field('from', Content.from)
            .field('u', process.env.SMS_USER)
            .field('pwd', process.env.SMS_PWD)
            .field('phone', data.inArguments[0].DEFields)
            .field('sms', Content.sms)
            .field('bid', Content.bid)
            .field('json', '1');
          result = JSON.parse(result.text);
          console.log('result', result);
          const insertDEResponse = await FuelRestUtils.insertDESMSSendLog(
            JSON.stringify({
              items: [
                {
                  Sender: Content.from,
                  Receiver: data.inArguments[0].DEFields,
                  Content: Content.sms,
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
