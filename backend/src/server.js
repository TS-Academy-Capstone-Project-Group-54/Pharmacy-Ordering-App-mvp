const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db');
const { ok } = require('./utils/response');
const { ensureSeeded } = require('./seed');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const medicineRoutes = require('./routes/medicines');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'https://localhost:3000'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

app.post('/api/seed', async (_req, res) => {
  await ensureSeeded();
  return ok(res, 'Database seeded', { seeded: true });
});

app.get('/api/health', async (_req, res) => {
  await pool.query('select 1');
  return ok(res, 'Healthy', { ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error', data: null });
});

const port = process.env.PORT || 5000;

ensureSeeded().catch((e) => console.error('Seed bootstrap failed:', e));

app.listen(port, () => {
  console.log(`Backend API running on :${port}`);
});
