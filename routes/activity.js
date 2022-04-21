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
const db = require('../db');
const asyncGet = require('../utils/async-http-get');
const fs = require('fs');
const redisClient = require('../redis');
/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.execute = async (req, res) => {
  const data = JWT(req.body);
  console.log('\ndata.inArguments: ', data.inArguments[0]);
  let Content = data.inArguments[0].ContentBuilder;
  // Handle Content
  for (const [key, value] of Object.entries(data.inArguments[0])) {
    Content = Content.replaceAll(`%%${key}%%`, value);
  }
  console.log('\nContent', Content);
  Content = JSON.parse(Content);
  try {
    // Query OA Info
    const { rows } = await db.query(
      `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${data.inArguments[0].messType}'`
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
      response = response.body;
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
        const result = await db.query(
          `UPDATE "${process.env.PSQL_ZALOOA_TABLE}" SET ${valueList} WHERE "OAId" = '${OAInfo.OAId}'`
        );
        console.log(`\nCap nhat db thanh cong cho OA ${OAInfo.OAName}: `, result);
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
      fileInfo = JSON.parse(fileInfo);
      console.log('\nfileInfo: ', fileInfo);
      let tmpToken = fileInfo.token || '';
      if (fileInfo === null || IsExpiredToken(fileInfo.expires_in) === true || !fileInfo.token) {
        const result = await asyncGet(Content.value.url, Content.value.name);
        console.log('\nresult: ', result);
        const file = fs.createReadStream(`./public/data/${Content.value.name}`);
        const response = await superagent
          .post(
            `${process.env.ZALO_UPLOAD_URL}${Content.value.extension === 'gif' ? 'gif' : 'file'}`
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
      MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
      ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
      UTCTime: new Date().toUTCString(),
      Timestamp: new Date().getTime(),
      Error: znsSendLog.error,
      Message: znsSendLog.message,
    };
    const firstStep = await RestClient.insertZaloSendLog(
      JSON.stringify({
        items: [temp],
      })
    );
    res.status(200).send({ Status: 'Successfull' });
    // case 'Webpush': {
    //   console.log('\nWebpush method');
    //   let FirebaseToken = data.inArguments[0].FirebaseToken;
    //   if (FirebaseToken !== '') {
    //     for (const [key, value] of Object.entries(data.inArguments[0])) {
    //       Content = Content.replaceAll(`%%${key}%%`, value);
    //     }
    //     var payload = {
    //       notification: JSON.parse(Content),
    //     };
    //     admin
    //       .messaging()
    //       .sendToDevice(FirebaseToken, payload)
    //       .then((response) => {
    //         console.log('\nSent successfully.\n');
    //         console.log(r\nesponse);
    //       })
    //       .catch((error) => {
    //         console.log('\nSent failed.\n');
    //         console.log(e\nrror);
    //       });
    //   }
    //   res.status(200).send({ Status: 'Accept' });
    //   break;
    // }
    // }
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
