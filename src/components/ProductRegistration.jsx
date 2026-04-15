import React, { useState } from 'react';
import { Package, CheckCircle, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerProduct as apiRegisterProduct, getContract } from '../services/api';
import { ethers } from 'ethers';

const CITIES = ['Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

export default function ProductRegistration({ user }) {
  const [form, setForm] = useState({ productId: '', brand: '', city: '', ownerAddress: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.brand || !form.city || !form.ownerAddress) {
      toast.error('Please fill all fields');
      return;
    }

    if (!ethers.isAddress(form.ownerAddress)) {
      toast.error('Invalid Owner Wallet Address. Must start with 0x...');
      return;
    }

    setLoading(true);
    try {
      // 1. Get Smart Contract with User's Signer (MetaMask)
      const contract = await getContract(true);
      
      // 2. Execute On-Chain Transaction
      toast.loading('Signing transaction in MetaMask...', { id: 'tx' });
      const tx = await contract.registerProduct(
        form.productId,
        form.brand,
        form.city,
        form.ownerAddress
      );
      
      toast.loading('Mining block...', { id: 'tx' });
      const receipt = await tx.wait();
      toast.dismiss('tx');

      // 3. Update Result UI
      setResult({
        productId: form.productId,
        brand: form.brand,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed)
      });
      
      toast.success('Product registered on blockchain!');
      
      // 4. ALSO save to backend database for Verification to work
      try {
        await apiRegisterProduct({ productId: form.productId, brand: form.brand, city: form.city });
      } catch (dbErr) {
        // Non-critical — on-chain already succeeded. Log silently.
        console.warn('Backend sync warning:', dbErr.message);
      }

    } catch (err) {
      toast.dismiss('tx');
      const msg = err.reason || err.message || 'Registration failed';
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const resetForm = () => {
    setForm({ productId: '', brand: '', city: '', ownerName: '' });
    setResult(null);
  };

  return (
    <section id="register" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">Product Registration</span></h2>
          <p>Register a new product on the blockchain with permanent, immutable records</p>
        </div>

        <div className="grid-2">
          {/* Form */}
          <div className="card">
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={22} style={{ color: 'var(--accent-primary)' }} />
              Register Product
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input
                  className="form-input"
                  placeholder="e.g., PROD-2025-001"
                  value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  className="form-input"
                  placeholder="e.g., Samsung, Apple, Xiaomi"
                  value={form.brand}
                  onChange={e => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Manufacturing City</label>
                <select
                  className="form-input form-select"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                >
                  <option value="">Select city...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Owner Wallet Address</label>
                <input
                  className="form-input"
                  placeholder="0x... (Recipient's Wallet Address)"
                  value={form.ownerAddress}
                  onChange={e => setForm({ ...form, ownerAddress: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="spin-icon" /> Mining Block...</>
                ) : (
                  <><Package size={18} /> Register on Blockchain</>
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!result && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <Package size={64} style={{ opacity: 0.15, marginBottom: '16px' }} />
                <p>Fill the form and register a product to see blockchain confirmation here.</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 20px' }} />
                <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Mining Block...</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                  Simulating blockchain transaction...
                </p>
              </div>
            )}

            {result && (
              <div className="confirmation-panel">
                <div className="success-icon">
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--success)' }}>
                  Block Confirmed ✓
                </h3>
                <div className="detail-row">
                  <span className="detail-label">Product ID</span>
                  <span className="detail-value">{result.productId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{result.brand}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Block Number</span>
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
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={resetForm}>
                  Register Another Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
