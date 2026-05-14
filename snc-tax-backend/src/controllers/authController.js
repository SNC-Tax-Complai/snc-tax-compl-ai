import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRY = '24h';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    // TODO: Query user from database
    // const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // Placeholder for development
    const user = {
      id: 1,
      email,
      role: 'manager',
      company_id: 1,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, companyId } = req.body;

    if (!email || !password || !fullName) {
      throw new AppError('Email, password, and name required', 400);
    }

    // TODO: Create user in database
    const user = {
      id: 1,
      email,
      full_name: fullName,
      company_id: companyId,
      role: 'user',
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Token required', 400);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign(decoded, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // TODO: Fetch user from database
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
