const ET_Client = require("sfmc-fuelsdk-node");
const FuelRest = require("fuel-rest");

const options = {
  auth: {
    clientId: process.env.SFMC_CLIENT_ID,
    clientSecret: process.env.SFMC_CLIENT_SECRET,
    authOptions: {
      authVersion: 2,
      accountId: process.env.SFMC_ACCOUNT_ID,
    },
    authUrl: `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`,
  },
  origin: `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/`,
  globalReqOptions: {},
};

const RestClient = new FuelRest(options);

const origin = `https://${process.env.SFMC_SUBDOMAIN}.rest.marketingcloudapis.com/`;
const authOrigin = `https://${process.env.SFMC_SUBDOMAIN}.auth.marketingcloudapis.com`;
const soapOrigin = `https://${process.env.SFMC_SUBDOMAIN}.soap.marketingcloudapis.com/`;
const SDKClient = new ET_Client(
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
      applicationType: "server",
    },
  }
); // stack is ignored

/**
 * Get Content
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
const getContent = async (data) =>
  RestClient.post({
    uri: `asset/v1/content/assets/query`,
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

/**
 * Insert DE
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
 const upsertOAFollowers = async (data) =>
 RestClient.put({
   uri: `data/v1/async/dataextensions/key:${process.env.DE_OA_FOLLOWERS}/rows`,
   headers: {
     "Content-Type": "application/json",
   },
   body: data,
 });


/**
 * Insert DE
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
const insertZaloUserActionTracking = async (data) =>
  RestClient.post({
    uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_USER_ACTION_TRACKING}/rows`,
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

/**
 * Insert DE
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
 const insertZaloSendLog = async (data) =>
 RestClient.post({
   uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_SEND_LOG}/rows`,
   headers: {
     "Content-Type": "application/json",
   },
   body: data,
 });


/**
 * Upsert DE
 * @param externalKey
 * @param data
 * @returns {?Promise}
 */
const upsertDE = async (data) =>
  RestClient.put({
    uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_USER_ACTION_TRACKING}/rows`,
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

/**
 * Get Journey
 * @param id
 * @param ver
 * @returns {?Promise}
 */
const getJourney = async (id, ver) =>
  RestClient.get({
    uri: `/interaction/v1/eventDefinitions/key:${id}`,
    headers: {
      "Content-Type": "application/json",
    },
    json: true,
  });

const saveData = async (externalKey, data) =>
  RestClient.post({
    uri: `/hub/v1/dataevents/key:${externalKey}/rowset`,
    headers: {
      "Content-Type": "application/json",
    },
    json: true,
    body: data,
  });

module.exports = {
  RestClient,
  SDKClient,
  getContent,
  getJourney,
  saveData,
  upsertOAFollowers,
  insertZaloUserActionTracking,
  insertZaloSendLog,
  upsertDE,
};
