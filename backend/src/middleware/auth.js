const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-change-me';

function parseToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7).trim();
  if (req.headers['x-auth-token']) return String(req.headers['x-auth-token']);
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = parseToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required', data: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Authentication required', data: null });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.', data: null });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
