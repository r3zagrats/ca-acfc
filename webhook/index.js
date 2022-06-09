require('dotenv').config();
const superagent = require('superagent');
const fuelRestUtils = require('../services/fuel-rest/index');
const refreshZaloToken = require('../services/zalo/refreshZaloToken');

const ZaloWebhook = async (req, res) => {
  const userTrackingInfo = req.body;
  console.log('userTrackingInfo: ', userTrackingInfo);
  switch (userTrackingInfo.event_name) {
    case 'user_received_message': {
      console.log('User received message');
      try {
        const data = await fuelRestUtils.insertDEZaloUserActionTracking(
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
        const results = [];
        for (let i = 0; i < userTrackingInfo.message.msg_ids.length; i += 1) {
          console.log(
            `userTrackingInfo.message.msg_ids[${i}]: `,
            userTrackingInfo.message.msg_ids[i]
          );
          results.push(
            fuelRestUtils.insertDEZaloUserActionTracking(
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
            )
          );
        }
        await Promise.all(results);
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
        const tmpAccessToken = await refreshZaloToken(userTrackingInfo.oa_id);
        console.log('\ntmpAccessToken: ', tmpAccessToken);
        let response = await superagent
          .get(
            `https://openapi.zalo.me/v2.0/oa/getprofile?data={"user_id":"${userTrackingInfo.follower.id}"}`
          )
          .set('access_token', tmpAccessToken);
        response = JSON.parse(response.text);
        console.log('response', response);
        const insertData = fuelRestUtils.insertDEZaloUserActionTracking(
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
        const upsertData = fuelRestUtils.upsertDEOAFollowers(
          JSON.stringify({
            items: [
              {
                Name: response.error === 0 ? response.data.display_name : '',
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
        const tmpAccessToken = await refreshZaloToken(userTrackingInfo.oa_id);
        console.log('\ntmpAccessToken: ', tmpAccessToken);
        let response = await superagent
          .get(
            `https://openapi.zalo.me/v2.0/oa/getprofile?data={"user_id":"${userTrackingInfo.follower.id}"}`
          )
          .set('access_token', tmpAccessToken);
        response = JSON.parse(response.text);
        console.log('response', response);
        const insertData = fuelRestUtils.insertDEZaloUserActionTracking(
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
        const upsertData = fuelRestUtils.upsertDEOAFollowers(
          JSON.stringify({
            items: [
              {
                Name: response.error === 0 ? response.data.display_name : '',
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
        // const data = await fuelRestUtils.insertDEZaloUserActionTracking(
        //   JSON.stringify({
        //     items: [
        //       {
        //         AppId: userTrackingInfo.app_id,
        //         OAId: userTrackingInfo.recipient.id,
        //         ZaloId: userTrackingInfo.sender.id,
        //         MsgId: userTrackingInfo.message.msg_id,
        //         UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
        //         Timestamp: userTrackingInfo.timestamp,
        //         EventName: userTrackingInfo.event_name,
        //         Message: userTrackingInfo.message.text,
        //       },
        //     ],
        //   })
        // );
        // let input = userTrackingInfo.message.text;
        // const nameRegex = /(?<=Họ và Tên: ).*/gm;
        // const phoneRegex = /(?<=Điện thoại: ).*/gm;
        // const addressRegex = /(?<=Địa chỉ: ).*/gm;
        // if (nameRegex.exec(input) && phoneRegex.exec(input) && addressRegex.exec(input)) {
        //   console.log('User send Request User Info Message');
        //   nameRegex.lastIndex = 0;
        //   phoneRegex.lastIndex = 0;
        //   addressRegex.lastIndex = 0;
        //   await fuelRestUtils.insertDEZaloRequestUserInfo(
        //     JSON.stringify({
        //       items: [
        //         {
        //           AppId: userTrackingInfo.app_id,
        //           OAId: userTrackingInfo.recipient.id,
        //           ZaloId: userTrackingInfo.sender.id,
        //           MsgId: userTrackingInfo.message.msg_id,
        //           UTCTime: new Date(Number(userTrackingInfo.timestamp)).toUTCString(),
        //           Timestamp: userTrackingInfo.timestamp,
        //           Name: nameRegex.exec(input)[0],
        //           PhoneNumber: phoneRegex.exec(input)[0],
        //           Address: addressRegex.exec(input)[0],
        //         },
        //       ],
        //     })
        //   );
        // }
        // try {
        //   input = JSON.parse(input);
        //   if (input.EventDefinitionKey) {
        //     console.log('User triggered journey');
        //     const result = await fuelRestUtils.triggerJourneyBuilder(
        //       JSON.stringify({
        //         ContactKey: userTrackingInfo.sender.id,
        //         EventDefinitionKey: input.EventDefinitionKey,
        //         Data: {
        //           OAId: userTrackingInfo.recipient.id,
        //           ZaloId: userTrackingInfo.sender.id,
        //         },
        //       })
        //     );
        //     console.log('result:', result);
        //   }
        // } catch (error) {
        //   // return;
        // }
        // const tmpAccessToken = await refreshZaloToken(userTrackingInfo.recipient.id);
        // console.log('\ntmpAccessToken: ', tmpAccessToken);

        // const znsContent = {
        //   recipient: {
        //     user_id: userTrackingInfo.sender.id,
        //   },
        //   message: {
        //     text: 'Cảm ơn bạn đã nhắn tin cho White Space JSC, yêu cầu của bạn đang được quản trị viên xử lý',
        //   },
        // };
        // console.log('\nznsContent:', JSON.stringify(znsContent));
        // // Send Message
        // const response = await superagent
        //   .post('https://openapi.zalo.me/v2.0/oa/message')
        //   .set('Content-Type', 'application/json')
        //   .set('access_token', tmpAccessToken)
        //   .send(JSON.stringify(znsContent));
        // const znsSendLog = response.body;
        // console.log('\nznsSendLog:', znsSendLog);
        // if (znsSendLog.error !== 0) throw znsSendLog.message;
        // await fuelRestUtils.insertDEZaloOASendLog(
        //   JSON.stringify({
        //     items: [
        //       {
        //         OAId: userTrackingInfo.recipient.id,
        //         ZaloId: znsSendLog.error === 0 ? znsSendLog.data.user_id : '',
        //         MsgId: znsSendLog.error === 0 ? znsSendLog.data.message_id : '',
        //         UTCTime: new Date().toUTCString(),
        //         Timestamp: new Date().getTime(),
        //         StatusCode: znsSendLog.error,
        //         ErrorMessage: znsSendLog.message,
        //         Message: JSON.stringify(znsContent.message),
        //       },
        //     ],
        //   })
        // );
        // res.status(200).send(data.body);
        res.status(200).send({ status: 'OK' });
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

module.exports = ZaloWebhook;
