require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const activityRouter = require('./routes/activity');
const neDbRouter = require('./routes/neDB');
const api = require('./routes/api');
const zalo = require('./routes/zalowh');
// const cors = require('cors')

const app = express();
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         'default-src': ["'self'"],
//         'frame-ancestors': ["'self'", `https://mc.${process.env.STACK}.exacttarget.com`, `https://jbinteractions.${process.env.STACK}.marketingcloudapps.com`, 'http://blocktester.herokuapp.com' ],
//       },
//     }, 
//   }),
// );
// app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.raw({
  type: 'application/jwt',
}));

app.use(express.static(path.join(__dirname, 'public')));

// serve config
app.use('/config.json', routes.config);
app.get('/login', routes.login);
app.post('/login', neDbRouter.authen);
app.get('/favicon.ico', (req, res) => res.status(204));
// custom activity routes
app.use('/journey/execute/', activityRouter.execute);
app.use('/journey/save/', activityRouter.save);
app.use('/journey/publish/', activityRouter.publish);
app.use('/journey/validate/', activityRouter.validate);
app.use('/journey/stop/', activityRouter.stop);
//neDB 
app.get('/db/service/', neDbRouter.select);
app.post('/db/selectone/', neDbRouter.selectone);
app.post('/db/service/', neDbRouter.insert);
app.put('/db/service/', neDbRouter.update);
app.delete('/db/service/', neDbRouter.delete);
app.get('/db/user/', neDbRouter.selectUser);
app.put('/db/user/', neDbRouter.updateUser);
// api
app.post('/api/getde/', api.getDe);
app.use('/api/getdecol/', api.getDeColumn);
app.use('/api/getderow/', api.getDeRow);
app.use('/api/getcontent/', api.getContent);
app.post('/api/insertde/', api.insertDE);
app.use('/api/getevent/', api.getAttEvent);
app.use('/api/zaloauth/', api.zaloAuth)
app.use('/api/test/', api.test);
// zalo webhook
app.post('/zalo/', zalo.zaloWebhook)

// serve Custom Content Block
app.use('/customContent', routes.customContent);

// serve Custom Activity
app.use('/', routes.customActivity);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('process.env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
