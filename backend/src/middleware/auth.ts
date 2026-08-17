/**
 * JWT Authentication Middleware
 * 
 * How it works:
 *   1. Reads the `Authorization: Bearer <token>` header from the request.
 *   2. Verifies the JWT using the shared secret from .env.
 *   3. If valid, attaches `req.userId` so downstream routes know who is calling.
 *   4. If invalid or missing, returns 401 Unauthorized.
 */

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request so routes can read req.userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'wits_quest_dev_secret_change_me';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

/**
 * Helper: sign a JWT for a given userId. Expires in 7 days.
 */
export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
