import { ethers } from 'ethers';
import { getDb } from '../db/database.js';
import RepairPassportArtifact from '../contracts/RepairPassport.json' with { type: 'json' };

const RPC_URL = process.env.ALCHEMY_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';


export async function startIndexer() {
  console.log('⛓️  Starting Blockchain Indexer...');

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, RepairPassportArtifact.abi, provider);
    const db = getDb();

    // 1. Listen for Product Registration
    contract.on('ProductRegistered', (productId, brand, city, owner, timestamp, blockNumber) => {
      console.log(`📥 Indexing Product: ${productId}`);
      try {
        db.prepare(`
          INSERT OR IGNORE INTO products (product_id, brand, city, owner_name, owner_address, registered_at, tx_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          productId, 
          brand, 
          city, 
          'Initial Owner', 
          owner, 
          new Date(Number(timestamp) * 1000).toISOString(),
          'on-chain'
        );
      } catch (err) {
        console.error('Indexing Error (Product):', err.message);
      }
    });

    // 2. Listen for Repair Logs
    contract.on('RepairLogged', (productId, repairIndex, repairer, repairCenter, partReplaced, ipfsHash, timestamp, customerReported, blockNumber) => {
      console.log(`📥 Indexing Repair for: ${productId} [Index: ${repairIndex}]`);
      try {
        const status = customerReported ? 'self-reported' : 'verified';
        db.prepare(`
          INSERT INTO repairs (product_id, repair_center, part_replaced, description, ipfs_hash, repairer_address, repaired_at, customer_reported, blockchain_index, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          productId,
          repairCenter,
          partReplaced,
          'Blockchain verified repair',
          ipfsHash,
          repairer,
          new Date(Number(timestamp) * 1000).toISOString(),
          customerReported ? 1 : 0,
          Number(repairIndex),
          status
        );
      } catch (err) {
        console.error('Indexing Error (Repair):', err.message);
      }
    });

    // 2b. Listen for Repair Verification
    contract.on('RepairVerified', (productId, repairIndex, verifier, timestamp) => {
      console.log(`✅ Indexing Repair Verification: ${productId} [Index: ${repairIndex}]`);
      try {
        db.prepare(`
          UPDATE repairs 
          SET status = 'verified', repairer_address = ? 
          WHERE product_id = ? AND blockchain_index = ?
        `).run(verifier, productId, Number(repairIndex));
      } catch (err) {
        console.error('Indexing Error (Verification):', err.message);
      }
    });

    // 3. Listen for Ownership Transfers
    contract.on('OwnershipTransferred', (productId, fromOwner, toOwner, timestamp, blockNumber) => {
      console.log(`📥 Indexing Transfer: ${productId} (${fromOwner} -> ${toOwner})`);
      try {
        db.prepare(`
          INSERT INTO transfers (product_id, from_owner, to_owner, transferred_at)
          VALUES (?, ?, ?, ?)
        `).run(
          productId,
          fromOwner,
          toOwner,
          new Date(Number(timestamp) * 1000).toISOString()
        );

        // Update current owner in products table
        db.prepare(`UPDATE products SET owner_address = ? WHERE product_id = ?`).run(toOwner, productId);
      } catch (err) {
        console.error('Indexing Error (Transfer):', err.message);
      }
    });

    console.log('✅ Indexer active and listening to', CONTRACT_ADDRESS);

  } catch (err) {
    console.error('❌ Failed to start indexer:', err.message);
    console.log('Retrying indexer in 10s...');
    setTimeout(startIndexer, 10000);
  }
}
