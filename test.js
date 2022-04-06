require('dotenv').config();

const data = {
  Name: 'Quan',
  Age: '18',
};
let columnList = [];
let valueList = [];
for (const [key, value] of Object.entries(data)) {
  columnList.push(`"${key}"`);
  valueList.push(value);
}
const query = {
  text: `INSERT INTO "${process.env.PSQL_ZALOOA}"(${columnList}) VALUES($1, $2)`,
  values: valueList,
};
console.log(query);

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
