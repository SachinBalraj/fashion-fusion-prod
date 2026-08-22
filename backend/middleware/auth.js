const jwt = require('jsonwebtoken');
const User = require('../models/User');

const resolveUserFromToken = async (req) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return null;
  }
  return user;
};

const protect = async (req, res, next) => {
  try {
    const user = await resolveUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const user = await resolveUserFromToken(req);
    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { protect, optionalProtect, admin };
