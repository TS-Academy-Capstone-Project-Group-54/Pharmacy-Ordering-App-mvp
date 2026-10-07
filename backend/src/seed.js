const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const CATEGORIES = [
  ['Pain Relief', 'Analgesics and fever reducers.'],
  ['Antibiotics', 'Bacterial infection medications.'],
  ['Vitamins', 'Daily wellness and supplements.'],
  ['Cold & Flu', 'Relief for cold/flu symptoms.'],
  ['Digestive Health', 'Stomach and rehydration support.'],
  ['First Aid', 'Antiseptics and emergency essentials.'],
  ['Personal Care', 'Skin and hygiene products.'],
];

const MEDICINES = [
  {
    name: 'Emzor Paracetamol Tablets (Pack of 96)',
    genericName: 'Acetaminophen 500mg',
    category: 'Pain Relief',
    price: '1500.00',
    quantity: 120,
    dosage: '1–2 tablets every 4–6 hours',
    manufacturer: 'Emzor Pharmaceutical Industries, Lagos',
    image: 'https://image.thum.io/get/width/1200/https://www.emzorpharma.com/upcp_product/emzor-paracetamol-500mg-tablets-96/',
    expiryDate: '2027-10-01',
    requiresPrescription: false,
    description: 'Pain and fever relief.',
  },
  {
    name: 'Fidson Ibuprofen Caplets 400mg',
    genericName: 'Ibuprofen 400mg',
    category: 'Pain Relief',
    price: '2200.00',
    quantity: 85,
    dosage: '1 caplet 3 times daily after food',
    manufacturer: 'Fidson Healthcare Plc, Ota',
    image: 'https://cdn.sanity.io/images/zbeduy22/production/f2320d562bf550e3bc3a1cf78b85954f8d9a8f6e-600x600.jpg',
    expiryDate: '2027-11-15',
    requiresPrescription: false,
    description: 'Anti-inflammatory pain relief.',
  },
  {
    name: 'Amoxil Capsules 500mg',
    genericName: 'Amoxicillin Trihydrate 500mg',
    category: 'Antibiotics',
    price: '4800.00',
    quantity: 50,
    dosage: '1 capsule every 8 hours for 5–7 days',
    manufacturer: 'GSK / Fidson Healthcare Nigeria',
    image: 'https://www.memontraders.com/wp-content/uploads/2022/06/Amoxil-Amoxycillin-500mg.jpg',
    expiryDate: '2027-08-20',
    requiresPrescription: true,
    description: 'Broad-spectrum antibiotic.',
  },
  {
    name: 'Augmentin 625mg Film-Coated Tablets',
    genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'Antibiotics',
    price: '14500.00',
    quantity: 35,
    dosage: '1 tablet twice daily with meals',
    manufacturer: 'GlaxoSmithKline Nigeria',
    image: 'https://cdn11.bigcommerce.com/s-dmb1ykvg7m/products/31196/images/14834/AUGMENTIN_625MG_TAB__29542.1721014607.386.513.jpg?c=2',
    expiryDate: '2027-09-30',
    requiresPrescription: true,
    description: 'Combination antibiotic for resistant infections.',
  },
  {
    name: 'Em-Vit-C Chewable 1000mg Tablets',
    genericName: 'Ascorbic Acid 1000mg',
    category: 'Vitamins',
    price: '2800.00',
    quantity: 150,
    dosage: '1 tablet daily',
    manufacturer: 'Emzor Pharmaceutical Industries, Lagos',
    image: 'https://image.thum.io/get/width/1200/https://www.emzorpharma.com/upcp_product/em-vit-c-100mg-tabs-chewable-1000/',
    expiryDate: '2028-03-01',
    requiresPrescription: false,
    description: 'Vitamin C supplement for immunity support.',
  },
  {
    name: 'Wellman / Multivitamin + Zinc Daily Pack',
    genericName: 'Multivitamins + Zinc Sulphate 50mg',
    category: 'Vitamins',
    price: '6500.00',
    quantity: 75,
    dosage: '1 tablet daily after breakfast',
    manufacturer: 'Vitabiotics',
    image: 'https://thehealthpharmacy.co.uk/wp-content/uploads/2025/09/wellmanmax-2.webp',
    expiryDate: '2028-04-10',
    requiresPrescription: false,
    description: 'Daily wellness micronutrient support.',
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
  {
    name: 'Benylin with Codeine Free Cough Syrup 100ml',
    genericName: 'Diphenhydramine + Levomenthol',
    category: 'Cold & Flu',
    price: '3900.00',
    quantity: 60,
    dosage: '10ml 3–4 times daily',
    manufacturer: 'Johnson & Johnson / Nigeria',
    image: 'https://zimetro.co.zw/wp-content/uploads/2024/04/Benylin-with-codeine.jpg',
    expiryDate: '2027-11-01',
    requiresPrescription: false,
    description: 'Soothing cough syrup.',
  },
  {
    name: 'WHO Formula ORS Rehydration Sachets (Box of 10)',
    genericName: 'Oral Rehydration Salts',
    category: 'Digestive Health',
    price: '2500.00',
    quantity: 200,
    dosage: 'Dissolve 1 sachet in 1 litre of clean water',
    manufacturer: 'May & Baker Nigeria Plc',
    image: 'http://janswasthyavitran.website/cdn/shop/files/71lLXSonqyL._AC_UF1000_1000_QL80.jpg?crop=center&height=1200&v=1744394493&width=1200',
    expiryDate: '2028-06-20',
    requiresPrescription: false,
    description: 'Fluid and electrolyte replacement.',
  },
  {
    name: 'Gestid Antacid Suspension 200ml',
    genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
    category: 'Digestive Health',
    price: '3200.00',
    quantity: 90,
    dosage: '1–2 teaspoons after meals and at bedtime',
    manufacturer: 'Sun Pharma',
    image: 'https://hollyswellness.com/wp-content/uploads/2026/02/IMG_0687.png',
    expiryDate: '2027-09-12',
    requiresPrescription: false,
    description: 'Relief from heartburn and indigestion.',
  },
  {
    name: 'Dettol Antiseptic Disinfectant Liquid 250ml',
    genericName: 'Chloroxylenol 4.8% w/v',
    category: 'First Aid',
    price: '3400.00',
    quantity: 95,
    dosage: 'Dilute for skin cleansing',
    manufacturer: 'Reckitt Benckiser',
    image: 'https://surgicaldirect.com.au/wp-content/uploads/2024/06/DETTOL-Antiseptic-Disinfectant-Liquid-250ml.jpg',
    expiryDate: '2029-01-01',
    requiresPrescription: false,
    description: 'First-aid antiseptic for cuts and grazes.',
  },
  {
    name: 'Funbact-A Triple Action Skin Cream 30g',
    genericName: 'Clotrimazole + Betamethasone + Neomycin',
    category: 'Personal Care',
    price: '2700.00',
    quantity: 45,
    dosage: 'Apply thin layer twice daily',
    manufacturer: 'Bliss GVS',
    image: 'http://afrobuy.co.uk/cdn/shop/products/funbact-a-beauty-health-545_400x_42733f5e-deb6-47f1-a5ed-f0c2f16a1325_800x.webp?v=1756997574',
    expiryDate: '2027-12-12',
    requiresPrescription: true,
    description: 'For inflammatory skin conditions.',
  },
];

async function ensureSeeded() {
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

  const categoryIds = {};
  for (const [name, description] of CATEGORIES) {
    const row = await pool.query(
      `insert into categories (name,description,is_active)
       values ($1,$2,true)
       on conflict (name) do update set description=excluded.description
       returning id`,
      [name, description],
    );
    categoryIds[name] = row.rows[0].id;
  }

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
        categoryIds[m.category],
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
