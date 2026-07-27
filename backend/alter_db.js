import db from './config/db.js';

async function alterDb() {
  try {
    console.log('Adding dorsal column to order_items...');
    await db.query('ALTER TABLE order_items ADD COLUMN dorsal VARCHAR(100)');
    console.log('Success!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, ignoring.');
      process.exit(0);
    }
    console.error(error);
    process.exit(1);
  }
}

alterDb();
