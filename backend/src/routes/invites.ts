import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import prisma from '../prisma';

const router = Router();

const inviteSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).optional()
});

router.get('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  const invites = await prisma.sessionParticipantInvite.findMany({
    where: sessionId ? { sessionId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { session: { select: { id: true, title: true } } }
  });

  res.json(invites);
});

router.post('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const parseResult = inviteSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  try {
    const invite = await prisma.sessionParticipantInvite.create({
      data: {
        sessionId: parseResult.data.sessionId,
        email: parseResult.data.email,
        name: parseResult.data.name
      }
    });
    return res.status(201).json(invite);
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Invite already exists for this session.' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to create invite' });
  }
});

router.put('/:id', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const status = typeof req.body?.status === 'string' ? req.body.status : '';
  const allowed = new Set(['pending', 'sent', 'accepted', 'declined']);
  if (!allowed.has(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updated = await prisma.sessionParticipantInvite.update({
      where: { id: req.params.id },
      data: { status }
    });
    return res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Invite not found' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to update invite' });
  }
});

export default router;
