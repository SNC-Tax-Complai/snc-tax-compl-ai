import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRY = '24h';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) throw new AppError('Invalid credentials', 401);

    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    // Update last login
    await db.none('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name,
        companyId: user.company_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, companyName } = req.body;

    // Validation
    if (!email || !password || !fullName || !companyName) {
      throw new AppError('Email, password, name, and company name required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new AppError('Password must contain an uppercase letter', 400);
    }

    if (!/(?=.*[0-9])/.test(password)) {
      throw new AppError('Password must contain a number', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) throw new AppError('Email already registered', 409);

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Split fullName into first/last
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    // Create user in database
    const user = await db.one(
      `INSERT INTO users (email, password_hash, first_name, last_name, company_name, role)
       VALUES ($1, $2, $3, $4, $5, 'admin')
       RETURNING id, email, first_name, last_name, company_name, role`,
      [email, hashedPassword, firstName, lastName, companyName]
    );

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.first_name} ${user.last_name}`,
        companyName: user.company_name,
        role: user.role,
      },
    });
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
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

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
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await db.oneOrNone(
      'SELECT id, email, first_name, last_name, role, company_id, company_name FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!user) throw new AppError('User not found', 404);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company_name,
    });
  } catch (error) {
    next(error);
  }
};
