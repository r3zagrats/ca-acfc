const FuelRestUtils = require('./services/fuel-rest/index');

(async () => {
  const res = await FuelRestUtils.upsertDEOAFollowers(
    JSON.stringify({
      items: [{ ZaloId: '123', Seen: 'true' }],
    })
  );
  console.log(res.body);
})();
