const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const CATEGORIES = [
  ['Pain Relief', 'Analgesics and fever reducers for headaches, body pain, and inflammation.'],
  ['Antibiotics', 'NAFDAC-verified antibacterial medications for infections.'],
  ['Vitamins', 'Daily immune boosters, multivitamins, and mineral supplements.'],
  ['Cold & Flu', 'Fast relief for cough, catarrh, nasal congestion, and sore throat.'],
  ['Digestive Health', 'Antacids, oral rehydration salts (ORS), and gut care essentials.'],
  ['First Aid', 'Antiseptics, wound dressings, bandages, and emergency care supplies.'],
  ['Personal Care', 'Everyday hygiene, dermatological creams, and wellness care.'],
];

const MEDICINES = [
  {
    name: 'Emzor Paracetamol Tablets (Pack of 96)',
    genericName: 'Acetaminophen 500mg',
    category: 'Pain Relief',
    price: '1500.00',
    quantity: 120,
    dosage: '1–2 tablets every 4–6 hours (max 8/day)',
    manufacturer: 'Emzor Pharmaceutical Industries, Lagos',
    image: 'https://image.thum.io/get/width/1200/https://www.emzorpharma.com/upcp_product/emzor-paracetamol-500mg-tablets-96/',
    expiryDate: '2028-01-15',
    requiresPrescription: false,
    description: 'Trusted Nigerian analgesic and antipyretic for fever and body pain.',
  },
  {
    name: 'Procold Cold & Flu Relief Tablets',
    genericName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
    category: 'Cold & Flu',
    price: '1800.00',
    quantity: 110,
    dosage: '1 tablet 3 times daily',
    manufacturer: 'Orange Drugs Nigeria',
    image: 'http://mysasun.com/cdn/shop/files/ChatGPTImageApr21_2026_03_04_42PM.png?v=1776801966',
    expiryDate: '2027-12-01',
    requiresPrescription: false,
    description: 'Multi-symptom cold and flu relief.',
  },
];

async function ensureSeeded() {
  const shouldAutoSeed = process.env.NODE_ENV !== 'production' || process.env.SEED_ON_BOOT === 'true';
  if (!shouldAutoSeed) return;

  const admin = await pool.query('select id from users where email=$1 limit 1', ['admin@naijacare.com']);
  if (admin.rowCount === 0) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      `insert into users (full_name,email,password_hash,phone_number,address,role)
       values ($1,$2,$3,$4,$5,'admin')`,
      ['Admin Pharmacist', 'admin@naijacare.com', hash, '+2348001112222', '12 Marina Road, Lagos'],
    );
  }

  const customer = await pool.query('select id from users where email=$1 limit 1', ['customer@naijacare.com']);
  if (customer.rowCount === 0) {
    const hash = await bcrypt.hash('Customer123!', 10);
    await pool.query(
      `insert into users (full_name,email,password_hash,phone_number,address,role)
       values ($1,$2,$3,$4,$5,'customer')`,
      ['Chinedu Okafor', 'customer@naijacare.com', hash, '+2348093334444', '24 Wuse Zone 2, Abuja'],
    );
  }

  const categoryRows = [];
  for (const [name, description] of CATEGORIES) {
    const row = await pool.query(
      `insert into categories (name, description, is_active)
       values ($1, $2, true)
       on conflict (name) do update set description = excluded.description
       returning id`,
      [name, description],
    );
    categoryRows.push({ name, id: row.rows[0]?.id ?? null });
  }

  const byName = (name) => categoryRows.find((c) => c.name === name)?.id ?? null;

  for (const m of MEDICINES) {
    const existing = await pool.query('select id from medicines where name=$1 limit 1', [m.name]);
    if (existing.rowCount > 0) continue;

    await pool.query(
      `insert into medicines
      (name,generic_name,description,category_id,price,quantity_in_stock,dosage,manufacturer,image,expiry_date,requires_prescription,is_available)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)`,
      [
        m.name,
        m.genericName,
        m.description,
        byName(m.category),
        m.price,
        m.quantity,
        m.dosage,
        m.manufacturer,
        m.image,
        new Date(m.expiryDate),
        m.requiresPrescription,
      ],
    );
  }
}

module.exports = { ensureSeeded };
