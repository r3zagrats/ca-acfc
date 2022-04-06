require('dotenv').config();
const db = require('../db');

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
  try {
    const { rows } = await db.query(
      `DELETE FROM "${process.env.PSQL_ZALOOA}" WHERE "OAId" = '${req.params.id}'`
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
  if (!req.body) return res.status(500).send({ status: 'error' });

  let columnList = [];
  let valueList = [];
  for (const [key, value] of Object.entries(req.body)) {
    columnList.push(`"${key}"`);
    valueList.push(value);
  }
  const query = {
    text: `INSERT INTO "${process.env.PSQL_ZALOOA}"(${columnList}) VALUES($1, $2)`,
    values: valueList,
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
 * Update an OA
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateOA = async (req, res) => {
  if (!req.body) return res.status(500).send({ status: 'error' });

  let valueList = [];
  for (const [key, value] of Object.entries(req.body)) {
    valueList.push(`"${key}" = '${value}'`);
  }
  const query = {
    text: `UPDATE "${process.env.PSQL_ZALOOA}" SET ${valueList} WHERE "OAId" = '${req.params.id}'`,
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

// User Methods

/**
 * Get User's Password
 * @param {*} username 
 * @returns 
 */
const getUserPassword = async (username) => {
  try {
    const { rows } = await db.query(
      `SELECT "password" FROM "${process.env.PSQL_User}" WHERE "Username" = '${username}'`
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
}