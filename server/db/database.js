import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'idrp.db');

let db;

import bcrypt from 'bcryptjs';

export function initDatabase() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      city TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      owner_address TEXT,
      manufacturer_address TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tx_hash TEXT,
      block_number INTEGER,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS repairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      repair_center TEXT NOT NULL,
      part_replaced TEXT NOT NULL,
      description TEXT,
      ipfs_hash TEXT,
      repairer_address TEXT,
      repaired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tx_hash TEXT,
      block_number INTEGER,
      status TEXT DEFAULT 'verified',
      customer_reported INTEGER DEFAULT 0,
      bill_image_hash TEXT,
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      from_owner TEXT NOT NULL,
      to_owner TEXT NOT NULL,
      from_address TEXT,
      to_address TEXT,
      transferred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      tx_hash TEXT,
      block_number INTEGER,
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      address TEXT UNIQUE,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'Consumer',
      trust_score REAL DEFAULT 100.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_product_id ON products(product_id);
    CREATE INDEX IF NOT EXISTS idx_repairs_product ON repairs(product_id);
    CREATE INDEX IF NOT EXISTS idx_transfers_product ON transfers(product_id);
  `);

  // Seed default users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('🌱 Seeding initial user accounts...');
    const seedUsers = [
      { email: 'admin@idrp.in', pass: 'admin123', name: 'System Admin', role: 'Admin', addr: '0x1111111111111111111111111111111111111111' },
      { email: 'samsung@factory.com', pass: 'samsung123', name: 'Samsung India', role: 'Manufacturer', addr: '0x2222222222222222222222222222222222222222' },
      { email: 'deepika@user.com', pass: 'deepika123', name: 'Deepika Leelakumar', role: 'Consumer', addr: '0x3333333333333333333333333333333333333333' }
    ];

    const insert = db.prepare('INSERT INTO users (email, password, name, role, address) VALUES (?, ?, ?, ?, ?)');
    for (const u of seedUsers) {
      const hash = bcrypt.hashSync(u.pass, 10);
      insert.run(u.email, hash, u.name, u.role, u.addr);
    }
    console.log('✅ Seeded 3 users.');
  }

  // Seed demo products if empty (survives Render redeploys)
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    console.log('🌱 Seeding demo products...');
    const seedProducts = [
      { product_id: 'PROD-2025-001', brand: 'Samsung', city: 'Chennai', owner_name: 'Samsung India', tx_hash: '0x64741f548bfb9198606b3cecd3e2bac693653aa3099bec840c308cfdcaebd7e6', block_number: 18000001 },
      { product_id: 'PROD-2025-002', brand: 'Apple', city: 'Mumbai', owner_name: 'Samsung India', tx_hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a', block_number: 18000002 },
      { product_id: 'PROD-2025-003', brand: 'Xiaomi', city: 'Bengaluru', owner_name: 'Samsung India', tx_hash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', block_number: 18000003 },
    ];
    const insertProduct = db.prepare('INSERT OR IGNORE INTO products (product_id, brand, city, owner_name, tx_hash, block_number) VALUES (?, ?, ?, ?, ?, ?)');
    for (const p of seedProducts) {
      insertProduct.run(p.product_id, p.brand, p.city, p.owner_name, p.tx_hash, p.block_number);
    }
    console.log('✅ Seeded 3 demo products.');
  }

  console.log('✅ Database initialized at', DB_PATH);
  return db;
}

export function getDb() {
  if (!db) initDatabase();
  return db;
}

export function generateTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

export function generateBlockNumber() {
  return Math.floor(Math.random() * 1000000) + 18000000;
}
