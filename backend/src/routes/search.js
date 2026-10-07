const express = require('express');
const { pool } = require('../db');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return ok(res, 'Search results', { medicines: [], categories: [], faqs: [], posts: [] });

  const meds = await pool.query(
    `select id, name, generic_name as "genericName" from medicines
     where is_available=true and (name ilike $1 or generic_name ilike $2)
     limit 6`,
    [`%${q}%`, `%${q}%`],
  );

  const cats = await pool.query('select id, name from categories where name ilike $1 limit 4', [`%${q}%`]);

  const faqs = [
    { id: 'faq-1', question: 'How do I place an order in Nigeria?', href: '/about#faq' },
    { id: 'faq-2', question: 'Do you deliver across Lagos and Abuja?', href: '/about#faq' },
  ].filter((f) => f.question.toLowerCase().includes(q.toLowerCase()));

  const posts = [
    { id: 'tip-1', title: 'Managing cold and flu season in Nigeria', href: '/about#health-tips', lastUpdated: '2026-01-10' },
    { id: 'tip-2', title: 'Safe medicine storage during hot weather', href: '/about#health-tips', lastUpdated: '2026-01-18' },
  ].filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return ok(res, 'Search results', {
    medicines: meds.rows,
    categories: cats.rows,
    faqs,
    posts,
  });
});

module.exports = router;
