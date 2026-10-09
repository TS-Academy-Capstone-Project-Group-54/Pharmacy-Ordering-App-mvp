const express = require('express');
const { pool } = require('../db');
const { ok, fail } = require('../utils/response');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function normalizeString(value) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function validateMedicinePayload(payload, { allowPartial = false } = {}) {
  const errors = [];
  const data = payload || {};

  const requiredFields = [
    ['name', 'Medicine name'],
    ['genericName', 'Generic name'],
    ['description', 'Description'],
    ['dosage', 'Dosage'],
    ['manufacturer', 'Manufacturer'],
    ['image', 'Image URL'],
    ['expiryDate', 'Expiry date'],
  ];

  for (const [field, label] of requiredFields) {
    const value = normalizeString(data[field]);
    if (!allowPartial && !value) {
      errors.push(`${label} is required.`);
    }
    if (allowPartial && value === '' && field !== 'expiryDate') {
      continue;
    }
  }

  const name = normalizeString(data.name);
  const genericName = normalizeString(data.genericName);
  const description = normalizeString(data.description);
  const dosage = normalizeString(data.dosage);
  const manufacturer = normalizeString(data.manufacturer);
  const image = normalizeString(data.image);

  if (name && name.length < 2) errors.push('Medicine name must be at least 2 characters long.');
  if (genericName && genericName.length < 2) errors.push('Generic name must be at least 2 characters long.');
  if (description && description.length < 10) errors.push('Description must be at least 10 characters long.');
  if (dosage && dosage.length < 2) errors.push('Dosage is invalid.');
  if (manufacturer && manufacturer.length < 2) errors.push('Manufacturer is invalid.');
  if (image && !/^https?:\/\//i.test(image)) errors.push('Image URL must start with http:// or https://.');

  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const price = Number(data.price);
    if (!Number.isFinite(price) || price <= 0) {
      errors.push('Price must be a valid number greater than 0.');
    }
  } else if (!allowPartial) {
    errors.push('Price is required.');
  }

  if (data.quantityInStock !== undefined && data.quantityInStock !== null && data.quantityInStock !== '') {
    const quantity = Number(data.quantityInStock);
    if (!Number.isInteger(quantity) || quantity < 0) {
      errors.push('Quantity in stock must be a whole number greater than or equal to 0.');
    }
  } else if (!allowPartial) {
    errors.push('Quantity in stock is required.');
  }

  if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
    const categoryId = Number(data.categoryId);
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      errors.push('Category ID must be a positive number.');
    }
  }

  if (data.expiryDate !== undefined && data.expiryDate !== null && data.expiryDate !== '') {
    const expiry = new Date(data.expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      errors.push('Expiry date must be a valid ISO date.');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        errors.push('Expiry date must be a future date.');
      }
    }
  } else if (!allowPartial) {
    errors.push('Expiry date is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

router.get('/', async (req, res) => {
  const search = (req.query.search || '').toString().trim();
  const category = (req.query.category || '').toString().trim();
  const availability = (req.query.availability || '').toString().trim();
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
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
    `select
      m.id,
      m.name,
      m.generic_name as "genericName",
      m.description,
      m.category_id as "categoryId",
      c.name as "categoryName",
      m.price,
      m.quantity_in_stock as "quantityInStock",
      m.dosage,
      m.manufacturer,
      m.image,
      m.expiry_date as "expiryDate",
      m.requires_prescription as "requiresPrescription",
      m.is_available as "isAvailable",
      m.created_at as "createdAt",
      m.updated_at as "updatedAt"
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
    const validation = validateMedicinePayload(b);
    if (!validation.valid) {
      return fail(res, validation.errors.join(' '), 400);
    }

    const q = await pool.query(
      `insert into medicines (name,generic_name,description,category_id,price,quantity_in_stock,dosage,manufacturer,image,expiry_date,requires_prescription,is_available)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       returning *`,
      [
        normalizeString(b.name),
        normalizeString(b.genericName),
        normalizeString(b.description),
        b.categoryId === undefined || b.categoryId === null || b.categoryId === '' ? null : Number(b.categoryId),
        String(Number(b.price)),
        Number(b.quantityInStock),
        normalizeString(b.dosage),
        normalizeString(b.manufacturer),
        normalizeString(b.image),
        new Date(b.expiryDate),
        !!b.requiresPrescription,
        b.isAvailable !== false,
      ],
    );

    return ok(res, 'Medicine created successfully', q.rows[0]);
  } catch (error) {
    console.error('Create medicine error:', error);
    return fail(res, 'Unable to create medicine', 500);
  }
});

router.get('/:id', async (req, res) => {
  const medicineId = Number(req.params.id);
  if (!Number.isInteger(medicineId) || medicineId <= 0) {
    return fail(res, 'Medicine ID must be a positive integer.', 400);
  }

  const q = await pool.query(
    `select
      m.id,
      m.name,
      m.generic_name as "genericName",
      m.description,
      m.category_id as "categoryId",
      c.name as "categoryName",
      m.price,
      m.quantity_in_stock as "quantityInStock",
      m.dosage,
      m.manufacturer,
      m.image,
      m.expiry_date as "expiryDate",
      m.requires_prescription as "requiresPrescription",
      m.is_available as "isAvailable",
      m.created_at as "createdAt",
      m.updated_at as "updatedAt"
     from medicines m
     left join categories c on c.id = m.category_id
     where m.id=$1
     limit 1`,
    [medicineId],
  );
  if (q.rowCount === 0) return fail(res, 'Medicine not found', 404);
  return ok(res, 'Medicine loaded', q.rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const validation = validateMedicinePayload(b, { allowPartial: true });
    if (!validation.valid) {
      return fail(res, validation.errors.join(' '), 400);
    }

    const q = await pool.query(
      `update medicines set
        name=$1,generic_name=$2,description=$3,category_id=$4,price=$5,quantity_in_stock=$6,dosage=$7,manufacturer=$8,image=$9,expiry_date=$10,requires_prescription=$11,is_available=$12,updated_at=now()
        where id=$13 returning *`,
      [
        normalizeString(b.name),
        normalizeString(b.genericName),
        normalizeString(b.description),
        b.categoryId === undefined || b.categoryId === null || b.categoryId === '' ? null : Number(b.categoryId),
        String(Number(b.price)),
        Number(b.quantityInStock),
        normalizeString(b.dosage),
        normalizeString(b.manufacturer),
        normalizeString(b.image),
        new Date(b.expiryDate),
        !!b.requiresPrescription,
        b.isAvailable !== false,
        req.params.id,
      ],
    );
    if (q.rowCount === 0) return fail(res, 'Medicine not found', 404);
    return ok(res, 'Medicine updated successfully', q.rows[0]);
  } catch (error) {
    console.error('Update medicine error:', error);
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
