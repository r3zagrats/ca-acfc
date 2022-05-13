require('dotenv').config();
const pgdb = require('../db/postgresql');
const superagent = require('superagent');

exports.refreshZaloAT = async (OAId) => {
  try {
    console.log('OA Id:', OAId);
    const { rows } = await pgdb.query(
      `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${OAId}'`
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
    return tmpAccessToken
  } catch (error) {
    console.log('error:' , error)
    return error
  }
}

const IsExpiredToken = (timestamp) => {
  console.log('\nCurrent Time: ', new Date(Date.now()).toUTCString());
  console.log('Expired Time: ', new Date(timestamp).toUTCString());
  console.log(timestamp - Date.now());
  if (timestamp - Date.now() < 600000) return true;
  else return false;
};