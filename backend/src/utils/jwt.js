const jwt = require('jsonwebtoken');
const { accessTokenSecret, refreshTokenSecret, jwtIssuer, jwtAudience } = require('../config/env');

function signAccessToken(sub, claims = {}, expiresIn = '10m') {
  return jwt.sign({ ...claims }, accessTokenSecret, {
    subject: String(sub),
    issuer: jwtIssuer,
    audience: jwtAudience,
    expiresIn,
    algorithm: 'HS256'
  });
}

function signRefreshToken(sub, claims = {}, expiresIn = '7d') {
  return jwt.sign({ ...claims }, refreshTokenSecret, {
    subject: String(sub),
    issuer: jwtIssuer,
    audience: jwtAudience,
    expiresIn,
    algorithm: 'HS256'
  });
}

function verifyAccess(token) {
  return jwt.verify(token, accessTokenSecret, { issuer: jwtIssuer, audience: jwtAudience });
}

function verifyRefresh(token) {
  return jwt.verify(token, refreshTokenSecret, { issuer: jwtIssuer, audience: jwtAudience });
}

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh };
