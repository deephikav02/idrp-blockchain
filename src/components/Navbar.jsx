import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Menu, X, Wallet, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import { login, register, CONTRACT_ADDRESS, isMetaMaskInstalled } from '../services/api';

export default function Navbar({ activeSection, user, setUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);

  // Auto-reconnect if MetaMask was already connected previously
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsDevMode(false);
          }
        } catch (_) {}
      }
    };
    tryAutoConnect();
  }, []);

  const connectWallet = async () => {
    try {
      if (!isMetaMaskInstalled()) {
        // Dev Mode Fallback
        setWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        setIsDevMode(true);
        toast.success('Connected to Local Dev Wallet!');
        return;
      }
      toast.loading('Opening MetaMask...', { id: 'wallet' });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      toast.dismiss('wallet');
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsDevMode(false);
        toast.success('MetaMask connected!');
      } else {
        toast.error('No accounts returned. Check MetaMask.');
      }
    } catch (err) {
      toast.dismiss('wallet');
      if (err.code === 4001) {
        toast.error('Connection rejected. Please approve in MetaMask popup.');
      } else if (err.code === -32002) {
        toast.error('MetaMask is already open. Check the extension icon in your browser!');
      } else {
        toast.error('Failed to connect wallet: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('idrp_token');
    localStorage.removeItem('idrp_user');
    setUser(null);
    window.location.reload();
  };

  const allLinks = [
    { id: 'hero', label: 'Home', roles: ['any'] },
    { id: 'register', label: 'Register', roles: ['Admin', 'Manufacturer'] },
    { id: 'repair', label: 'Repair', roles: ['Admin', 'RepairCenter', 'Consumer'] },
    { id: 'transfer', label: 'Transfer', roles: ['Admin', 'Consumer'] },
    { id: 'verify', label: 'Verify', roles: ['Admin', 'RepairCenter', 'Consumer', 'guest'] },
    { id: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Manufacturer', 'RepairCenter', 'Consumer'] },
    { id: 'architecture', label: 'Architecture', roles: ['any'] },
  ];

  const links = allLinks.filter(l => {
    if (l.roles.includes('any')) return true;
    if (!user) return l.roles.includes('guest');
    return user.role === 'Admin' || l.roles.includes(user.role);
  });

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <a href="#hero" className="navbar-brand" onClick={(e) => { e.preventDefault(); scrollTo('hero'); }}>
            <Shield size={26} />
            IDRP
          </a>

          <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
            {links.map(link => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={activeSection === link.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.id); }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {walletAddress ? (
              <button 
                className="btn btn-outline" 
                style={{ 
                  padding: '8px 18px', 
                  borderColor: isDevMode ? 'var(--warning)' : 'var(--accent-primary)', 
                  color: isDevMode ? 'var(--warning)' : 'var(--accent-primary)' 
                }}
              >
                <Wallet size={16} /> {truncatedAddress} {isDevMode && <span style={{ fontSize: '0.65rem', marginLeft: '5px' }}>(DEV)</span>}
              </button>
            ) : (
              <button className="btn btn-outline" style={{ padding: '8px 18px' }} onClick={connectWallet}>
                <Wallet size={16} /> Connect
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn-icon" 
                  title="Logout"
                  style={{ background: 'rgba(255,82,82,0.1)', color: '#ff5252', width: '32px', height: '32px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="btn btn-outline" style={{ padding: '8px 18px' }} onClick={() => setAuthOpen(true)}>
                <LogIn size={16} /> Sign In
              </button>
            )}
            
            <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onAuthSuccess={(u) => {
          setUser(u);
          setAuthOpen(false);
        }} 
      />
    </>
  );
}
