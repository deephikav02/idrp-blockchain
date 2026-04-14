import express from 'express';
import { getDb } from '../db/database.js';
import { simulateTransaction } from '../services/blockchain.js';
import { requireOwner } from '../middleware/auth.js';

const router = express.Router();

router.post('/execute', requireOwner, async (req, res) => {
  try {
    const { productId, newOwner } = req.body;
    if (!productId || !newOwner) return res.status(400).json({ error: 'Required fields: productId, newOwner' });
    
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const previousOwner = product.owner_name;
    const requestingUser = req.user.name;
    
    // VERIFY OWNERSHIP: Only the current owner (or admin role) can transfer
    if (previousOwner !== requestingUser && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: You are not the owner of this product' });
    }
    const receipt = await simulateTransaction('transferOwnership', { productId, fromOwner: previousOwner, toOwner: newOwner });
    
    db.prepare('UPDATE products SET owner_name = ? WHERE product_id = ?').run(newOwner, productId);
    const stmt = db.prepare(`INSERT INTO transfers (product_id, from_owner, to_owner, tx_hash, block_number) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(productId, previousOwner, newOwner, receipt.transactionHash, receipt.blockNumber);
    
    res.status(201).json({
      success: true, message: 'Ownership transferred successfully',
      data: {
        productId, fromOwner: previousOwner, toOwner: newOwner,
        transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed, timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
});

router.get('/:productId', (req, res) => {
  try {
    const db = getDb();
    const transfers = db.prepare('SELECT * FROM transfers WHERE product_id = ? ORDER BY transferred_at DESC').all(req.params.productId);
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transfer history' });
  }
});

export default router;
