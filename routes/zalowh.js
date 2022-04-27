require('dotenv').config();
const RestClient = require('../utils/sfmc-client');
const pgdb = require('../db/postgresql');

exports.zaloWebhook = async (req, res) => {
  const userTrackingInfo = req.body;
  console.log('userTrackingInfo: ', userTrackingInfo);
  switch (userTrackingInfo.event_name) {
    case 'user_received_message': {
      console.log('User received message');
      try {
        const data = await RestClient.insertZaloUserActionTracking(
          JSON.stringify({
            items: [
              {
                AppId: userTrackingInfo.app_id,
                OAId: userTrackingInfo.sender.id,
                ZaloId: userTrackingInfo.recipient.id,
                MsgId: userTrackingInfo.message.msg_id,
                UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                Timestamp: userTrackingInfo.timestamp,
                EventName: userTrackingInfo.event_name,
              },
            ],
          })
        );
        res.status(200).send(data.body);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: error,
        });
      }
      break;
    }
    case 'user_seen_message': {
      console.log('User seen message');
      try {
        for (let i = 0; i < userTrackingInfo.message.msg_ids.length; i++) {
          console.log(
            `userTrackingInfo.message.msg_ids[${i}]: `,
            userTrackingInfo.message.msg_ids[i]
          );
          await RestClient.insertZaloUserActionTracking(
            JSON.stringify({
              items: [
                {
                  AppId: userTrackingInfo.app_id,
                  OAId: userTrackingInfo.sender.id,
                  ZaloId: userTrackingInfo.recipient.id,
                  MsgId: userTrackingInfo.message.msg_ids[i],
                  UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                  Timestamp: userTrackingInfo.timestamp,
                  EventName: userTrackingInfo.event_name,
                },
              ],
            })
          );
        }
        res.status(200).send({ status: 'ok' });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: error,
        });
      }
      break;
    }
    case 'follow': {
      console.log('User follow OA');
      try {
        const insertData = RestClient.insertZaloUserActionTracking(
          JSON.stringify({
            items: [
              {
                AppId: userTrackingInfo.app_id,
                OAId: userTrackingInfo.oa_id,
                ZaloId: userTrackingInfo.follower.id,
                UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                Timestamp: userTrackingInfo.timestamp,
                EventName: userTrackingInfo.event_name,
              },
            ],
          })
        );
        const upsertData = RestClient.upsertOAFollowers(
          JSON.stringify({
            items: [
              {
                ZaloId: userTrackingInfo.follower.id,
                OAId: userTrackingInfo.oa_id,
                Status: userTrackingInfo.event_name,
                FollowDate: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
              },
            ],
          })
        );
        const data = await Promise.all([insertData, upsertData]);
        res.status(200).send(data.body);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: error,
        });
      }
      break;
    }
    case 'unfollow': {
      console.log('User unfollow OA');
      try {
        const insertData = RestClient.insertZaloUserActionTracking(
          JSON.stringify({
            items: [
              {
                AppId: userTrackingInfo.app_id,
                OAId: userTrackingInfo.oa_id,
                ZaloId: userTrackingInfo.follower.id,
                UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                Timestamp: userTrackingInfo.timestamp,
                EventName: userTrackingInfo.event_name,
              },
            ],
          })
        );
        const upsertData = RestClient.upsertOAFollowers(
          JSON.stringify({
            items: [
              {
                ZaloId: userTrackingInfo.follower.id,
                OAId: userTrackingInfo.oa_id,
                Status: userTrackingInfo.event_name,
                UnfollowDate: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
              },
            ],
          })
        );
        const data = await Promise.all([insertData, upsertData]);
        res.status(200).send(data.body);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: error,
        });
      }
      break;
    }
    case 'user_send_text': {
      console.log('User send text message');
      try {
        const data = await RestClient.insertZaloUserActionTracking(
          JSON.stringify({
            items: [
              {
                AppId: userTrackingInfo.app_id,
                OAId: userTrackingInfo.recipient.id,
                ZaloId: userTrackingInfo.sender.id,
                MsgId: userTrackingInfo.message.msg_id,
                UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                Timestamp: userTrackingInfo.timestamp,
                EventName: userTrackingInfo.event_name,
                Message: userTrackingInfo.message.text,
              },
            ],
          })
        );
        const input = userTrackingInfo.message.text;
        const nameRegex = /(?<=Họ và Tên: ).*/gm;
        const phoneRegex = /(?<=Điện thoại: ).*/gm;
        const addressRegex = /(?<=Địa chỉ: ).*/gm;
        if (nameRegex.exec(input) && phoneRegex.exec(input) && addressRegex.exec(input)) {
          console.log('User send Request User Info Message')
          nameRegex.lastIndex = 0;
          phoneRegex.lastIndex = 0;
          addressRegex.lastIndex = 0;
          const data = await RestClient.insertZaloRequestUserInfoLog(
            JSON.stringify({
              items: [
                {
                  AppId: userTrackingInfo.app_id,
                  OAId: userTrackingInfo.recipient.id,
                  ZaloId: userTrackingInfo.sender.id,
                  MsgId: userTrackingInfo.message.msg_id,
                  UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
                  Timestamp: userTrackingInfo.timestamp,
                  Name: nameRegex.exec(input)[0],
                  PhoneNumber: phoneRegex.exec(input)[0],
                  Address: addressRegex.exec(input)[0]
                },
              ],
            })
          );
        }
        const { rows } = await pgdb.query(
          `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${userTrackingInfo.recipient.id}'`
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
       
        let znsContent = { 
          recipient:{
            user_id: userTrackingInfo.sender.id
          },
          message:{
            text:"Cảm ơn bạn đã nhắn tin cho Whitespace, yêu cầu của bạn sẽ được quản trị viên xử lý"
          }
        }
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
        const firstStep = await RestClient.insertZaloOASendLog(
          JSON.stringify({
            items: [{
              OAId: OAInfo.OAInfo,
              ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
              MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
              UTCTime: new Date().toUTCString(),
              Timestamp: new Date().getTime(),
              StatusCode: znsSendLog.error,
              ErrorMessage: znsSendLog.message,
              Message: JSON.stringify(znsContent.message)
            }],
          })
        );
        res.status(200).send(data.body);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: error,
        });
      }
      break;
    }
    default: {
      res.status(200).send({ status: 'ok' });
    }
  }
};

const IsExpiredToken = (timestamp) => {
  console.log('\nCurrent Time: ', new Date(Date.now()).toUTCString());
  console.log('Expired Time: ', new Date(timestamp).toUTCString());
  console.log(timestamp - Date.now());
  if (timestamp - Date.now() < 600000) return true;
  else return false;
};