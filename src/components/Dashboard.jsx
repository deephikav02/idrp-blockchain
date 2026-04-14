import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Recycle, Cpu, Package, Wrench, ArrowRightLeft, Activity } from 'lucide-react';
import { getStats, getCityRepairs, getLifecycleData, getActivity } from '../services/api';

const CHART_COLORS = ['#00d4ff', '#0099ff', '#6c5ce7', '#00e676', '#ffa726', '#ff5252', '#a29bfe', '#fd79a8'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cityData, setCityData] = useState([]);
  const [lifecycleData, setLifecycleData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeChart, setActiveChart] = useState('city');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, c, l, a] = await Promise.all([
        getStats(), getCityRepairs(), getLifecycleData(), getActivity()
      ]);
      setStats(s.data.data);
      setCityData(c.data.data);
      setLifecycleData(l.data.data);
      setActivity(a.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      // Use default data if backend not running
      setStats({
        totalProducts: 0, totalRepairs: 0, totalTransfers: 0,
        verifiedRepairs: 0, selfReportedRepairs: 0,
        annualEWaste: '3.2M tonnes', avgReplacementCycle: '2.5 years',
        informalRepairSector: '40%', co2SavedPerRepair: '12 kg'
      });
      setCityData([
        { city: 'Chennai', repairCount: 450 },
        { city: 'Bengaluru', repairCount: 380 },
        { city: 'Hyderabad', repairCount: 320 },
        { city: 'Mumbai', repairCount: 290 },
        { city: 'Delhi', repairCount: 260 }
      ]);
      setLifecycleData([
        { year: '2019', avgLifespan: 2.1, repairRate: 15, eWasteReduced: 0.3 },
        { year: '2020', avgLifespan: 2.3, repairRate: 22, eWasteReduced: 0.5 },
        { year: '2021', avgLifespan: 2.6, repairRate: 31, eWasteReduced: 0.8 },
        { year: '2022', avgLifespan: 3.0, repairRate: 42, eWasteReduced: 1.2 },
        { year: '2023', avgLifespan: 3.4, repairRate: 55, eWasteReduced: 1.6 },
        { year: '2024', avgLifespan: 3.8, repairRate: 65, eWasteReduced: 2.1 },
        { year: '2025', avgLifespan: 4.2, repairRate: 78, eWasteReduced: 2.8 }
      ]);
    }
  };

  const repairPieData = stats ? [
    { name: 'Verified', value: Math.max(stats.verifiedRepairs, 1), color: '#00e676' },
    { name: 'Self-Reported', value: Math.max(stats.selfReportedRepairs, 1), color: '#ffa726' }
  ] : [];

  return (
    <section id="dashboard" className="section">
      <div className="container">
        <div className="section-header">
          <h2><span className="text-gradient">India E-Waste Dashboard</span></h2>
          <p>Real-time blockchain analytics and e-waste impact metrics</p>
        </div>

        {/* Key Stats */}
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          {[
            { icon: <Cpu size={24} />, value: stats?.annualEWaste || '3.2M', label: 'Annual E-Waste', color: '#ff5252' },
            { icon: <Recycle size={24} />, value: stats?.co2SavedPerRepair || '12 kg', label: 'CO₂ Saved/Repair', color: '#00e676' },
            { icon: <Package size={24} />, value: stats?.totalProducts || 0, label: 'Products Registered', color: '#00d4ff' },
            { icon: <Wrench size={24} />, value: stats?.totalRepairs || 0, label: 'Repairs Logged', color: '#ffa726' }
          ].map((stat, i) => (
            <div className="card stat-card" key={i}>
              <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart Tabs */}
        <div className="tabs">
          <button className={`tab ${activeChart === 'city' ? 'active' : ''}`} onClick={() => setActiveChart('city')}>
            <BarChart3 size={16} /> City Repairs
          </button>
          <button className={`tab ${activeChart === 'lifecycle' ? 'active' : ''}`} onClick={() => setActiveChart('lifecycle')}>
            <TrendingUp size={16} /> Lifecycle Trend
          </button>
          <button className={`tab ${activeChart === 'ewaste' ? 'active' : ''}`} onClick={() => setActiveChart('ewaste')}>
            <Recycle size={16} /> E-Waste Reduction
          </button>
          <button className={`tab ${activeChart === 'verification' ? 'active' : ''}`} onClick={() => setActiveChart('verification')}>
            <Activity size={16} /> Verification
          </button>
        </div>

        {/* Charts */}
        <div className="card" style={{ padding: '30px' }}>
          {activeChart === 'city' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Repairs by City</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
                  <XAxis dataKey="city" stroke="#8892b0" fontSize={12} />
                  <YAxis stroke="#8892b0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1937', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: '8px', color: '#e8eaf6'
                    }}
                  />
                  <Bar dataKey="repairCount" name="Repairs" radius={[6, 6, 0, 0]}>
                    {cityData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'lifecycle' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Average Product Lifespan (Years)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lifecycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
                  <XAxis dataKey="year" stroke="#8892b0" fontSize={12} />
                  <YAxis stroke="#8892b0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1937', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: '8px', color: '#e8eaf6'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgLifespan" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 5 }} name="Avg Lifespan (yrs)" />
                  <Line type="monotone" dataKey="repairRate" stroke="#00e676" strokeWidth={2} dot={{ fill: '#00e676', r: 4 }} name="Repair Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'ewaste' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>E-Waste Reduction via Repair Passport (Million Tonnes)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={lifecycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
                  <XAxis dataKey="year" stroke="#8892b0" fontSize={12} />
                  <YAxis stroke="#8892b0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1937', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: '8px', color: '#e8eaf6'
                    }}
                  />
                  <defs>
                    <linearGradient id="ewasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e676" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00e676" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="eWasteReduced" stroke="#00e676" strokeWidth={2} fill="url(#ewasteGrad)" name="E-Waste Reduced (MT)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === 'verification' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Repair Verification Breakdown</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={repairPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {repairPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0d1937', border: '1px solid rgba(0,212,255,0.2)',
                        borderRadius: '8px', color: '#e8eaf6'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00e676' }} />
                    <span>Shop Verified</span>
                    <strong style={{ marginLeft: 'auto', color: '#00e676' }}>{stats?.verifiedRepairs || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffa726' }} />
                    <span>Customer Self-Reported</span>
                    <strong style={{ marginLeft: 'auto', color: '#ffa726' }}>{stats?.selfReportedRepairs || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        <div className="grid-3" style={{ marginTop: '30px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AVG REPLACEMENT CYCLE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stats?.avgReplacementCycle || '2.5 years'}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>INFORMAL REPAIR SECTOR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats?.informalRepairSector || '40%'}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL TRANSFERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a29bfe' }}>{stats?.totalTransfers || 0}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
