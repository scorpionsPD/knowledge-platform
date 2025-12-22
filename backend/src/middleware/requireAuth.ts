import { NextFunction, Request, Response } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.AUTH_DISABLED === 'true' || process.env.NODE_ENV === 'test') {
    if (!req.user) {
      req.user = { id: 'dev-user', displayName: 'Dev User' };
    }
    return next();
  }

  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
}
