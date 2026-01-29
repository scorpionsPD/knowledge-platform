import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import prisma from '../prisma';

const router = Router();

const allowedRoles = new Set(['admin', 'editor', 'member']);

router.get('/', requireAuth, requireRole(['admin']), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      externalId: true,
      displayName: true,
      email: true,
      roles: true,
      createdAt: true,
      updatedAt: true
    }
  });
  res.json(users);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const roles = Array.isArray(req.body?.roles)
    ? (req.body.roles as string[]).filter((role) => allowedRoles.has(role))
    : [];

  if (roles.length === 0) {
    return res.status(400).json({ message: 'Provide at least one valid role.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { roles }
  });

  return res.json({
    id: updated.id,
    externalId: updated.externalId,
    displayName: updated.displayName,
    email: updated.email,
    roles: updated.roles,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

export default router;
