const FuelRestUtils = require('./services/fuel-rest');
(async () => {
  const insertData = await FuelRestUtils.insertDESMSSendLog(
    JSON.stringify({
      items: [
        {
          Sender: 'NIKE',
          // Sender: Content.from,
          // Receiver: Content.phone,
          // Content: Content.sms,
          // MsgId: result.msgid,
          // Status: result.error === '0' ? 'success' : 'error',
          // ErrorCode: result.error,
          // ErrorMsg: result.log,
          UTCTime: new Date().toUTCString(),
          Timestamp: new Date().getTime(),
        },
      ],
    })
  );
  console.log(insertData.body);
})().catch((err) => {
  console.log(err);
});
