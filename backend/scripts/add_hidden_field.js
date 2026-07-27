import db from '../config/db.js';

const run = async () => {
  try {
    await db.execute(`ALTER TABLE products ADD COLUMN IF NOT EXISTS hidden TINYINT(1) NOT NULL DEFAULT 0`);
    console.log('Migration complete: hidden column added to products.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
