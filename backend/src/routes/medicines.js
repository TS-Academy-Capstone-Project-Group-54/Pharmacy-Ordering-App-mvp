const express = require('express');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const search = (req.query.search || '').toString().trim();
  const category = (req.query.category || '').toString().trim();
  const availability = (req.query.availability || '').toString().trim();
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.max(Number(req.query.limit || 10), 1);
  const offset = (page - 1) * limit;

  const clauses = ['m.is_available = true'];
  const vals = [];
  let i = 1;
  if (search) {
    clauses.push(`(m.name ilike $${i} or m.generic_name ilike $${i + 1})`);
    vals.push(`%${search}%`, `%${search}%`);
    i += 2;
  }
  if (category) {
    clauses.push(`m.category_id = $${i}`);
    vals.push(category);
    i += 1;
  }
  if (availability === 'in-stock') clauses.push('m.quantity_in_stock > 0');
  if (availability === 'out-of-stock') clauses.push('m.quantity_in_stock = 0');

  const where = clauses.length ? `where ${clauses.join(' and ')}` : '';

  const rows = await pool.query(
    `select m.*, c.name as category_name
     from medicines m
     left join categories c on c.id = m.category_id
     ${where}
     order by m.name asc
     limit ${limit} offset ${offset}`,
    vals,
  );

  const total = await pool.query(`select count(*)::int as count from medicines m ${where}`, vals);

  return ok(res, 'Medicines loaded', {
    items: rows.rows,
    pagination: {
      total: total.rows[0]?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((total.rows[0]?.count || 0) / limit),
    },
  });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.genericName || !b.description || !b.price || b.quantityInStock == null || !b.dosage || !b.manufacturer || !b.image || !b.expiryDate) {
      return fail(res, 'Invalid medicine data', 400);
    }

    const q = await pool.query(
      `insert into medicines (name,generic_name,description,category_id,price,quantity_in_stock,dosage,manufacturer,image,expiry_date,requires_prescription,is_available)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       returning *`,
      [
        b.name,
        b.genericName,
        b.description,
        b.categoryId || null,
        String(Number(b.price)),
        Number(b.quantityInStock),
        b.dosage,
        b.manufacturer,
        b.image,
        new Date(b.expiryDate),
        !!b.requiresPrescription,
        b.isAvailable !== false,
      ],
    );

    return ok(res, 'Medicine created successfully', q.rows[0]);
  } catch {
    return fail(res, 'Unable to create medicine', 500);
  }
});

router.get('/:id', async (req, res) => {
  const q = await pool.query(
    `select m.*, c.name as category_name from medicines m left join categories c on c.id=m.category_id where m.id=$1 limit 1`,
    [req.params.id],
  );
  if (q.rowCount === 0) return fail(res, 'Medicine not found', 404);
  return ok(res, 'Medicine loaded', q.rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const q = await pool.query(
      `update medicines set
        name=$1,generic_name=$2,description=$3,category_id=$4,price=$5,quantity_in_stock=$6,dosage=$7,manufacturer=$8,image=$9,expiry_date=$10,requires_prescription=$11,is_available=$12,updated_at=now()
        where id=$13 returning *`,
      [
        b.name,
        b.genericName,
        b.description,
        b.categoryId || null,
        String(Number(b.price)),
        Number(b.quantityInStock),
        b.dosage,
        b.manufacturer,
        b.image,
        new Date(b.expiryDate),
        !!b.requiresPrescription,
        !!b.isAvailable,
        req.params.id,
      ],
    );
    if (q.rowCount === 0) return fail(res, 'Medicine not found', 404);
    return ok(res, 'Medicine updated successfully', q.rows[0]);
  } catch {
    return fail(res, 'Unable to update medicine', 500);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const q = await pool.query(
    'update medicines set is_available=false, quantity_in_stock=0, updated_at=now() where id=$1 returning *',
    [req.params.id],
  );
  if (q.rowCount === 0) return fail(res, 'Medicine not found', 404);
  return ok(res, 'Medicine deactivated', q.rows[0]);
});

module.exports = router;
