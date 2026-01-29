import { NextFunction, Request, Response } from 'express';

import prisma from '../prisma';

let devUserEnsured: Promise<void> | null = null;

async function ensureDevUser() {
  await prisma.user.upsert({
    where: { externalId: 'dev-user' },
    update: { displayName: 'Dev User' },
    create: {
      externalId: 'dev-user',
      displayName: 'Dev User',
      roles: ['admin']
    }
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.AUTH_DISABLED === 'true' || process.env.NODE_ENV === 'test') {
    try {
      if (!req.user) {
        req.user = { id: 'dev-user', displayName: 'Dev User', roles: ['admin'] };
      }
      if (!devUserEnsured) {
        devUserEnsured = ensureDevUser();
      }
      await devUserEnsured;
      return next();
    } catch (err) {
      return next(err);
    }
  }

  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
}
