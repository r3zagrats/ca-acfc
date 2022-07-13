const FuelRestUtils = require('./services/fuel-rest/index');

(async () => {
  const res = await FuelRestUtils.upsertDEDatHang(
    JSON.stringify({
      items: [{ phone: '123', Seen: 'false' }],
    })
  );
  console.log(res.body);
})();
