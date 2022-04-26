require('dotenv').config();
const pgsql = require('../db/postgresql');

// Zalo OA Table methods

/**
 * Get All OA Info
 * @param {*} req
 * @param {*} res
 */
exports.getAllOA = async (req, res) => {
  try {
    const { rows } = await pgsql.query(`SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`);
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
    const { rows } = await pgsql.query(
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
 * Delete an OA
 * @param {*} req
 * @param {*} res
 */
exports.deleteOA = async (req, res) => {
  try {
    const result = await pgsql.query(
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
 * Create an OA
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.createOA = async (req, res) => {
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
    const result = await pgsql.query(
      `INSERT INTO "${process.env.PSQL_ZALOOA_TABLE}"(${columnList}) VALUES(${valueList})`
    );
    res.status(200).send({
      status: 'OK',
      msg: 'Created successfully'
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
  let data = JSON.parse(req.body.data);
  console.log('data', data);
  if (!data) return res.status(500).send({ error: 'Invalid data' });

  let valueList = [];
  for (const [key, value] of Object.entries(data)) {
    valueList.push(`"${key}" = '${value}'`);
  }
  console.log(valueList)
  try {
    const result = await pgsql.query(
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

// User Methods

/**
 * Get User's Password
 * @param {*} username
 * @returns
 */
const getUserPassword = async (username) => {
  try {
    const { rows } = await pgsql.query(
      `SELECT "Password" FROM "${process.env.PSQL_USER_TABLE}" WHERE "Username" = '${username}' ORDER BY "Id"`
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

  try {
    const result = await pgsql.query(
      `UPDATE "${process.env.PSQL_USER_TABLE}" SET "Password" = '${password}'  WHERE "Username" = '${username}'`
    );
    res.status(200).send({
      status: 'OK',
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
    const { rows } = await pgsql.query(`SELECT * FROM "${process.env.PSQL_USER_TABLE}" ORDER BY "Id"`);
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
  const { username, password } = req.body;
  try {
    if (username === 'Admin' && password === result[0].Password) {
      const { rows } = await pgsql.query(`SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`);
      res.status(200).render('user', { error: false, selectOpt: rows });
    } else
      res.status(500).render('login', {
        error: true,
      });
  } catch (e) {
    console.log('error: ', e);
    res.status(500).render('login', { error: true });
  }
};
