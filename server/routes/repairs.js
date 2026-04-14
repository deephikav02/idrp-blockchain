import express from 'express';
import { getDb } from '../db/database.js';
import { simulateTransaction } from '../services/blockchain.js';
import { uploadRepairDocument, generateSHA256 } from '../services/ipfs.js';
import { requireRepairCenter } from '../middleware/auth.js';

const router = express.Router();

router.post('/log', async (req, res) => {
  try {
    const { productId, repairCenter, partReplaced, description, customerReported, billImageData } = req.body;
    
    if (!productId || !repairCenter || !partReplaced) {
      return res.status(400).json({ error: 'Required fields: productId, repairCenter, partReplaced' });
    }
    
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const ipfsResult = uploadRepairDocument({
      productId, repairCenter, partReplaced, description: description || '',
      customerReported: customerReported || false,
      billImageHash: billImageData ? generateSHA256(billImageData) : null
    });
    
    const receipt = await simulateTransaction('logRepair', {
      productId, repairCenter, partReplaced, ipfsHash: ipfsResult.hash,
      customerReported: customerReported || false
    });
    
    const status = customerReported ? 'self-reported' : 'verified';
    
    const stmt = db.prepare(`
      INSERT INTO repairs (product_id, repair_center, part_replaced, description, ipfs_hash, tx_hash, block_number, status, customer_reported, bill_image_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      productId, repairCenter, partReplaced, description || '', ipfsResult.hash,
      receipt.transactionHash, receipt.blockNumber, status, customerReported ? 1 : 0,
      billImageData ? generateSHA256(billImageData) : null
    );
    
    res.status(201).json({
      success: true,
      message: customerReported ? 'Repair self-reported by customer — pending verification' : 'Repair logged and verified on blockchain',
      data: {
        productId, repairCenter, partReplaced, description, ipfsHash: ipfsResult.hash,
        ipfsGateway: ipfsResult.gateway, sha256: generateSHA256({ productId, repairCenter, partReplaced }),
        transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed, status, customerReported: customerReported || false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Repair log error:', error);
    res.status(500).json({ error: 'Failed to log repair', details: error.message });
  }
});

router.get('/:productId', (req, res) => {
  try {
    const db = getDb();
    const repairs = db.prepare('SELECT * FROM repairs WHERE product_id = ? ORDER BY repaired_at DESC').all(req.params.productId);
    const stats = {
      total: repairs.length,
      verified: repairs.filter(r => r.status === 'verified').length,
      selfReported: repairs.filter(r => r.customer_reported === 1).length,
      pending: repairs.filter(r => r.status === 'self-reported').length
    };
    res.json({ success: true, data: repairs, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get repair history' });
  }
});

router.patch('/verify/:repairId', requireRepairCenter, async (req, res) => {
  try {
    const db = getDb();
    const repair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(req.params.repairId);
    if (!repair) return res.status(404).json({ error: 'Repair record not found' });
    if (repair.status !== 'self-reported') return res.status(400).json({ error: 'This repair is already verified' });
    
    const receipt = await simulateTransaction('verifyRepair', { productId: repair.product_id, repairIndex: repair.id });
    
    db.prepare('UPDATE repairs SET status = ?, tx_hash = ?, block_number = ? WHERE id = ?')
      .run('verified', receipt.transactionHash, receipt.blockNumber, req.params.repairId);
    
    res.json({
      success: true, message: 'Repair verified successfully',
      data: {
        repairId: repair.id, productId: repair.product_id, previousStatus: 'self-reported',
        newStatus: 'verified', transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify repair' });
  }
});

export default router;
