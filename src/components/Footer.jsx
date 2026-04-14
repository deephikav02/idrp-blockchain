import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Shield size={22} style={{ color: 'var(--accent-primary)' }} />
          IDRP
        </div>
        <p className="footer-text">
          India Digital Repair Passport — Blockchain-Powered Lifecycle Transparency<br />
          IEEE Research Prototype • Built with Ethereum, IPFS & React<br />
          © {new Date().getFullYear()} Deepika Leelakumar. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#register">Register</a>
          <a href="#verify">Verify Product</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#architecture">Architecture</a>
        </div>
      </div>
    </footer>
  );
}
