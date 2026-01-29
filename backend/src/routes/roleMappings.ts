import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import prisma from '../prisma';

const router = Router();

const rolesSchema = z.array(z.enum(['admin', 'editor', 'member'])).min(1);

const mappingSchema = z
  .object({
    email: z.string().email().optional(),
    domain: z.string().min(2).optional(),
    roles: rolesSchema
  })
  .refine((data) => data.email || data.domain, {
    message: 'Provide an email or domain for role mapping.'
  });

router.get('/', requireAuth, requireRole(['admin']), async (_req, res) => {
  const mappings = await prisma.roleMapping.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(mappings);
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const parseResult = mappingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  const email = parseResult.data.email?.toLowerCase().trim();
  const domain = parseResult.data.domain?.toLowerCase().trim();

  try {
    const mapping = await prisma.roleMapping.create({
      data: {
        email: email || undefined,
        domain: domain || undefined,
        roles: parseResult.data.roles
      }
    });
    return res.status(201).json(mapping);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Role mapping already exists.' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to create role mapping' });
  }
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const rolesResult = rolesSchema.safeParse(req.body?.roles);
  if (!rolesResult.success) {
    return res.status(400).json({ message: 'Invalid roles', errors: rolesResult.error.flatten() });
  }

  try {
    const updated = await prisma.roleMapping.update({
      where: { id: req.params.id },
      data: { roles: rolesResult.data }
    });
    return res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Role mapping not found' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to update role mapping' });
  }
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    await prisma.roleMapping.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Role mapping not found' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete role mapping' });
  }
});

export default router;
