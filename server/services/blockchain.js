import crypto from 'crypto';

let blockNumber = 18000000;
let nonce = 0;

export function generateBlockHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

export function generateTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

function getNextBlockNumber() {
  return ++blockNumber;
}

function getNextNonce() {
  return ++nonce;
}

export async function simulateTransaction(method, params) {
  const delay = Math.floor(Math.random() * 1500) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const block = getNextBlockNumber();
  const txHash = generateTxHash();
  const blockHash = generateBlockHash();
  
  const gasUsed = calculateGas(method);
  
  return {
    transactionHash: txHash,
    blockNumber: block,
    blockHash: blockHash,
    from: params.from || '0x' + crypto.randomBytes(20).toString('hex'),
    to: '0x' + crypto.randomBytes(20).toString('hex'),
    gasUsed: gasUsed,
    gasPrice: '20000000000',
    status: 1,
    confirmations: 1,
    timestamp: Math.floor(Date.now() / 1000),
    method: method,
    nonce: getNextNonce(),
    events: generateEvents(method, params)
  };
}

export function calculateGas(method) {
  const gasMap = {
    'registerProduct': 145000 + Math.floor(Math.random() * 10000),
    'logRepair': 120000 + Math.floor(Math.random() * 8000),
    'transferOwnership': 85000 + Math.floor(Math.random() * 5000),
    'verifyRepair': 45000 + Math.floor(Math.random() * 3000),
    'assignRole': 55000 + Math.floor(Math.random() * 2000)
  };
  return gasMap[method] || 21000;
}

function generateEvents(method, params) {
  const events = [];
  switch(method) {
    case 'registerProduct':
      events.push({
        event: 'ProductRegistered',
        args: {
          productId: params.productId,
          brand: params.brand,
          city: params.city,
          owner: params.owner,
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
      break;
    case 'logRepair':
      events.push({
        event: 'RepairLogged',
        args: {
          productId: params.productId,
          repairer: params.repairer || 'system',
          repairCenter: params.repairCenter,
          partReplaced: params.partReplaced,
          ipfsHash: params.ipfsHash,
          customerReported: params.customerReported || false
        }
      });
      break;
    case 'transferOwnership':
      events.push({
        event: 'OwnershipTransferred',
        args: {
          productId: params.productId,
          fromOwner: params.fromOwner,
          toOwner: params.toOwner
        }
      });
      break;
  }
  return events;
}

export function getBlockchainStats() {
  return {
    currentBlock: blockNumber,
    networkId: 31337,
    networkName: 'IDRP Local Network',
    gasPrice: '20 Gwei',
    totalTransactions: nonce,
    consensusMechanism: 'Proof of Authority',
    avgBlockTime: '2s'
  };
}
