'use strict';
require('dotenv').config();
const pgClient = require('../config/database/postgresql/postgresql.config');

class ZOAController {
  /**
   * Get All ZOA Info
   * @param {*} req
   * @param {*} res
   */
  getAllZOA = async (req, res) => {
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
  };

  /**
   * Get ZOA Info by Id
   * @param {*} req
   * @param {*} res
   */
  getZOAById = async (req, res) => {
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
  };

  /**
   * Delete an ZOA
   * @param {*} req
   * @param {*} res
   */
  deleteZOA = async (req, res) => {
    try {
      const result = await pgClient.query(
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
  };

  /**
   * Create an ZOA
   * @param {*} req
   * @param {*} res
   * @returns
   */
  createZOA = async (req, res) => {
    console.log(req.body);
    const data = JSON.parse(req.body.data);
    if (!data) return res.status(500).send({ status: 'error' });

    let columnList = [];
    let valueList = [];
    for (const [key, value] of Object.entries(data)) {
      if (value === '') continue;
      columnList.push(`"${key}"`);
      valueList.push(`'${value}'`);
    }
    try {
      const result = await pgClient.query(
        `INSERT INTO "${process.env.PSQL_ZALOOA_TABLE}"(${columnList}) VALUES(${valueList})`
      );
      res.status(200).send({
        status: 'OK',
        msg: 'Created successfully',
      });
    } catch (error) {
      res.status(500).send({ error: error.stack });
    }
  };

  /**
   * Update an ZOA
   * @param {*} req
   * @param {*} res
   * @returns
   */
  updateZOA = async (req, res) => {
    let data = JSON.parse(req.body.data);
    console.log('data', data);
    if (!data) return res.status(500).send({ error: 'Invalid data' });

    let valueList = [];
    for (const [key, value] of Object.entries(data)) {
      valueList.push(`"${key}" = '${value}'`);
    }
    console.log(valueList);
    try {
      const result = await pgClient.query(
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
  };
}

module.exports = new ZOAController();
