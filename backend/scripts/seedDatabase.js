import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const splitSqlStatements = (sql) => {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
};

const seedDatabase = async () => {
  const seedPath = path.join(__dirname, '../config/seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');
  const statements = splitSqlStatements(sql);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });

  try {
    for (const statement of statements) {
      await connection.query(statement);
    }

    const [productRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM galaxy_sport.products'
    );
    const [variantRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM galaxy_sport.product_variants'
    );

    console.log(
      `Seed completed: ${productRows[0].total} products, ${variantRows[0].total} variants.`
    );
  } finally {
    await connection.end();
  }
};

seedDatabase().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
