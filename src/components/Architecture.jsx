import React, { useState } from 'react';
import { Layers, Monitor, Server, FileCode, Link, Database, Shield, Zap, ArrowRight } from 'lucide-react';

const LAYERS = [
  {
    id: 'frontend',
    name: 'Frontend (React)',
    icon: <Monitor size={20} />,
    color: '#00d4ff',
    role: 'User interface for product registration, repair logging, ownership transfer, and verification. Built with React + Vite for high performance.',
    security: [
      'Input validation and sanitization',
      'CORS-protected API calls',
      'Client-side hash verification',
      'Responsive design for all devices'
    ],
    dataFlow: 'User interacts → Form validation → API call → Display blockchain confirmation',
    tech: ['React 19', 'Vite', 'Recharts', 'Framer Motion', 'Lucide Icons']
  },
  {
    id: 'backend',
    name: 'Backend API (Node.js)',
    icon: <Server size={20} />,
    color: '#0099ff',
    role: 'RESTful API server handling business logic, data validation, and orchestrating blockchain and IPFS operations.',
    security: [
      'JWT-based authentication',
      'Rate limiting & request throttling',
      'Role-based access control (RBAC)',
      'Input sanitization middleware'
    ],
    dataFlow: 'Receives API request → Validates data → Interacts with blockchain/IPFS → Stores in DB → Returns response',
    tech: ['Node.js', 'Express', 'SQLite', 'CORS', 'JWT']
  },
  {
    id: 'contract',
    name: 'Smart Contract (Solidity)',
    icon: <FileCode size={20} />,
    color: '#6c5ce7',
    role: 'Ethereum smart contract managing product registration, repair logging with self-reporting, and ownership transfers. Implements RBAC for manufacturers and repair centers.',
    security: [
      'OpenZeppelin-style access control',
      'Modifier-based authorization',
      'Event emission for all operations',
      'Overwrite protection (product IDs)'
    ],
    dataFlow: 'Backend calls contract → EVM executes → State updated → Event emitted → Receipt returned',
    tech: ['Solidity ^0.8.19', 'Hardhat', 'Ethers.js']
  },
  {
    id: 'blockchain',
    name: 'Ethereum Blockchain',
    icon: <Link size={20} />,
    color: '#00e676',
    role: 'Immutable distributed ledger storing all product lifecycle events. Each transaction is cryptographically linked, making tampering computationally infeasible.',
    security: [
      'SHA-256 cryptographic hashing',
      'Merkle tree state verification',
      'Consensus mechanism validation',
      'Block finality guarantees'
    ],
    dataFlow: 'Transaction submitted → Mining/Validation → Block created → Hash linked → Permanent record',
    tech: ['Ethereum', 'Hardhat Local Node', 'Proof of Authority']
  },
  {
    id: 'ipfs',
    name: 'IPFS Storage',
    icon: <Database size={20} />,
    color: '#ffa726',
    role: 'Decentralized file storage for repair documents, bills, and detailed records. Content-addressed storage ensures data integrity.',
    security: [
      'Content-addressed (CID-based) retrieval',
      'SHA-256 hash verification',
      'Distributed redundancy',
      'Tamper-evident — any change = new hash'
    ],
    dataFlow: 'Document uploaded → SHA-256 hash generated → Stored on IPFS → CID reference saved on blockchain',
    tech: ['IPFS Protocol', 'Content Addressing', 'Local Simulation (dev)']
  }
];

export default function Architecture() {
  const [activeLayer, setActiveLayer] = useState('frontend');
  const layer = LAYERS.find(l => l.id === activeLayer);

  return (
    <section id="architecture" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">System Architecture</span></h2>
          <p>Interactive 5-layer blockchain architecture — click each layer to explore</p>
        </div>

        {/* Architecture Visualization */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {LAYERS.map((l, i) => (
            <React.Fragment key={l.id}>
              <button
                onClick={() => setActiveLayer(l.id)}
                className={`btn ${activeLayer === l.id ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderColor: l.color,
                  color: activeLayer === l.id ? '#fff' : l.color,
                  background: activeLayer === l.id ? l.color : 'transparent',
                  minWidth: '160px'
                }}
              >
                {l.icon} {l.name.split(' (')[0]}
              </button>
              {i < LAYERS.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Layer Detail */}
        {layer && (
          <div className="card card-glow animate-scaleIn" key={layer.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: `${layer.color}20`, border: `1px solid ${layer.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: layer.color
              }}>
                {layer.icon}
              </div>
              <div>
                <h3 style={{ color: layer.color }}>{layer.name}</h3>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '24px' }}>
              <div>
                <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} style={{ color: layer.color }} /> Role
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {layer.role}
                </p>

                <h4 style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} style={{ color: layer.color }} /> Data Flow
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  {layer.dataFlow}
                </p>

                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Technologies</h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {layer.tech.map(t => (
                    <span key={t} className="badge badge-info">{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} style={{ color: layer.color }} /> Security Properties
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {layer.security.map((s, i) => (
                    <li key={i} style={{
                      padding: '10px 14px', marginBottom: '6px',
                      background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid ${layer.color}`,
                      color: 'var(--text-secondary)', fontSize: '0.88rem'
                    }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
