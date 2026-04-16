import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database.js';

const router = express.Router();
const JWT_SECRET = 'idrp-blockchain-secret-2025'; // In production, use process.env.JWT_SECRET

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, address, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Required fields: email, password, name' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, address, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(email, hashedPassword, name, address || null, role || 'Consumer');

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`[AUTH] Login: ${email}`);
    console.log(`[AUTH] Password Input Length: ${password.length}`);
    console.log(`[AUTH] DB Hash Starts With: ${user.password.substring(0, 10)}...`);
    console.log(`[AUTH] Match Result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        address: user.address,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
