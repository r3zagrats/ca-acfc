// const SFMCCARouter = require('./sfmcca.routes');
const ChannelsRouter = require('./channels.routes');
const ZOARouter = require('./ZOA.routes');
const UsersRouter = require('./users.routes');
const ZaloApiRouter = require('./zaloapi.routes');
const SFMCApiRouter = require('./sfmcapi.routes');
const ZaloWebhook = require('../webhook/zalo');
const MainRouter = require('../controllers/index.controllers');
const SFMCCARouter = require('./sfmcca.routes');
const SMSSendersRouter = require('./SMSSenders.routes');

const Router = (app) => {
  // Zalo Routes
  app.use('/api/zalo', ZaloApiRouter);

  // SFMC Routes
  app.use('/api/sfmc', SFMCApiRouter);

  // Channels Routes
  app.use('/api/channels', ChannelsRouter);

  // Zalo OA Routes
  app.use('/api/zoa', ZOARouter);

  // Users Routes
  app.use('/api/users', UsersRouter);

  // SMSSenders Routes
  app.use('/api/smssenders', SMSSendersRouter);

  // Zalo webhook
  app.post('/webhook/zalo', ZaloWebhook);

  app.use('/sfmcca/config.json', MainRouter.config);
  app.get('/login', MainRouter.login);
  app.get('/admin', MainRouter.admin);
  app.get('/favicon.ico', (req, res) => res.status(204));
  // SFMCCA Routes
  app.use('/sfmcca/journey', SFMCCARouter);

  // Custom Content Block
  app.use('/sfmcccb', MainRouter.sfmcccb);

  // Custom Activity
  app.use('/sfmcca', MainRouter.sfmcca);

  app.use('/', (req, res) => {
    res.redirect('http://whitespace.vn/');
  });
  // app.get('/*', (req, res) => {
  //   res.sendFile(path.join(__dirname, 'build', 'index.html'));
  // });
};

module.exports = Router;
