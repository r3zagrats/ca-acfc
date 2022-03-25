const JWT = require('jwt-simple');

module.exports = (body) => {
  if (!body) {
    return new Error('invalid jwtdata');
  }
  return JWT.decode(body.toString('utf8'), process.env.JWT);
};
