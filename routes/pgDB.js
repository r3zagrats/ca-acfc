require('dotenv').config();
const db = require('../db');

exports.GetAllOA = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM "${process.env.PSQL_ZALOOA}"`);
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

exports.GetOAById = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM "${process.env.PSQL_ZALOOA}" WHERE "OAId" = '${req.params.id}'`
    );
    console.log(rows[0]);
    res.status(200).send({
      status: 'OK',
      data: rows[0],
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send({ error: err });
  }
};

exports.Delete = async (req, res) => {
  try {
    const { rows } = await db.query(
      `DELETE FROM "${process.env.PSQL_ZALOOA}" WHERE "OAId" = '${req.params.id}'`
    );
    console.log(rows[0]);
    res.status(200).send({
      status: 'OK',
      data: rows[0],
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send({ error: err });
  }
};

exports.Create = async (req, res) => {
  if (!req.body) return res.status(500).send({ status: 'error' });

  let columnList = [];
  let valueList = [];
  for (const [key, value] of Object.entries(req.body)) {
    columnList.push(`"${key}"`);
    valueList.push(value);
  }
  const query = {
    text: `INSERT INTO "${process.env.PSQL_ZALOOA}"(${columnList.join(', ')}) VALUES($1, $2)`,
    values: valueList,
  };
  try {
    const { rows } = await db.query(query);
    console.log(rows[0]);
    res.status(200).send({
      status: 'OK',
      data: rows[0],
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send({ error: err });
  }
};

exports.Update = async (req, res) => {
  if (!req.body) return res.status(500).send({ status: 'error' });

  let valueList = [];
  for (const [key, value] of Object.entries(req.body)) {
    valueList.push(`"${key}": '${value}'`);
  }
  const query = {
    text: `UPDATE "${process.env.PSQL_ZALOOA}" SET ${valueList} WHERE "OAId" = '${req.params.id}'`,
  };
  try {
    const { rows } = await db.query(query);
    console.log(rows[0]);
    res.status(200).send({
      status: 'OK',
      data: rows[0],
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send({ error: err });
  }
};
