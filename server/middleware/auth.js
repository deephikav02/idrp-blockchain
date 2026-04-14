import jwt from 'jsonwebtoken';

const JWT_SECRET = 'idrp-blockchain-secret-2025';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireManufacturer = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'Manufacturer' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Only Manufacturers can perform this action' });
    }
    next();
  });
};

export const requireRepairCenter = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'RepairCenter' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Only Repair Centers can perform this action' });
    }
    next();
  });
};

export const requireOwner = (req, res, next) => {
  authenticateToken(req, res, () => {
    // In our simplified logic, req.user.name or req.user.address is used to check ownership
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};
