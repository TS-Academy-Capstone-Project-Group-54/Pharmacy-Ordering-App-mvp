const express = require('express');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { deliveryAddress, phoneNumber, paymentStatus = 'Pending', items = [] } = req.body || {};
  if (!deliveryAddress || !phoneNumber || !Array.isArray(items) || items.length === 0) {
    return fail(res, 'Order could not be placed.', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    const prepared = [];

    for (const item of items) {
      const medQ = await client.query('select * from medicines where id=$1 limit 1', [item.medicineId]);
      if (medQ.rowCount === 0) throw new Error('not-found');
      const med = medQ.rows[0];
      const qty = Number(item.quantity);
      if (!med.is_available || med.quantity_in_stock < qty) throw new Error('insufficient-stock');
      const unitPrice = Number(med.price);
      const subtotal = unitPrice * qty;
      total += subtotal;
      prepared.push({ med, qty, unitPrice, subtotal });
    }

    const orderQ = await client.query(
      `insert into orders (customer_id,total_amount,delivery_address,phone_number,order_status,payment_status)
       values ($1,$2,$3,$4,'Pending',$5) returning *`,
      [req.user.userId, String(total), deliveryAddress, phoneNumber, paymentStatus],
    );
    const order = orderQ.rows[0];

    for (const p of prepared) {
      await client.query(
        `insert into order_items (order_id,medicine_id,medicine_name,quantity,unit_price,subtotal)
         values ($1,$2,$3,$4,$5,$6)`,
        [order.id, p.med.id, p.med.name, p.qty, String(p.unitPrice), String(p.subtotal)],
      );
      await client.query('update medicines set quantity_in_stock=$1, updated_at=now() where id=$2', [p.med.quantity_in_stock - p.qty, p.med.id]);
    }

    await client.query('COMMIT');
    return ok(res, 'Order placed successfully', order);
  } catch (e) {
    await client.query('ROLLBACK');
    if (String(e.message).includes('insufficient-stock')) return fail(res, 'Insufficient stock.', 400);
    if (String(e.message).includes('not-found')) return fail(res, 'One or more selected medicines are unavailable.', 400);
    return fail(res, 'Order could not be placed.', 500);
  } finally {
    client.release();
  }
});

router.get('/my-orders', requireAuth, async (req, res) => {
  const q = await pool.query(
    `select
       id,
       customer_id as "customerId",
       total_amount as "totalAmount",
       delivery_address as "deliveryAddress",
       phone_number as "phoneNumber",
       order_status as "orderStatus",
       payment_status as "paymentStatus",
       created_at as "createdAt",
       updated_at as "updatedAt"
     from orders
     where customer_id=$1
     order by created_at desc`,
    [req.user.userId]
  );

  return ok(res, 'My orders loaded', q.rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const orderQ = await pool.query(
  `select
     id,
     customer_id as "customerId",
     total_amount as "totalAmount",
     delivery_address as "deliveryAddress",
     phone_number as "phoneNumber",
     order_status as "orderStatus",
     payment_status as "paymentStatus",
     created_at as "createdAt",
     updated_at as "updatedAt"
   from orders
   where id=$1
   limit 1`,
  [req.params.id]
);
  if (orderQ.rowCount === 0) return fail(res, 'Order not found', 404);
  const order = orderQ.rows[0];

  if (req.user.role !== 'admin' && order.customerId !== req.user.userId) {
    return fail(res, 'You do not have permission to perform this action.', 403);
  }

 const items = await pool.query(
  `select
     id,
     order_id as "orderId",
     medicine_id as "medicineId",
     medicine_name as "medicineName",
     quantity,
     unit_price as "unitPrice",
     subtotal,
     created_at as "createdAt"
   from order_items
   where order_id=$1`,
  [order.id]
);
  return ok(res, 'Order details loaded', { ...order, items: items.rows });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const status = (req.query.status || '').toString();
  const search = (req.query.search || '').toString().trim().toLowerCase();

  const params = [];
  let where = '';
  if (status) {
    params.push(status);
    where = `where o.order_status=$1`;
  }

  const q = await pool.query(
    `select o.id, o.order_status, o.payment_status, o.total_amount, o.created_at, u.full_name as customer_name, u.email as customer_email
     from orders o left join users u on u.id=o.customer_id ${where}
     order by o.created_at desc`,
    params,
  );

  const rows = search
    ? q.rows.filter((r) => (r.customer_name || '').toLowerCase().includes(search) || r.id.includes(search))
    : q.rows;

  return ok(res, 'Orders loaded', {
    items: rows,
    stats: {
      totalOrders: rows.length,
      pending: rows.filter((r) => r.order_status === 'Pending').length,
      processing: rows.filter((r) => r.order_status === 'Processing').length,
      completed: rows.filter((r) => r.order_status === 'Delivered').length,
    },
  });
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const allowed = ['Pending', 'Confirmed', 'Processing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const status = req.body?.orderStatus;
  if (!allowed.includes(status)) return fail(res, 'Invalid order status', 400);

  const existingQ = await pool.query('select * from orders where id=$1 limit 1', [req.params.id]);
  if (existingQ.rowCount === 0) return fail(res, 'Order not found', 404);
  const existing = existingQ.rows[0];

  const updatedQ = await pool.query('update orders set order_status=$1, updated_at=now() where id=$2 returning *', [status, req.params.id]);
  const updated = updatedQ.rows[0];

  if (existing.order_status !== 'Cancelled' && status === 'Cancelled') {
    const items = await pool.query('select * from order_items where order_id=$1', [req.params.id]);
    for (const item of items.rows) {
      await pool.query('update medicines set quantity_in_stock=quantity_in_stock + $1, updated_at=now() where id=$2', [item.quantity, item.medicine_id]);
    }
  }

  return ok(res, 'Order status updated', updated);
});

module.exports = router;
