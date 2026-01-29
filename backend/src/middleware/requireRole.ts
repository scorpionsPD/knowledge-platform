import { NextFunction, Request, Response } from 'express';

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.AUTH_DISABLED === 'true' || process.env.NODE_ENV === 'test') {
      return next();
    }

    const userRoles = req.user?.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
