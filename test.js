const { refreshZaloAT } = require('./utils/refreshZaloAT');

(async () => {
  const token = await refreshZaloAT('1461858946955248598');
  console.log('token', token);
})();

