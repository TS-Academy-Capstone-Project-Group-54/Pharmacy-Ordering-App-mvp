const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
function isValidEmail(email) {
  return emailRegex.test(String(email).trim().toLowerCase());
}

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address } = req.body || {};
    if (!fullName || !email || !password || !phoneNumber || !address) return fail(res, 'Unable to create your account.', 400);

    // Add email format validation
    if (!isValidEmail(email)) {
      return fail(res, 'Please provide a valid email address.', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await pool.query('select id from users where email=$1 limit 1', [normalizedEmail]);
    if (existing.rowCount > 0) return fail(res, 'Account already exists with that email.', 409);

    const passwordHash = await bcrypt.hash(String(password), 10);
    const created = await pool.query(
      `insert into users (full_name,email,password_hash,phone_number,address,role)
       values ($1,$2,$3,$4,$5,'customer')
       returning id, full_name, email, role`,
      [fullName, normalizedEmail, passwordHash, phoneNumber, address],
    );

    const u = created.rows[0];
    const payload = { userId: u.id, fullName: u.full_name, email: u.email, role: u.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return ok(res, 'Account created successfully', { ...payload, token });
  } catch {
    return fail(res, 'Unable to create your account.', 500);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return fail(res, 'Invalid email or password.', 400);

    // Add email format validation for login
    if (!isValidEmail(email)) {
      return fail(res, 'Invalid email or password.', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query('select id, full_name, email, role, password_hash from users where email=$1 limit 1', [normalizedEmail]);
    if (result.rowCount === 0) return fail(res, 'Invalid email or password.', 401);

    const user = result.rows[0];
    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) return fail(res, 'Invalid email or password.', 401);

    const payload = { userId: user.id, fullName: user.full_name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return ok(res, 'Logged in successfully', { ...payload, token });
  } catch {
    return fail(res, 'Unable to connect to the server.', 500);
  }
});

router.post('/logout', async (_req, res) => ok(res, 'Logged out successfully', { loggedOut: true }));

router.get('/me', requireAuth, async (req, res) => {
  const token = jwt.sign(req.user, JWT_SECRET, { expiresIn: '7d' });
  return ok(res, 'Current user', { ...req.user, token });
});

module.exports = router;
