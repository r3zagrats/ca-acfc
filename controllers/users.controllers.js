require('dotenv').config();
const pgClient = require('../config/database/postgresql/postgresql.config');

/**
 * Get User's Password
 * @param {*} username
 * @returns
 */
const getUserPassword = async (username) => {
  let result;
  try {
    const { rows } = await pgClient.query(
      `SELECT "Password" FROM "${process.env.PSQL_USER_TABLE}" WHERE "Username" = '${username}' ORDER BY "Id"`
    );
    result = rows;
  } catch (err) {
    console.log(err.stack);
  }
  return result;
};

const UsersController = {
  /**
   * Update User's Password
   * @param {*} req
   * @param {*} res
   * @returns
   */
  updateUser: async (req, res) => {
    if (!req.body) {
      res.status(500).send({ status: 'error' });
      return
    } 
    const { username, password } = req.body;
    try {
      await pgClient.query(
        `UPDATE "${process.env.PSQL_USER_TABLE}" SET "Password" = '${password}'  WHERE "Username" = '${username}'`
      );
      res.status(200).send({
        status: 'OK',
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: err });
    }
  },

  /**
   * Get All User Info
   * @param {*} req
   * @param {*} res
   */
  getAllUser: async (req, res) => {
    try {
      const { rows } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_USER_TABLE}" ORDER BY "Id"`
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

  authenUser: async (req, res) => {
    console.log('req', req.body);
    const result = await getUserPassword('Admin');
    const { username, password } = req.body;
    try {
      if (username === 'Admin' && password === result[0].Password) {
        const { rows } = await pgClient.query(
          `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`
        );
        res.status(200).render('user', { error: false, Endpoints: rows });
      } else
        res.status(500).render('login', {
          error: true,
        });
    } catch (e) {
      console.log('error: ', e);
      res.status(500).render('login', { error: true });
    }
  },
};

module.exports = new UsersController();
