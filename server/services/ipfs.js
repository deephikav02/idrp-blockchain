import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IPFS_DIR = path.join(__dirname, '..', 'ipfs-storage');

if (!fs.existsSync(IPFS_DIR)) {
  fs.mkdirSync(IPFS_DIR, { recursive: true });
}

export function uploadToIPFS(data, filename) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = 'Qm' + crypto.createHash('sha256').update(content + Date.now()).digest('hex').substring(0, 44);
  
  const filePath = path.join(IPFS_DIR, hash);
  fs.writeFileSync(filePath, content);
  
  return {
    hash: hash,
    size: Buffer.byteLength(content),
    timestamp: new Date().toISOString(),
    gateway: `https://ipfs.io/ipfs/${hash}`,
    localPath: filePath
  };
}

export function getFromIPFS(hash) {
  const filePath = path.join(IPFS_DIR, hash);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  try { return JSON.parse(content); } catch { return content; }
}

export function generateSHA256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function uploadRepairDocument(repairData) {
  const document = {
    type: 'repair_record',
    productId: repairData.productId,
    repairCenter: repairData.repairCenter,
    partReplaced: repairData.partReplaced,
    description: repairData.description || '',
    timestamp: new Date().toISOString(),
    sha256: generateSHA256(repairData),
    customerReported: repairData.customerReported || false,
    billImageHash: repairData.billImageHash || null
  };
  return uploadToIPFS(document, `repair_${repairData.productId}_${Date.now()}`);
}
