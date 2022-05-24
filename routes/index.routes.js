'use strict';

// const SFMCCARouter = require('./sfmcca.routes');
const ChannelsRouter = require('./channels.routes');
const ZOARouter = require('./ZOA.routes');
const UsersRouter = require('./users.routes');
const ZaloRouter = require('./zalo.routes');
const SFMCRouter = require('./sfmc.routes');
const ZaloWebhook = require('../services/zalo/webhook');
const MainRouter = require('../controllers/index.controllers');

const Router = (app) => {
  // Zalo Routes
  app.use('/api/zalo', ZaloRouter);

  // SFMC Routes
  app.use('/api/sfmc', SFMCRouter);

  // Channels Routes
  app.use('/api/channels', ChannelsRouter);

  // Zalo OA Routes
  app.use('/api/zoa', ZOARouter);

  // Channels Routes
  app.use('/api/users', UsersRouter);

  // Zalo webhook
  app.post('/webhook/zalo', ZaloWebhook);

  app.use('/config.json', MainRouter.config);
  app.get('/login', MainRouter.login);
  app.get('/admin', MainRouter.admin);
  app.get('/favicon.ico', (req, res) => res.status(204));
  // SFMCCA Routes
  // app.use('/sfmcca', SFMCCARouter);

  // Custom Content Block
  app.use('/sfmcccb', MainRouter.sfmcccb);

  // Custom Activity
  app.use('/', MainRouter.sfmcca);
};

module.exports = Router;
