const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false,
  },
});

pool.query('SELECT current_database(), current_user')
  .then(result => {
    console.log('Database connected:', result.rows[0]);
  })
  .catch(error => {
    console.error('Database connection failed:', error.message);
  });

module.exports = { pool };