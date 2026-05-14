import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }

  next();
};
