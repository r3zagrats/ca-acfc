require('dotenv').config();
const pgClient = require('../config/database/postgresql/postgresql.config');
 
const SMSSendersController = {
  /**
   * Get All OA Info
   * @param {*} req
   * @param {*} res
   */
  getAll: async (req, res) => {
    try {
      const { rows } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_SMSSENDERS_TABLE}" ORDER BY "Id"`
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
};

module.exports = SMSSendersController;
