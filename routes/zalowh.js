const RestClient = require('../utils/sfmc-client');

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
          console.log('User send Reques User Info Message')
          nameRegex.lastIndex = 0;
          phoneRegex.lastIndex = 0;
          addressRegex.lastIndex = 0;
x
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
                  EventName: userTrackingInfo.event_name,
                  Name: nameRegex.exec(input)[0],
                  PhoneNumber: phoneRegex.exec(input)[0],
                  Address: addressRegex.exec(input)[0]
                },
              ],
            })
          );
        }

        res.status(200).send(data.body);
      } catch (error) {
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
