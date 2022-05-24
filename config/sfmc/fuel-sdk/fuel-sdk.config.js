
const ET_Client = require('sfmc-fuelsdk-node');

const origin = `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/`;
const authOrigin = `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com`;
const soapOrigin = `https://${process.env.SFMC_SUBDOMAIN}.soap.marketingcloudapis.com/`;

const fuelSDKClient = new ET_Client(
  process.env.SFMC_CLIENT_ID,
  process.env.SFMC_CLIENT_SECRET,
  process.env.STACK,
  {
    origin,
    authOrigin,
    soapOrigin,
    authOptions: {
      authVersion: 2,
      accountId: process.env.SFMC_ACCOUNT_ID,
      applicationType: 'server',
    },
  }
); 

module.exports = fuelSDKClient;