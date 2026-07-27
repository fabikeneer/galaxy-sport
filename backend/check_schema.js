import db from './config/db.js';

async function checkSchema() {
  try {
    const [products] = await db.query('DESCRIBE products');
    console.log('--- PRODUCTS TABLE ---');
    console.table(products);

    const [variants] = await db.query('DESCRIBE product_variants');
    console.log('\n--- PRODUCT_VARIANTS TABLE ---');
    console.table(variants);
    
    try {
        const [orderItems] = await db.query('DESCRIBE order_items');
        console.log('\n--- ORDER_ITEMS TABLE ---');
        console.table(orderItems);
    } catch (e) {
        console.log('\n--- ORDER_ITEMS TABLE DOES NOT EXIST ---');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchema();
