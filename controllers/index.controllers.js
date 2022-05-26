'use strict';
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const pgClient = require('../config/database/postgresql/postgresql.config');

const zmOptions = [
  { value: 'Default', name: '--Select one of the following options--' },
  { value: 'Text', name: 'ZM Text' },
  { value: 'Image', name: 'ZM Image' },
  { value: 'NormalList', name: 'ZM Normal List' },
  { value: 'ButtonList', name: 'ZM Button List' },
  { value: 'AttachedFile', name: 'ZM Attached File' },
  { value: 'RequestUserInfo', name: 'ZM Request User Info' },
];

class MainRouter {
  /**
   * Render Config
   * @param req
   * @param res
   */
  config = (req, res) => {
    const domain = req.headers.host || req.headers.origin;
    const file = path.join(__dirname, '..', 'public/sfmcca', 'config-template.json');
    const configTemplate = fs.readFileSync(file, 'utf-8');
    const config = JSON.parse(configTemplate.replace(/\$DOMAIN/g, domain));
    res.json(config);
  };

  /**
   * Render UI
   * @param req
   * @param res
   */
  sfmcca = async (req, res) => {
    if ((req.headers['referer'] ?? 'no end').includes('marketingcloudapps')) {
      const { rows: Channels } = await pgClient.query(
        `SELECT * FROM "${process.env.PSQL_CHANNELS_TABLE}" ORDER BY "Id"`
      );
      res.render('sfmcca', { Channels});
    } else {
      res.status(500).send({ Status: 'Access is not allowed' });
    }
  };

  sfmcccb = async (req, res) => {
    res.status(200).render('sfmcccb', { zmOptions });
  };

  /**
   * Render UI
   * @param req
   * @param res
   */
  login = async (req, res) => {
    res.render('login', { error: false });
  };

  admin = async (req, res) => {
    const { rows: Channels } = await pgClient.query(
      `SELECT * FROM "${process.env.PSQL_CHANNELS_TABLE}" ORDER BY "Id"`
    );
    const { rows: Endpoints } = await pgClient.query(
      `SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`
    );
    res.render('admin', { Channels, Endpoints });
  };
}

module.exports = new MainRouter();
