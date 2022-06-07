require('dotenv').config();
const pgClient = require('../config/database/postgresql/postgresql.config');

const ZOAController = {
  /**
   * Get All ZOA Info
   * @param {*} req
   * @param {*} res
   */
  getAllZOA: async (req, res) => {
    try {
      const { rows } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`
      );
      res.status(200).send({
        status: 'OK',
        data: rows,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: err });
    }
  },

  /**
   * Get ZOA Info by Id
   * @param {*} req
   * @param {*} res
   */
  getZOAById: async (req, res) => {
    try {
      const { rows } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${req.params.id}' ORDER BY "OAId"`
      );
      console.log(rows);
      res.status(200).send({
        status: 'OK',
        data: rows,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: err });
    }
  },

  /**
   * Delete an ZOA
   * @param {*} req
   * @param {*} res
   */
  deleteZOA: async (req, res) => {
    try {
      await pgClient.query(
        `DELETE FROM "${process.env.PSQL_ZALOOA_TABLE}" WHERE "OAId" = '${req.body.id}'`
      );
      res.status(200).send({
        status: 'OK',
        msg: `Delete successfully OAID: ${req.body.id}`,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: err });
    }
  },

  /**
   * Create an ZOA
   * @param {*} req
   * @param {*} res
   * @returns
   */
  createZOA: async (req, res) => {
    console.log(req.body);
    const data = JSON.parse(req.body.data);
    if (!data) {
      res.status(500).send({ status: 'error' });
      return;
    }

    const columnList = [];
    const valueList = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== '') {
        columnList.push(`"${key}"`);
        valueList.push(`'${data[key]}'`);
      }
    });
    try {
      await pgClient.query(
        `INSERT INTO "${process.env.PSQL_ZALOOA_TABLE}"(${columnList}) VALUES(${valueList})`
      );
      res.status(200).send({
        status: 'OK',
        msg: 'Created successfully',
      });
    } catch (error) {
      res.status(500).send({ error: error.stack });
    }
  },

  /**
   * Update an ZOA
   * @param {*} req
   * @param {*} res
   * @returns
   */
  updateZOA: async (req, res) => {
    const data = JSON.parse(req.body.data);
    console.log('data', data);
    if (!data) {
      res.status(500).send({ error: 'Invalid data' });
      return;
    }

    const valueList = [];
    Object.keys(data).forEach((key) => {
      valueList.push(`"${key}" = '${data[key]}'`);
    });
    console.log(valueList);
    try {
      await pgClient.query(
        `UPDATE "${process.env.PSQL_ZALOOA_TABLE}" SET ${valueList} WHERE "OAId" = '${data.OAId}'`
      );
      res.status(200).send({
        status: 'OK',
        msg: `Update successfully OAId: ${data.OAId}`,
      });
    } catch (error) {
      console.log('error: ', error);
      res.status(200).send({ error: error.stack });
    }
  },
};

module.exports = ZOAController;
