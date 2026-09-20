const jwt = require('jsonwebtoken');

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const generateCookieToken = (res, id) => {
  const token = generateToken(id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_TTL_MS,
    path: '/',
  });
  return token;
};

module.exports = { generateToken, generateCookieToken };
