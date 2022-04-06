require('dotenv').config();

const data = {
  Name: 'Quan',
  Age: '18'
};
let valueList = [];
  for (const [key, value] of Object.entries(data)) {
    valueList.push(`"${key}": '${value}'`);
  }
  const query = {
    text: `UPDATE "${process.env.PSQL_ZALOOA}" SET ${valueList} WHERE "OAId" = '1'`,
  };

console.log(query)

// require('dotenv').config();
// const superagent = require('superagent');
// const RestClient = require('./utils/sfmc-client');

// const data = {
//   Name: 'Quan',
//   ZaloId: '1087338975254803129',
//   OAId: '1461858946955248598',
//   Status: 'follow',
// };

// (async () => {
//   for (let i = 0; i < 1000; i++) {
//     const result = await RestClient.insertTest(
//       JSON.stringify({
//         items: [data],
//       })
//     );
//     console.log('result: ', result.body);
//   }
// })();
