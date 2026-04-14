import React, { useEffect, useRef } from 'react';
import { ChevronDown, Cpu, Recycle, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let nodes = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resize();
      nodes = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'
      }} />
      <div className="hero-bg-glow" />

      <div className="hero-content">
        <div className="hero-badge animate-fadeInUp">
          <span className="dot" />
          IEEE Research Prototype
        </div>

        <h1 className="animate-fadeInUp delay-100">
          Blockchain-Powered<br />
          Repair Transparency<br />
          <span className="accent">for India</span>
        </h1>

        <p className="hero-subtitle animate-fadeInUp delay-200">
          Reducing E-Waste <span>•</span> Enabling Circular Economy <span>•</span> Building Trust
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
             className="animate-fadeInUp delay-300">
          <button className="btn btn-primary btn-lg" onClick={scrollToRegister}>
            Explore Framework <ChevronDown size={20} />
          </button>
        </div>

        <div className="grid-3 animate-fadeInUp delay-400" style={{ marginTop: '64px', maxWidth: '650px', margin: '64px auto 0' }}>
          <div style={{ textAlign: 'center' }}>
            <Cpu size={28} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>3.2M</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tonnes E-Waste/Year</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Recycle size={28} style={{ color: '#00e676', marginBottom: '8px' }} />
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>12 kg</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CO₂ Saved / Repair</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ShieldCheck size={28} style={{ color: '#ffa726', marginBottom: '8px' }} />
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>40%</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Informal Sector</div>
          </div>
        </div>
      </div>
    </section>
  );
}
