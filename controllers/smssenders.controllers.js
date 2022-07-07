require('dotenv').config();
const superagent = require('superagent');
// const pgClient = require('../config/database/postgresql/postgresql.config');

const SMSSendersController = {
  /**
   * Get All OA Info
   * @param {*} req
   * @param {*} res
   */
  getAll: async (req, res) => {
    try {
      const { body: smsSenderList } = await superagent
        .get('https://cloudsms4.vietguys.biz:4438/api/template_list.php')
        .send({
          u: process.env.ACFC_SMS_USERNAME,
          pwd: process.env.ACFC_SMS_TOKEN,
        });
      res.status(200).send(smsSenderList);
    } catch (err) {
      res.status(500).json({ err });
    }
  },
};

module.exports = SMSSendersController;
