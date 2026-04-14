import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductRegistration from './components/ProductRegistration';
import RepairLogger from './components/RepairLogger';
import OwnershipTransfer from './components/OwnershipTransfer';
import ProductVerification from './components/ProductVerification';
import Dashboard from './components/Dashboard';
import Architecture from './components/Architecture';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('idrp_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const handleScroll = () => {
      const sections = ['hero', 'register', 'repair', 'transfer', 'verify', 'dashboard', 'architecture'];
      const scrollPos = window.scrollY + 200;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const canSee = (role) => {
    if (!user) return ['hero', 'verify', 'architecture'].includes(role);
    if (user.role === 'Admin') return true;
    if (user.role === 'Manufacturer') return ['hero', 'register', 'dashboard', 'architecture'].includes(role);
    if (user.role === 'RepairCenter') return ['hero', 'repair', 'verify', 'dashboard', 'architecture'].includes(role);
    if (user.role === 'Consumer') return ['hero', 'repair', 'transfer', 'verify', 'dashboard', 'architecture'].includes(role);
    return false;
  };

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1937',
            color: '#e8eaf6',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem'
          },
          success: { iconTheme: { primary: '#00e676', secondary: '#0d1937' } },
          error: { iconTheme: { primary: '#ff5252', secondary: '#0d1937' } }
        }}
      />
      <Navbar activeSection={activeSection} user={user} setUser={setUser} />
      <main>
        <HeroSection />
        {canSee('register') && <ProductRegistration user={user} />}
        {canSee('repair') && <RepairLogger user={user} />}
        {canSee('transfer') && <OwnershipTransfer user={user} />}
        {canSee('verify') && <ProductVerification user={user} />}
        {canSee('dashboard') && <Dashboard user={user} />}
        {canSee('architecture') && <Architecture user={user} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
