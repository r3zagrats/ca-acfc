const superagent = require('superagent');

const ZaloAPI = {
  getZNSTemplates: async (req, res) => {
    try {
      const response = await superagent
        .get(
          `https://cloud.vietguys.biz:4438/api/zalo/v1/template/all?offset=0&limit=100&username=${process.env.ACFC_ZNS_USERNAME}&oa_id=${req.body.OAId}`
        )
        .set('Authorization', `Bearer ${process.env.ACFC_ZNS_TOKEN}`);
      console.log('response:', response.text);
      res.status(200).send(response.text);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  getZNSTemplateDetail: async (req, res) => {
    try {
      const response = await superagent
        .get(
          `https://cloud.vietguys.biz:4438/api/zalo/v1/template/info?template_id=${req.body.TemplateId}&username=${process.env.ACFC_ZNS_USERNAME}&oa_id=${req.body.OAId}`
        )
        .set('Authorization', `Bearer ${process.env.ACFC_ZNS_TOKEN}`);
      console.log('response:', response.text);
      res.status(200).send(response.text);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  getAuthCode: async (req, res) => {
    console.log(req.body);
    res.status(200).send(req.body);
  },
};

module.exports = ZaloAPI;
