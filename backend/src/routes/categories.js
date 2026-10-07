const express = require('express');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  const rows = await pool.query(
    `select
       id,
       name,
       description,
       is_active as "isActive",
       created_at as "createdAt",
       updated_at as "updatedAt"
     from categories
     order by created_at desc`
  );

  return ok(res, 'Categories loaded', rows.rows);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body || {};
    if (!name || !description) return fail(res, 'Invalid category data', 400);

    const created = await pool.query(
      `insert into categories (name, description, is_active)
       values ($1, $2, $3)
       returning
         id,
         name,
         description,
         is_active as "isActive",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [name, description, !!isActive],
    );
    return ok(res, 'Category created successfully', created.rows[0]);
  } catch {
    return fail(res, 'Unable to create category', 500);
  }
});

router.get('/:id', async (req, res) => {
  const row = await pool.query(
    `select
       id,
       name,
       description,
       is_active as "isActive",
       created_at as "createdAt",
       updated_at as "updatedAt"
     from categories
     where id=$1
     limit 1`,
    [req.params.id]
  );

  if (row.rowCount === 0) {
    return fail(res, 'Category not found', 404);
  }

  return ok(res, 'Category loaded', row.rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, isActive = true } = req.body || {};
  if (!name || !description) return fail(res, 'Invalid category data', 400);

  const row = await pool.query(
    `update categories
     set name=$1, description=$2, is_active=$3, updated_at=now()
     where id=$4
     returning
       id,
       name,
       description,
       is_active as "isActive",
       created_at as "createdAt",
       updated_at as "updatedAt"`,
    [name, description, !!isActive, req.params.id],
  );
  if (row.rowCount === 0) return fail(res, 'Category not found', 404);
  return ok(res, 'Category updated successfully', row.rows[0]);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const row = await pool.query(
    'update categories set is_active=false, updated_at=now() where id=$1 returning *',
    [req.params.id],
  );
  if (row.rowCount === 0) return fail(res, 'Category not found', 404);
  return ok(res, 'Category deactivated', row.rows[0]);
});

module.exports = router;
