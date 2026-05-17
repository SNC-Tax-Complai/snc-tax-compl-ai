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
    // if (!user) throw new AppError('Invalid credentials', 401);
    // const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    // if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    // Placeholder for development - validate against any password
    const user = {
      id: 1,
      email,
      role: 'manager',
      company_id: 1,
      first_name: 'Test',
      last_name: 'User',
    };

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
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

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // TODO: Check if user already exists
    // const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    // if (existingUser) throw new AppError('Email already registered', 409);

    // TODO: Hash password
    // const hashedPassword = await bcryptjs.hash(password, 10);

    // TODO: Create user in database
    // const user = await db.query(
    //   'INSERT INTO users (email, password_hash, full_name, company_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
    //   [email, hashedPassword, fullName, companyName, 'user']
    // );

    // Placeholder for development - simulate user creation with hashed password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = {
      id: 2,
      email,
      full_name: fullName,
      company_name: companyName,
      role: 'user',
    };

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
        fullName: user.full_name,
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
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // TODO: Fetch user details from database using userId
    // const user = await db.query('SELECT id, email, full_name, role, company_id FROM users WHERE id = $1', [req.user.userId]);

    // Placeholder for development
    const user = {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      firstName: 'Test',
      lastName: 'User',
    };

    res.json(user);
  } catch (error) {
    next(error);
  }
};
