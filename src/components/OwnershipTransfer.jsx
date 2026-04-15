import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { transferOwnership as apiTransferOwnership, getContract } from '../services/api';
import { ethers } from 'ethers';

// Known users in the system — name + wallet address mapping
const KNOWN_USERS = [
  { name: 'Deepika Leelakumar (Consumer)', address: '0x3333333333333333333333333333333333333333' },
  { name: 'Samsung India (Manufacturer)', address: '0x2222222222222222222222222222222222222222' },
  { name: 'System Admin', address: '0x1111111111111111111111111111111111111111' },
];

export default function OwnershipTransfer({ user }) {
  const [form, setForm] = useState({ productId: '', newOwner: '' });
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUserSelect = (e) => {
    const addr = e.target.value;
    setSelectedUser(addr);
    setForm({ ...form, newOwner: addr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.newOwner) {
      toast.error('Please fill all fields');
      return;
    }

    if (!ethers.isAddress(form.newOwner)) {
      toast.error('Invalid Ethereum address. Must start with 0x...');
      return;
    }

    setLoading(true);
    try {
      const contract = await getContract(true);
      
      toast.loading('Signing transfer in MetaMask...', { id: 'tx' });
      const tx = await contract.transferOwnership(form.productId, form.newOwner);
      
      toast.loading('Transferring ownership on-chain...', { id: 'tx' });
      const receipt = await tx.wait();
      toast.dismiss('tx');

      const displayName = KNOWN_USERS.find(u => u.address.toLowerCase() === form.newOwner.toLowerCase())?.name || form.newOwner;

      setResult({
        productId: form.productId,
        fromOwner: user?.address || 'Current Owner',
        toOwner: displayName,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed)
      });
      
      toast.success('Ownership transferred!');
    } catch (err) {
      toast.dismiss('tx');
      const msg = err.reason || err.message || 'Transfer failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const reset = () => {
    setForm({ productId: '', newOwner: '' });
    setSelectedUser('');
    setResult(null);
  };

  return (
    <section id="transfer" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">Ownership Transfer</span></h2>
          <p>Execute smart contract ownership transfers with permanent blockchain records</p>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowRightLeft size={22} style={{ color: 'var(--accent-primary)' }} />
              Transfer Ownership
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input
                  className="form-input"
                  placeholder="Enter product ID to transfer (e.g., PROD-2025-001)"
                  value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transfer To (Select Registered User)</label>
                <select className="form-input form-select" value={selectedUser} onChange={handleUserSelect}>
                  <option value="">-- Select a registered user --</option>
                  {KNOWN_USERS.map(u => (
                    <option key={u.address} value={u.address}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">New Owner Wallet Address</label>
                <input
                  className="form-input"
                  placeholder="0x... (auto-filled when you select above)"
                  value={form.newOwner}
                  onChange={e => setForm({ ...form, newOwner: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  💡 Select from dropdown above — the address fills itself! Or paste any <code>0x...</code> address manually.
                </p>
              </div>

              <div style={{
                padding: '14px 16px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)',
                marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>🔐 Smart Contract Execution</strong>
                <p style={{ marginTop: '4px' }}>
                  The transfer is executed via smart contract, creating an immutable ownership change record on the Ethereum blockchain.
                </p>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="spin-icon" /> Processing Transfer...</>
                ) : (
                  <><ArrowRightLeft size={18} /> Transfer Ownership</>
                )}
              </button>
            </form>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!result && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <ArrowRightLeft size={64} style={{ opacity: 0.15, marginBottom: '16px' }} />
                <p>Transfer a product's ownership to see the blockchain confirmation here.</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 20px' }} />
                <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Executing Smart Contract...</p>
              </div>
            )}

            {result && (
              <div className="confirmation-panel">
                <div className="success-icon">
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--success)' }}>
                  Transfer Confirmed ✓
                </h3>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                  padding: '20px', marginBottom: '20px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>FROM</div>
                    <div style={{ fontWeight: 600, color: 'var(--error)' }}>{result.fromOwner}</div>
                  </div>
                  <ArrowRightLeft size={20} style={{ color: 'var(--accent-primary)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TO</div>
                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>{result.toOwner}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Product</span>
                  <span className="detail-value">{result.productId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Block</span>
                  <span className="detail-value">#{result.blockNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gas Used</span>
                  <span className="detail-value">{result.gasUsed?.toLocaleString()} wei</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">Transaction Hash</label>
                  <div className="hash-display">
                    <span className="hash-text">{result.transactionHash}</span>
                    <button className="copy-btn" onClick={() => copyHash(result.transactionHash)}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={reset}>
                  New Transfer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </section>
  );
}
