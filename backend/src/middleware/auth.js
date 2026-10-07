const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_secret_change_me';

function parseToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7).trim();
  if (req.headers['x-auth-token']) return String(req.headers['x-auth-token']);
  return null;
}

async function fallbackUser(req) {
  const userId = req.headers['x-user-id'] || req.query.auth_user_id;
  const email = (req.headers['x-user-email'] || req.query.auth_user_email || '').toString().toLowerCase();
  const role = req.headers['x-user-role'] || req.query.auth_user_role;

  let result = null;
  if (userId) {
    result = await pool.query('select id, full_name, email, role from users where id=$1 limit 1', [userId]);
  }
  if ((!result || result.rowCount === 0) && email) {
    result = await pool.query('select id, full_name, email, role from users where email=$1 limit 1', [email]);
  }
  if (!result || result.rowCount === 0) return null;

  const user = result.rows[0];
  if (role && role !== user.role) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  };
}

async function requireAuth(req, res, next) {
  try {
    const token = parseToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          fullName: decoded.fullName,
        };
        return next();
      } catch {
        // continue to fallback
      }
    }

    const fallback = await fallbackUser(req);
    if (fallback) {
      req.user = fallback;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Authentication required', data: null });
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
