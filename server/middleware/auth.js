import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'event_management_ecosystem_secret_key_2026';

export const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or expired.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of these roles: ${roles.join(', ')}` });
    }
    
    next();
  };
};
