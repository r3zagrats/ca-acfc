const FuelRestUtils = require('./services/fuel-rest/index');

(async () => {
  const res = await FuelRestUtils.upsertDEDatHang(
    JSON.stringify({
      items: [{ phone: '84382555015', Seen: 'true' }],
    })
  );
  console.log(res.body);
})();
