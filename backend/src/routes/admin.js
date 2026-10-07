const express = require('express');
const { pool } = require('../db');
const { ok } = require('../utils/response');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, async (_req, res) => {
  const [med, cust, total, pending, processing, completed] = await Promise.all([
    pool.query('select count(*)::int as c from medicines'),
    pool.query("select count(*)::int as c from users where role='customer'"),
    pool.query('select count(*)::int as c from orders'),
    pool.query("select count(*)::int as c from orders where order_status='Pending'"),
    pool.query("select count(*)::int as c from orders where order_status='Processing'"),
    pool.query("select count(*)::int as c from orders where order_status='Delivered'"),
  ]);

  return ok(res, 'Admin statistics loaded', {
    totalMedicines: med.rows[0].c,
    totalCustomers: cust.rows[0].c,
    pendingOrders: pending.rows[0].c,
    processingOrders: processing.rows[0].c,
    completedOrders: completed.rows[0].c,
    totalOrders: total.rows[0].c,
  });
});

module.exports = router;
