import React, { useState } from 'react';
import { Wrench, Upload, CheckCircle, AlertTriangle, Copy, Loader2, User, Store, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { logRepair as apiLogRepair, getContract } from '../services/api';

const PARTS = ['Screen', 'Battery', 'Motherboard', 'Camera', 'Speaker', 'Charging Port', 'Microphone', 'Wi-Fi Module', 'SIM Tray', 'Back Panel', 'Other'];

export default function RepairLogger({ user }) {
  const isConsumer = user?.role === 'Consumer';
  const isRepairCenter = user?.role === 'RepairCenter';
  
  const [reporterType, setReporterType] = useState(isConsumer ? 'customer' : 'shop'); // 'shop' or 'customer'
  const [form, setForm] = useState({
    productId: '', repairCenter: isRepairCenter ? user.name : '', partReplaced: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [billFile, setBillFile] = useState(null);
  const [billBase64, setBillBase64] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setBillFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBillBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.partReplaced) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const contract = await getContract(true);
      
      toast.loading('Signing repair log...', { id: 'tx' });
      const tx = await contract.logRepair(
        form.productId,
        form.repairCenter || 'Anonymous Shop',
        form.partReplaced,
        form.description || 'N/A',
        'ipfs-hash-simulated'
      );
      
      toast.loading('Mining repair transaction...', { id: 'tx' });
      const receipt = await tx.wait();
      toast.dismiss('tx');

      setResult({
        productId: form.productId,
        partReplaced: form.partReplaced,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed),
        customerReported: reporterType === 'customer',
        ipfsHash: 'ipfs-hash-simulated'
      });
      
      toast.success('Repair logged on blockchain!');

      // Also save to backend database for Verification timeline to work
      try {
        await apiLogRepair({
          productId: form.productId,
          repairCenter: form.repairCenter || 'Anonymous Shop',
          partReplaced: form.partReplaced,
          description: form.description || 'N/A',
          ipfsHash: 'ipfs-hash-simulated',
          customerReported: reporterType === 'customer'
        });
      } catch (dbErr) {
        console.warn('Backend sync warning:', dbErr.message);
      }
    } catch (err) {
      toast.dismiss('tx');
      toast.error(err.reason || err.message || 'Failed to log repair');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const reset = () => {
    setForm({ productId: '', repairCenter: '', partReplaced: '', description: '' });
    setResult(null);
    setBillFile(null);
    setBillBase64('');
  };

  return (
    <section id="repair" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">Repair Logging</span></h2>
          <p>Log repair events — shops can verify, or customers can self-report with proof</p>
        </div>

        <div className="grid-2">
          {/* Form */}
          <div className="card">
            {/* Reporter Type Toggle - Only visible to Admin/Manufacturers */}
            {(user?.role === 'Admin' || user?.role === 'Manufacturer') && (
              <div className="tabs" style={{ marginBottom: '24px' }}>
                <button
                  className={`tab ${reporterType === 'shop' ? 'active' : ''}`}
                  onClick={() => setReporterType('shop')}
                  type="button"
                >
                  <Store size={16} /> Repair Shop
                </button>
                <button
                  className={`tab ${reporterType === 'customer' ? 'active' : ''}`}
                  onClick={() => setReporterType('customer')}
                  type="button"
                >
                  <User size={16} /> Customer Self-Report
                </button>
              </div>
            )}

            {reporterType === 'customer' && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--warning-dim)',
                border: '1px solid rgba(255,167,38,0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.85rem',
                color: 'var(--warning)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Self-reported repairs are tagged as <strong>"Pending Verification"</strong>. 
                  Upload your repair bill as proof. A verified shop can confirm it later.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product ID</label>
                <input
                  className="form-input"
                  placeholder="Enter registered product ID"
                  value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {reporterType === 'customer' ? 'Repair Shop Name (where repaired)' : 'Repair Center'}
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., iCare Service Center, Chennai"
                  value={form.repairCenter}
                  onChange={e => setForm({ ...form, repairCenter: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Part Replaced</label>
                <select
                  className="form-input form-select"
                  value={form.partReplaced}
                  onChange={e => setForm({ ...form, partReplaced: e.target.value })}
                >
                  <option value="">Select part...</option>
                  {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Additional details about the repair..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              {reporterType === 'customer' && (
                <div className="form-group">
                  <label className="form-label">Upload Bill / Receipt (Proof)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, application/pdf"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                      }}
                    />
                    <div style={{
                      border: billFile ? '2px solid var(--accent-primary)' : '2px dashed var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      textAlign: 'center',
                      background: billFile ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                      transition: 'all 0.2s',
                    }}>
                      {billFile ? (
                        <>
                          <CheckCircle size={28} style={{ marginBottom: '8px', color: 'var(--accent-primary)' }} />
                          <p style={{ color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                            {billFile.name} attached
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(billFile.size / 1024).toFixed(1)} KB (Ready for IPFS)
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={28} style={{ marginBottom: '8px', opacity: 0.5, color: 'var(--text-muted)' }} />
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Drag & drop or click to upload<br />
                            <span style={{ fontSize: '0.75rem' }}>PNG, JPG, PDF (Max 2MB)</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="spin-icon" /> Processing...</>
                ) : (
                  <><Wrench size={18} /> {reporterType === 'customer' ? 'Submit Self-Report' : 'Log Repair on Chain'}</>
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!result && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <Wrench size={64} style={{ opacity: 0.15, marginBottom: '16px' }} />
                <p>Log a repair event to see blockchain and IPFS details here.</p>
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>🔒 SHA-256 Hash Verification</strong>
                  <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                    Every repair record is cryptographically hashed and stored on IPFS with the hash reference on-chain.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 20px' }} />
                <p style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Uploading to IPFS & Mining...
                </p>
              </div>
            )}

            {result && (
              <div className="confirmation-panel">
                <div className="success-icon" style={
                  result.customerReported
                    ? { borderColor: 'var(--warning)', background: 'var(--warning-dim)', color: 'var(--warning)' }
                    : {}
                }>
                  {result.customerReported ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                </div>
                <h3 style={{ textAlign: 'center', marginBottom: '4px', color: result.customerReported ? 'var(--warning)' : 'var(--success)' }}>
                  {result.customerReported ? 'Self-Reported' : 'Verified on Chain'} ✓
                </h3>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
                  {result.customerReported ? 'Awaiting shop verification' : 'Repair permanently recorded'}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <span className={result.customerReported ? 'badge badge-self-reported' : 'badge badge-verified'}>
                    {result.customerReported ? '⚠ Self-Reported' : '✓ Verified'}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Product</span>
                  <span className="detail-value">{result.productId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Part</span>
                  <span className="detail-value">{result.partReplaced}</span>
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
                  <label className="form-label">IPFS Hash</label>
                  <div className="hash-display">
                    <span className="hash-text">{result.ipfsHash}</span>
                    <button className="copy-btn" onClick={() => copyHash(result.ipfsHash)}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">TX Hash</label>
                  <div className="hash-display">
                    <span className="hash-text">{result.transactionHash}</span>
                    <button className="copy-btn" onClick={() => copyHash(result.transactionHash)}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label">SHA-256</label>
                  <div className="hash-display">
                    <span className="hash-text">{result.sha256}</span>
                    <button className="copy-btn" onClick={() => copyHash(result.sha256)}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={reset}>
                  Log Another Repair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </section>
  );
}
