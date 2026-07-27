import db from '../config/db.js';

const run = async () => {
  try {
    await db.execute(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(150) AFTER status`);
    await db.execute(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(30) AFTER shipping_name`);
    await db.execute(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT AFTER shipping_phone`);
    console.log('Migration complete: shipping columns added to orders.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
