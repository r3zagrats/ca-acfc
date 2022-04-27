require('dotenv').config();
const JWT = require('../utils/jwtDecoder');
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
const pgdb = require('../db/postgresql');
const asyncGet = require('../utils/async-http-get');
const fs = require('fs');
const redisClient = require('../db/redis');
/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.execute = async (req, res) => {
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
      case 'Zalo Notification Service': {
        // Query OA Info
        const { rows } = await pgdb.query(
          `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${data.inArguments[0].Endpoints}'`
        );
        const OAInfo = rows[0];
        console.log('\nOAInfo: ', OAInfo);
        let tmpAccessToken = OAInfo.AccessToken || '';
        // Check if the access token is valid
        if (IsExpiredToken(Number(OAInfo.Timestamp))) {
          console.log(`\nAccess Token cua ${OAInfo.OAName} het han`);
          // Refresh Token
          let response = await superagent
            .post(process.env.ZALO_OAUTH_URL)
            .set('secret_key', process.env.ZALO_APP_SECRET_KEY)
            .send(`refresh_token=${OAInfo.RefreshToken}`)
            .send(`app_id=${process.env.ZALO_APP_ID}`)
            .send('grant_type=refresh_token');
          response = JSON.parse(response.text);
          console.log(`\nAccessToken Response cua ${OAInfo.OAName}: "`, response);
          if (response && response.access_token) {
            tmpAccessToken = response.access_token;
            let updateInfo = {
              ...OAInfo,
              AccessToken: response.access_token,
              RefreshToken: response.refresh_token,
              Timestamp: Date.now() + response.expires_in * 1000,
              ExpiryDate: new Date(Date.now() + response.expires_in * 1000).toUTCString(),
            };
            console.log(`\nupdateInfo cua OA ${OAInfo.OAName}: `, updateInfo);
            let valueList = [];
            for (const [key, value] of Object.entries(updateInfo)) {
              valueList.push(`"${key}" = '${value}'`);
            }
            const result = await pgdb.query(
              `UPDATE "${process.env.PSQL_ZALOOA_TABLE}" SET ${valueList} WHERE "OAId" = '${OAInfo.OAId}'`
            );
            console.log(`\nCap nhat db thanh cong cho OA ${OAInfo.OAName}:`);
          } else {
            throw response;
          }
        } else {
          console.log(`\nAccess Token cua ${OAInfo.OAName} con han`);
        }
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
        console.log('\nResponse data:', response.body);
        const znsSendLog = response.body;
        console.log('\nznsSendLog:', znsSendLog);
        if (znsSendLog.error !== 0) throw znsSendLog.message;
        const temp = {
          OAId: OAInfo.OAInfo,
          ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
          MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
          UTCTime: new Date().toUTCString(),
          Timestamp: new Date().getTime(),
          StatusCode: znsSendLog.error,
          ErrorMessage: znsSendLog.message,
          Message: JSON.stringify(znsContent.message)
        };
        const firstStep = await RestClient.insertZaloOASendLog(
          JSON.stringify({
            items: [temp],
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
    res.status(500).send({ status: 'Error', message: error });
  }
};

/**
 * OAInfo that receives a notification when a user saves the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.save = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  OAInfo that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  OAInfo that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.stop = async (req, res) => {
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
exports.validate = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

const IsExpiredToken = (timestamp) => {
  console.log('\nCurrent Time: ', new Date(Date.now()).toUTCString());
  console.log('Expired Time: ', new Date(timestamp).toUTCString());
  console.log(timestamp - Date.now());
  if (timestamp - Date.now() < 600000) return true;
  else return false;
};
