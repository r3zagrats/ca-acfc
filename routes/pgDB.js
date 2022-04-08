require('dotenv').config();
const db = require('../db');
const superagent = require('superagent');

// Zalo OA Table methods

/**
 * Get All OA Info
 * @param {*} req
 * @param {*} res
 */
exports.getAllOA = async (req, res) => {
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

/**
 * Get OA Info by Id
 * @param {*} req
 * @param {*} res
 */
exports.getOAById = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM "${process.env.PSQL_ZALOOA}" WHERE "OAId" = '${req.params.id}'`
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
 * Delete an OA
 * @param {*} req
 * @param {*} res
 */
exports.deleteOA = async (req, res) => {
  console.log('req id: ', req.body.id);
  try {
    const { rows } = await db.query(
      `DELETE FROM "${process.env.PSQL_ZALOOA}" WHERE "OAId" = '${req.body.id}'`
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
 * Create an OA
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.createOA = async (req, res) => {
  const data = JSON.parse(req.body.data);
  console.log(data);
  if (!data) return res.status(500).send({ status: 'error' });

  let columnList = [];
  let valueList = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === '') continue;
    columnList.push(`"${key}"`);
    valueList.push(`'${value}'`);
  }

  const query = {
    text: `INSERT INTO "${process.env.PSQL_ZALOOA}"(${columnList}) VALUES(${valueList})`,
  };
  console.log(query);
  try {
    const { rows } = await db.query(query);
    console.log(rows);
    res.status(200).send({
      status: 'OK',
      data: rows,
    });
  } catch (error) {
    res.status(500).send({ error: error.stack });
  }
};

/**
 * Update an OA
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateOA = async (req, res) => {
  const data = JSON.parse(req.body.data);
  console.log(data);
  if (!data) return res.status(500).send({ status: 'error' });

  let valueList = [];
  for (const [key, value] of Object.entries(data)) {
    valueList.push(`"${key}" = '${value}'`);
  }
  const query = {
    text: `UPDATE "${process.env.PSQL_ZALOOA}" SET ${valueList} WHERE "OAId" = '${data.OAId}'`,
  };
  console.log(query);
  try {
    const { rows } = await db.query(query);
    console.log(rows);
    res.status(200).send({
      status: 'OK',
      data: rows,
    });
  } catch (error) {
    res.status(200).send({ error: error.stack });
  }
};

// User Methods

/**
 * Get User's Password
 * @param {*} username
 * @returns
 */
const getUserPassword = async (username) => {
  try {
    const { rows } = await db.query(
      `SELECT "Password" FROM "${process.env.PSQL_User}" WHERE "Username" = '${username}'`
    );
    return rows;
  } catch (err) {
    console.log(err.stack);
  }
};

/**
 * Update User's Password
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateUser = async (req, res) => {
  if (!req.body) return res.status(500).send({ status: 'error' });

  const { username, password } = req.body;

  const query = {
    text: `UPDATE "${process.env.PSQL_USER}" SET "Password" = '${password}'  WHERE "Username" = '${username}'`,
  };
  try {
    const { rows } = await db.query(query);
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
 * Get All User Info
 * @param {*} req
 * @param {*} res
 */
exports.getAllUser = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM "${process.env.PSQL_User}"`);
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

const checkJwt = (auth) => {
  if (
    auth == 'JWT ' + process.env.JWT ||
    auth == 'jwt ' + process.env.JWT ||
    auth == 'Jwt ' + process.env.JWT
  ) {
    return true;
  } else return false;
};

exports.authen = async (req, res) => {
  var result = await getUserPassword('Admin');
  console.log(result)
  const { username, password } = req.body;
  try {
    if (username === 'Admin' && password === result[0].Password) {
      const result = await superagent.get('/pgdb/zalooa');
      const selectOpt = JSON.parse(result.text).data;
      res.status(200).render('user', { error: false, selectOpt });
    } else
      res.status(500).render('login', {
        error: true,
      });
  } catch (e) {
    console.log('error: ', e);
    res.status(500).render('login', { error: true });
  }
};
