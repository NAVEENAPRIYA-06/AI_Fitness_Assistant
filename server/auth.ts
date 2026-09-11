import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'healthpilot-jwt-secret-key-2026-production';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  onboardingComplete: boolean;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: AuthUser;
}

/**
 * Generates a signed JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingComplete: user.onboardingComplete
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Hashes a plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authentication Middleware for protected routes
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Missing or invalid Authorization header.',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      onboardingComplete: decoded.onboardingComplete
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Session expired or invalid token. Please log in again.',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Optional Auth Middleware: attaches user if token is present, but does not reject if absent
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        onboardingComplete: decoded.onboardingComplete
      };
    } catch {
      // Ignore invalid token in optional auth
    }
  }

  next();
}
