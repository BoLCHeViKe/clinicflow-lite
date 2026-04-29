const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinicflow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4',
});

// Verificar la conexión al arrancar con reintentos
async function waitForDB(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ MySQL conectado correctamente');
      conn.release();
      return;
    } catch (err) {
      console.warn(`⏳ MySQL no disponible aún (intento ${i}/${retries}): ${err.message}`);
      if (i === retries) {
        console.error('❌ No se pudo conectar a MySQL tras varios intentos');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

waitForDB();

module.exports = pool;
