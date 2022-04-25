require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../db');
/**
 * Render Config
 * @param req
 * @param res
 */
exports.config = (req, res) => {
  const domain = req.headers.host || req.headers.origin;
  const file = path.join(__dirname, '..', 'public', 'config-template.json');
  const configTemplate = fs.readFileSync(file, 'utf-8');
  const config = JSON.parse(configTemplate.replace(/\$DOMAIN/g, domain));
  res.json(config);
};

/**
 * Render UI
 * @param req
 * @param res
 */
exports.customActivity = async (req, res) => {
  if ((req.headers['referer'] ?? 'no end').includes('marketingcloudapps')) {
    const { rows:Channels } = await db.query(`SELECT * FROM "${process.env.PSQL_CHANNELS_TABLE}" ORDER BY "Id"`);
    const { rows:Endpoints } = await db.query(`SELECT * FROM "${process.env.PSQL_ZALOOA_TABLE}" ORDER BY "OAId"`);
    res.render('customActivity', { Channels, Endpoints });
  } else {
    res.status(500).send({ Status: 'Access is not allowed' });
  }
};

const znsOptions = [
  { value: 'Default', name: '--Select one of the following options--' },
  { value: 'Text', name: 'ZNS Text' },
  { value: 'Image', name: 'ZNS Image' },
  { value: 'NormalList', name: 'ZNS Normal List' },
  { value: 'ButtonList', name: 'ZNS Button List' },
  { value: 'AttachedFile', name: 'ZNS Attached File' },
];

exports.customContent = async (req, res) => {
  res.status(200).render('customContent', { znsOptions });
};

/**
 * Render UI
 * @param req
 * @param res
 */
exports.login = async (req, res) => {
  res.render('login', { error: false });
};
