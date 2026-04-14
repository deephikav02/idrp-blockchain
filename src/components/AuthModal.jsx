import React, { useState } from 'react';
import { X, LogIn, UserPlus, Loader2, Mail, Lock, User, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, register } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    role: 'Consumer'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await login({ email: form.email, password: form.password });
        localStorage.setItem('idrp_token', data.token);
        localStorage.setItem('idrp_user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name}!`);
        onAuthSuccess(data.user);
      } else {
        await register(form);
        toast.success('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="success-icon" style={{ margin: '0 auto 16px', background: 'var(--accent-dim)', color: 'var(--accent-primary)' }}>
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            {isLogin ? 'Enter your credentials to access your passport' : 'Join India Digital Repair Passport today'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Consumer">Consumer</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="RepairCenter">Repair Center</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Wallet Address (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Wallet size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="0x..."
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '40px' }}
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '40px' }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin-icon" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--accent-primary)', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-content {
          position: relative;
          padding: 40px;
          animation: modalSlide 0.3s ease-out;
        }
        .modal-close {
          position: absolute;
          top: 20px; right: 20px;
          background: transparent; border: none; color: var(--text-muted);
          cursor: pointer;
        }
        @keyframes modalSlide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
