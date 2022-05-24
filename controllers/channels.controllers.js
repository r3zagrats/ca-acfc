'use strict';
require('dotenv').config();
const pgClient = require('../config/database/postgresql/postgresql.config');

class ChannelsController {
  /**
   * Get All OA Info
   * @param {*} req
   * @param {*} res
   */
  getAllChannels = async (req, res) => {
    try {
      const { rows } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_CHANNELS_TABLE}" ORDER BY "Id"`
      );
      res.status(200).send({
        status: 'OK',
        data: rows,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: err });
    }
  };
}

module.exports = new ChannelsController();
