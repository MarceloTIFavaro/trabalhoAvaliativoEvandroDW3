const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'financeiro_db',
    password: process.env.DB_PASS || 'postdba',
    port: parseInt(process.env.DB_PORT) || 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
  };