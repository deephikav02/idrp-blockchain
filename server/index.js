import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import productsRouter from './routes/products.js';
import repairsRouter from './routes/repairs.js';
import transfersRouter from './routes/transfers.js';
import dashboardRouter from './routes/dashboard.js';
import authRouter from './routes/auth.js';
import { startIndexer } from './services/indexer.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Start blockchain indexing
startIndexer();

// Initialize database
initDatabase();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for the requested origin (useful for local Vite ports shifting to 5174, 5175, etc.)
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/dashboard', dashboardRouter);

// Welcome Root Route
app.get('/', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white;">
      <div style="text-align: center; border: 1px solid #334155; padding: 2rem; border-radius: 1rem; background: #1e293b;">
        <h1 style="color: #38bdf8;">🛡️ IDRP Backend is LIVE</h1>
        <p>India Digital Repair Passport - Production API</p>
        <div style="margin-top: 1.5rem; color: #94a3b8; font-size: 0.9rem;">
          Status: 🟢 Connected to Sepolia Testnet
        </div>
      </div>
    </body>
  `);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IDRP Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    blockchain: 'Ethereum Sepolia',
    indexer: 'Active',
    database: 'SQLite'
  });
});


// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🛡️  IDRP Backend Server                    ║
  ║   India Digital Repair Passport              ║
  ║                                              ║
  ║   🌐 API:    http://localhost:${PORT}           ║
  ║   📦 DB:     SQLite (server/db/idrp.db)      ║
  ║   🔗 Chain:  Simulated Ethereum              ║
  ║   📁 IPFS:   Local Simulation                ║
  ╚══════════════════════════════════════════════╝
  `);
});
