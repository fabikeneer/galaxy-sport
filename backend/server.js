import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Test DB Connection and Create Test User
const testDBConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully.');

    // Auto-create test user if not exists
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@galaxysport.com']);
    if (rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin', 10);
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
        ['Admin Test', 'admin@galaxysport.com', hashedPassword, 'admin']
      );
      console.log('Test user created: admin@galaxysport.com / admin');
    }

    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

testDBConnection();

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/exchange-rates', exchangeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.send('Galaxy Sport API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
