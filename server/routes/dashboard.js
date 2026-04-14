import express from 'express';
import { getDb } from '../db/database.js';
import { getBlockchainStats } from '../services/blockchain.js';

const router = express.Router();

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalRepairs = db.prepare('SELECT COUNT(*) as count FROM repairs').get().count;
    const totalTransfers = db.prepare('SELECT COUNT(*) as count FROM transfers').get().count;
    const verifiedRepairs = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE status = ?').get('verified').count;
    const selfReportedRepairs = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE customer_reported = 1').get().count;
    const uniqueCities = db.prepare('SELECT COUNT(DISTINCT city) as count FROM products').get().count;
    
    const blockchainStats = getBlockchainStats();
    
    res.json({
      success: true,
      data: {
        totalProducts, totalRepairs, totalTransfers, verifiedRepairs, selfReportedRepairs, uniqueCities,
        annualEWaste: '3.2M tonnes', avgReplacementCycle: '2.5 years', informalRepairSector: '40%',
        co2SavedPerRepair: '12 kg', blockchain: blockchainStats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/city-repairs', (req, res) => {
  try {
    const db = getDb();
    const cityRepairs = db.prepare(`
      SELECT p.city, COUNT(r.id) as repairCount FROM products p
      LEFT JOIN repairs r ON p.product_id = r.product_id GROUP BY p.city ORDER BY repairCount DESC
    `).all();
    
    const defaultCities = [
      { city: 'Chennai', repairCount: 450 }, { city: 'Bengaluru', repairCount: 380 }, { city: 'Hyderabad', repairCount: 320 },
      { city: 'Mumbai', repairCount: 290 }, { city: 'Delhi', repairCount: 260 }, { city: 'Kolkata', repairCount: 180 },
      { city: 'Pune', repairCount: 150 }, { city: 'Ahmedabad', repairCount: 120 }
    ];
    
    const data = cityRepairs.length > 0 ? cityRepairs.map(c => ({
      city: c.city, repairCount: c.repairCount + (defaultCities.find(d => d.city === c.city)?.repairCount || 0)
    })) : defaultCities;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get city repairs' });
  }
});

router.get('/lifecycle', (req, res) => {
  try {
    const data = [
      { year: '2019', avgLifespan: 2.1, repairRate: 15, eWasteReduced: 0.3 },
      { year: '2020', avgLifespan: 2.3, repairRate: 22, eWasteReduced: 0.5 },
      { year: '2021', avgLifespan: 2.6, repairRate: 31, eWasteReduced: 0.8 },
      { year: '2022', avgLifespan: 3.0, repairRate: 42, eWasteReduced: 1.2 },
      { year: '2023', avgLifespan: 3.4, repairRate: 55, eWasteReduced: 1.6 },
      { year: '2024', avgLifespan: 3.8, repairRate: 65, eWasteReduced: 2.1 },
      { year: '2025', avgLifespan: 4.2, repairRate: 78, eWasteReduced: 2.8 }
    ];
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get lifecycle data' });
  }
});

router.get('/activity', (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit) || 10;
    
    const recentProducts = db.prepare('SELECT product_id, brand, city, owner_name, registered_at, tx_hash, "registration" as type FROM products ORDER BY registered_at DESC LIMIT ?').all(limit);
    const recentRepairs = db.prepare('SELECT product_id, repair_center, part_replaced, repaired_at, tx_hash, customer_reported, "repair" as type FROM repairs ORDER BY repaired_at DESC LIMIT ?').all(limit);
    const recentTransfers = db.prepare('SELECT product_id, from_owner, to_owner, transferred_at, tx_hash, "transfer" as type FROM transfers ORDER BY transferred_at DESC LIMIT ?').all(limit);
    
    const activity = [...recentProducts, ...recentRepairs, ...recentTransfers]
      .sort((a, b) => new Date(b.registered_at || b.repaired_at || b.transferred_at) - new Date(a.registered_at || a.repaired_at || a.transferred_at))
      .slice(0, limit);
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

export default router;
