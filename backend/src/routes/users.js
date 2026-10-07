const express = require('express');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
  const q = await pool.query(
    'select id, full_name as "fullName", email, phone_number as "phoneNumber", address, role, created_at from users where id=$1 limit 1',
    [req.user.userId],
  );
  if (q.rowCount === 0) return fail(res, 'User not found', 404);
  return ok(res, 'Profile loaded', q.rows[0]);
});

router.put('/profile', requireAuth, async (req, res) => {
  const { fullName, phoneNumber, address } = req.body || {};
  if (!fullName || !phoneNumber || !address) return fail(res, 'Invalid profile data', 400);

  const q = await pool.query(
    `update users set full_name=$1, phone_number=$2, address=$3, updated_at=now() where id=$4
     returning id, full_name as "fullName", email, phone_number as "phoneNumber", address, role`,
    [fullName, phoneNumber, address, req.user.userId],
  );
  return ok(res, 'Profile updated successfully', q.rows[0]);
});

module.exports = router;
