'use strict';
const fuelRestClient = require('../../config/sfmc/fuel-rest/fuel-rest.config');

class FuelRestController {
  /**
   * Get Content
   * @param externalKey
   * @param data
   * @returns {?Promise}
   */
  getContent = async (data) =>
    RestClient.post({
      uri: `asset/v1/content/assets/query`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  /**
   * Insert DE
   * @param externalKey
   * @param data
   * @returns {?Promise}
   */
  upsertDEOAFollowers = async (data) =>
    RestClient.put({
      uri: `data/v1/async/dataextensions/key:${process.env.DE_OA_FOLLOWERS}/rows`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  /**
   * Insert DE
   * @param externalKey
   * @param data
   * @returns {?Promise}
   */
  insertDEZaloUserActionTracking = async (data) =>
    RestClient.post({
      uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_USER_ACTION_TRACKING}/rows`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  /**
   * Insert DE
   * @param externalKey
   * @param data
   * @returns {?Promise}
   */
  insertDEZaloOASendLog = async (data) =>
    RestClient.post({
      uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_OA_SEND_LOG}/rows`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  insertDEZaloRequestUserInfo = async (data) =>
    RestClient.post({
      uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_REQUEST_USER_INFO_LOG}/rows`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  triggerJourneyBuilder = async (data) => {
    RestClient.post({
      uri: `/interaction/v1/events`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
  };

  /**
   * Upsert DE
   * @param externalKey
   * @param data
   * @returns {?Promise}
   */
  upsertDEZaloUserActionTracking = async (data) =>
    RestClient.put({
      uri: `data/v1/async/dataextensions/key:${process.env.DE_ZALO_USER_ACTION_TRACKING}/rows`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

  /**
   * Get Journey
   * @param id
   * @param ver
   * @returns {?Promise}
   */
  getJourney = async (id, ver) =>
    RestClient.get({
      uri: `/interaction/v1/eventDefinitions/key:${id}`,
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
    });

  saveData = async (externalKey, data) =>
    RestClient.post({
      uri: `/hub/v1/dataevents/key:${externalKey}/rowset`,
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
      body: data,
    });
}

module.exports = new FuelRestController();
