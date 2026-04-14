import express from 'express';
import { getDb } from '../db/database.js';
import { simulateTransaction } from '../services/blockchain.js';
import { requireManufacturer } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', requireManufacturer, async (req, res) => {
  try {
    const { productId, brand, city } = req.body;
    const ownerName = req.user.name;
    
    if (!productId || !brand || !city) {
      return res.status(400).json({ error: 'All fields are required: productId, brand, city' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    if (existing) {
      return res.status(409).json({ error: 'Product already registered' });
    }
    const receipt = await simulateTransaction('registerProduct', { productId, brand, city, owner: ownerName });
    const stmt = db.prepare(`INSERT INTO products (product_id, brand, city, owner_name, tx_hash, block_number) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(productId, brand, city, ownerName, receipt.transactionHash, receipt.blockNumber);
    res.status(201).json({
      success: true,
      message: 'Product registered on blockchain',
      data: {
        productId, brand, city, ownerName,
        transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash, gasUsed: receipt.gasUsed,
        timestamp: new Date().toISOString(), status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register product', details: error.message });
  }
});

router.get('/:productId', (req, res) => {
  try {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const repairs = db.prepare('SELECT * FROM repairs WHERE product_id = ? ORDER BY repaired_at ASC').all(req.params.productId);
    const transfers = db.prepare('SELECT * FROM transfers WHERE product_id = ? ORDER BY transferred_at ASC').all(req.params.productId);
    res.json({ success: true, data: { product, repairs, transfers, lifecycle: buildLifecycle(product, repairs, transfers) } });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const products = db.prepare('SELECT * FROM products ORDER BY registered_at DESC LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM products').get();
    res.json({ success: true, data: products, pagination: { page, limit, total: total.count, totalPages: Math.ceil(total.count / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list products' });
  }
});

function buildLifecycle(product, repairs, transfers) {
  const events = [];
  events.push({
    type: 'registration', title: 'Product Registered', description: `${product.brand} registered in ${product.city}`,
    owner: product.owner_name, timestamp: product.registered_at, txHash: product.tx_hash,
    blockNumber: product.block_number, icon: 'package', status: 'verified'
  });
  repairs.forEach(repair => {
    events.push({
      type: 'repair', title: repair.customer_reported ? 'Customer-Reported Repair' : 'Verified Repair',
      description: `${repair.part_replaced} at ${repair.repair_center}`, details: repair.description,
      timestamp: repair.repaired_at, txHash: repair.tx_hash, blockNumber: repair.block_number,
      ipfsHash: repair.ipfs_hash, icon: 'wrench', status: repair.status, customerReported: repair.customer_reported === 1
    });
  });
  transfers.forEach(transfer => {
    events.push({
      type: 'transfer', title: 'Ownership Transferred', description: `From ${transfer.from_owner} to ${transfer.to_owner}`,
      timestamp: transfer.transferred_at, txHash: transfer.tx_hash, blockNumber: transfer.block_number,
      icon: 'arrow-right-left', status: 'verified'
    });
  });
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return events;
}

export default router;
