import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

export const checkEventOwnership = async (req, res, next) => {
  try {
    const { default: Event } = await import('../models/Event.js');
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found.' 
      });
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() && 
      req.user.role !== 'SUPER_ADMIN'
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to modify this event.' 
      });
    }

    req.event = event;
    next();
  } catch (error) {
    console.error('Ownership check error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking ownership.' 
    });
  }
};
