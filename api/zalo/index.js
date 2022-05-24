'use strict';

const superagent = require('superagent');
require('dotenv').config();
const refreshZaloToken = require('../../services/zalo/refreshZaloToken');

class ZaloAPI {
  getZNSTemplates = async (req, res) => {
    try {
      console.log('req body:', req.body.OAId);
      const token = await refreshZaloToken(req.body.OAId);
      console.log('token:', token);
      const response = await superagent
        .get('https://business.openapi.zalo.me/template/all?offset=0&limit=100&status=1')
        .set('access_token', token);
      res.status(200).send(response.text);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  getZNSTemplateDetail = async (req, res) => {
    try {
      console.log(
        'req body:',
        `https://business.openapi.zalo.me/template/info?template_id=${req.body.TemplateId}`
      );
      const token = await refreshZaloToken(req.body.OAId);
      console.log('token:', token);
      const response = await superagent
        .get(`https://business.openapi.zalo.me/template/info?template_id=${req.body.TemplateId}`)
        .set('access_token', token);
      console.log('response:', response.text);
      res.status(200).send(response.text);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}

module.exports = new ZaloAPI();
