import React, { useState } from 'react';
import { Search, Package, Wrench, ArrowRightLeft, Copy, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct } from '../services/api';

export default function ProductVerification() {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!productId.trim()) {
      toast.error('Enter a product ID');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await getProduct(productId.trim());
      setData(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found. Check the ID and try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleVerifyRepair = async (event) => {
    if (!event.id) return;
    
    setLoading(true);
    try {
      const { verifyRepair, getContract } = await import('../services/api');
      const contract = await getContract(true);
      
      toast.loading('Signing verification...', { id: 'verify-tx' });
      const tx = await contract.verifyRepair(data.product.product_id, event.blockchainIndex);
      
      toast.loading('Mining verification...', { id: 'verify-tx' });
      await tx.wait();
      toast.dismiss('verify-tx');
      
      // Update backend
      await verifyRepair(event.id, { txHash: tx.hash });
      
      toast.success('Repair verified on blockchain!');
      handleVerify({ preventDefault: () => {} }); // Refresh data
    } catch (err) {
      toast.dismiss('verify-tx');
      toast.error(err.reason || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'registration': return <Package size={18} />;
      case 'repair': return <Wrench size={18} />;
      case 'transfer': return <ArrowRightLeft size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getColor = (event) => {
    if (event.type === 'registration') return 'var(--accent-primary)';
    if (event.customerReported) return 'var(--warning)';
    if (event.type === 'repair') return 'var(--success)';
    return '#a29bfe';
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <section id="verify" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">Product Verification</span></h2>
          <p>Search any product ID to view its complete blockchain-verified lifecycle</p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px' }}>
            <input
              className="form-input"
              placeholder="Enter Product ID (e.g., PROD-2025-001)"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : <Search size={18} />}
              Verify
            </button>
          </form>
        </div>

        {error && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <Search size={48} style={{ color: 'var(--error)', opacity: 0.5, marginBottom: '16px' }} />
            <p style={{ color: 'var(--error)' }}>{error}</p>
          </div>
        )}

        {data && (
          <div className="animate-fadeInUp">
            {/* Product Info Card */}
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>
                    {data.product.brand}
                    <span className="badge badge-verified" style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
                      Blockchain Verified
                    </span>
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Product ID: <span className="text-mono text-accent">{data.product.product_id}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Owner</div>
                  <div style={{ fontWeight: 600 }}>{data.product.owner_name}</div>
                </div>
              </div>

              <div className="grid-4" style={{ marginTop: '20px' }}>
                <div className="stat-card card" style={{ padding: '16px' }}>
                  <div className="stat-value" style={{ fontSize: '1.8rem' }}>{data.repairs.length}</div>
                  <div className="stat-label" style={{ fontSize: '0.7rem' }}>Repairs</div>
                </div>
                <div className="stat-card card" style={{ padding: '16px' }}>
                  <div className="stat-value" style={{ fontSize: '1.8rem' }}>{data.transfers.length}</div>
                  <div className="stat-label" style={{ fontSize: '0.7rem' }}>Transfers</div>
                </div>
                <div className="stat-card card" style={{ padding: '16px' }}>
                  <div className="stat-value" style={{ fontSize: '1.8rem' }}>{data.product.city}</div>
                  <div className="stat-label" style={{ fontSize: '0.7rem' }}>Origin</div>
                </div>
                <div className="stat-card card" style={{ padding: '16px' }}>
                  <div className="stat-value" style={{ fontSize: '1.8rem', color: data.repairs.some(r => r.customer_reported) ? 'var(--warning)' : 'var(--success)' }}>
                    {data.repairs.some(r => r.customer_reported && r.status === 'self-reported') ? '⚠' : '✓'}
                  </div>
                  <div className="stat-label" style={{ fontSize: '0.7rem' }}>Trust Level</div>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '24px' }}>
                <Clock size={20} style={{ color: 'var(--accent-primary)', verticalAlign: 'middle', marginRight: '8px' }} />
                Lifecycle Timeline
              </h3>

              <div className="timeline">
                {data.lifecycle.map((event, i) => (
                  <div className="timeline-item" key={i} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="timeline-dot" style={{ background: getColor(event), boxShadow: `0 0 12px ${getColor(event)}40` }} />
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: getColor(event) }}>{getIcon(event.type)}</span>
                          <strong>{event.title}</strong>
                          {event.customerReported && (
                            <span className="badge badge-self-reported">Self-Reported</span>
                          )}
                          {event.status === 'verified' && event.type === 'repair' && (
                            <span className="badge badge-verified">Verified</span>
                          )}
                        </div>
                        <span className="timeline-time">{formatDate(event.timestamp)}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                        {event.description}
                      </p>
                      {event.txHash && (
                        <div className="hash-display" style={{ fontSize: '0.72rem' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>TX:</span>
                          <span className="hash-text">{event.txHash}</span>
                          <button className="copy-btn" onClick={() => copyHash(event.txHash)}><Copy size={12} /></button>
                        </div>
                      )}
                      {event.ipfsHash && (
                        <div className="hash-display" style={{ fontSize: '0.72rem', marginTop: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>IPFS:</span>
                          <span className="hash-text">{event.ipfsHash}</span>
                          <button className="copy-btn" onClick={() => copyHash(event.ipfsHash)}><Copy size={12} /></button>
                        </div>
                      )}

                      {/* Verify Button for Service Centers */}
                      {event.type === 'repair' && event.status === 'self-reported' && user?.role === 'RepairCenter' && (
                        <div style={{ marginTop: '12px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            onClick={() => handleVerifyRepair(event)}
                            disabled={loading}
                          >
                            <CheckCircle size={14} /> Accept & Verify Repair
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {data.lifecycle.length === 0 && (
                <div className="card" style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No lifecycle events found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
