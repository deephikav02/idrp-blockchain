import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, CheckCircle, Copy, Loader2, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContract, transferOwnership as apiTransferOwnership } from '../services/api';
import { ethers } from 'ethers';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export default function OwnershipTransfer({ user }) {
  const [productId, setProductId] = useState('');
  const [query, setQuery] = useState('');           // what the user types
  const [suggestions, setSuggestions] = useState([]); // filtered results
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch all registered users on mount
  useEffect(() => {
    axios.get(`${API_BASE}/auth/users`)
      .then(res => setAllUsers(res.data.data || []))
      .catch(() => {});
  }, []);

  // Filter users as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.address && u.address.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
    setSuggestions(filtered);
    setShowDropdown(true);
  }, [query, allUsers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (u) => {
    setQuery(`${u.name} — ${u.address}`);
    setSelectedAddress(u.address);
    setShowDropdown(false);
  };

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId.trim()) { toast.error('Enter a Product ID'); return; }
    if (!selectedAddress) { toast.error('Please search and select a valid user from the list'); return; }
    if (!ethers.isAddress(selectedAddress)) { toast.error('Invalid wallet address'); return; }

    setLoading(true);
    try {
      const contract = await getContract(true);
      toast.loading('Signing transfer in MetaMask...', { id: 'tx' });
      const tx = await contract.transferOwnership(productId.trim(), selectedAddress);
      toast.loading('Transferring ownership on-chain...', { id: 'tx' });
      const receipt = await tx.wait();
      toast.dismiss('tx');

      setResult({
        productId: productId.trim(),
        fromOwner: user?.name || user?.address || 'Current Owner',
        toOwner: query,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed)
      });
      toast.success('Ownership transferred!');

      // Also save to backend database for Verification timeline to work
      try {
        await apiTransferOwnership({
          productId: productId.trim(),
          newOwnerAddress: selectedAddress,
          newOwnerName: query
        });
      } catch (dbErr) {
        console.warn('Backend sync warning:', dbErr.message);
      }
    } catch (err) {
      toast.dismiss('tx');
      toast.error(err.reason || err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };
  const reset = () => { setProductId(''); setQuery(''); setSelectedAddress(''); setResult(null); };

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
              {/* Product ID */}
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input
                  className="form-input"
                  placeholder="e.g., PROD-2025-001"
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                />
              </div>

              {/* Searchable user autocomplete */}
              <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                <label className="form-label">New Owner (Search by Name or Address)</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none'
                  }} />
                  <input
                    className="form-input"
                    placeholder="Type a name or 0x address..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelectedAddress(''); }}
                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                    style={{ paddingLeft: '36px' }}
                    autoComplete="off"
                  />
                </div>

                {/* Dropdown suggestions */}
                {showDropdown && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'var(--card-bg)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    maxHeight: '220px', overflowY: 'auto'
                  }}>
                    {suggestions.map(u => (
                      <div
                        key={u.id}
                        onClick={() => handleSelect(u)}
                        style={{
                          padding: '12px 16px', cursor: 'pointer', display: 'flex',
                          flexDirection: 'column', gap: '2px',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                          <span style={{
                            fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px',
                            background: 'var(--accent-dim)', color: 'var(--accent-primary)'
                          }}>{u.role}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', paddingLeft: '22px' }}>
                          {u.address}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showDropdown && query && suggestions.length === 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'var(--card-bg)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 16px',
                    color: 'var(--text-muted)', fontSize: '0.85rem'
                  }}>
                    No users found matching "<strong>{query}</strong>"
                  </div>
                )}
              </div>

              {/* Show selected address */}
              {selectedAddress && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(0,212,255,0.07)',
                  border: '1px solid rgba(0,212,255,0.3)', borderRadius: 'var(--radius-md)',
                  marginBottom: '16px', fontFamily: 'monospace', fontSize: '0.8rem',
                  color: 'var(--accent-primary)', wordBreak: 'break-all'
                }}>
                  ✅ Wallet: {selectedAddress}
                </div>
              )}

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
                {loading ? <><Loader2 size={18} className="spin-icon" /> Processing...</> : <><ArrowRightLeft size={18} /> Transfer Ownership</>}
              </button>
            </form>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!result && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <ArrowRightLeft size={64} style={{ opacity: 0.15, marginBottom: '16px' }} />
                <p>Search for a user and transfer a product's ownership to see the blockchain confirmation here.</p>
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
                <div className="success-icon"><CheckCircle size={32} /></div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--success)' }}>Transfer Confirmed ✓</h3>
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
                    <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.85rem' }}>{result.toOwner}</div>
                  </div>
                </div>
                <div className="detail-row"><span className="detail-label">Product</span><span className="detail-value">{result.productId}</span></div>
                <div className="detail-row"><span className="detail-label">Block</span><span className="detail-value">#{result.blockNumber}</span></div>
                <div className="detail-row"><span className="detail-label">Gas Used</span><span className="detail-value">{result.gasUsed?.toLocaleString()} wei</span></div>
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">Transaction Hash</label>
                  <div className="hash-display">
                    <span className="hash-text">{result.transactionHash}</span>
                    <button className="copy-btn" onClick={() => copyHash(result.transactionHash)}><Copy size={14} /></button>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={reset}>New Transfer</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.spin-icon { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
