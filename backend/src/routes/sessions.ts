import { Router } from 'express';
import { z } from 'zod';

import prisma from '../prisma';
import { requireAuth } from '../middleware/requireAuth';

const sessionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  tags: z.array(z.string().min(2)).default([]),
  scheduledAt: z.string().datetime(),
  visibility: z.enum(['public', 'private']),
  invitedExperts: z.array(z.string()),
  hostOrganisation: z.string(),
  summary: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
  format: z.string().optional(),
  location: z.string().optional()
});

const router = Router();

const sessionInclude = { invites: { include: { expert: true } } };

router.get('/', async (req, res) => {
  try {
    const isAuthed = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
    const sessions = await prisma.session.findMany({
      where: isAuthed ? {} : { visibility: 'public' },
      include: sessionInclude,
      orderBy: { scheduledAt: 'asc' }
    });
    const shaped = sessions.map((session) => ({
      ...session,
      tags: (session.tags as string[]) ?? [],
      outcomes: (session.outcomes as string[]) ?? [],
      invitedExperts: session.invites.map((invite) => invite.expert)
    }));
    res.json(shaped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const isAuthed = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: sessionInclude
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.visibility === 'private' && !isAuthed) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({
      ...session,
      tags: (session.tags as string[]) ?? [],
      outcomes: (session.outcomes as string[]) ?? [],
      invitedExperts: session.invites.map((invite) => invite.expert)
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const parseResult = sessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }
  const data = parseResult.data;
  try {
    const session = await prisma.session.create({
      data: {
        ...data,
        tags: data.tags,
        outcomes: data.outcomes ?? [],
        invites: {
          create: data.invitedExperts.map((expertId) => ({ expert: { connect: { id: expertId } } }))
        }
      },
      include: sessionInclude
    });
    res.status(201).json({
      ...session,
      tags: (session.tags as string[]) ?? [],
      outcomes: (session.outcomes as string[]) ?? [],
      invitedExperts: session.invites.map((invite) => invite.expert)
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const parseResult = sessionSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }
  const data = parseResult.data;
  try {
    const updates = await prisma.$transaction(async (tx) => {
      if (data.invitedExperts) {
        await tx.sessionInvite.deleteMany({ where: { sessionId: req.params.id } });
      }
      const updatedSession = await tx.session.update({
        where: { id: req.params.id },
        data: {
          ...data,
          tags: data.tags ?? undefined,
          outcomes: data.outcomes ?? undefined
        },
        include: sessionInclude
      });
      if (data.invitedExperts) {
        await tx.sessionInvite.createMany({
          data: data.invitedExperts.map((expertId) => ({
            sessionId: req.params.id,
            expertId
          }))
        });
      }
      return updatedSession;
    });

    const reloaded = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: sessionInclude
    });

    if (!reloaded) return res.status(404).json({ message: 'Session not found' });

    res.json({
      ...reloaded,
      tags: (reloaded.tags as string[]) ?? [],
      outcomes: (reloaded.outcomes as string[]) ?? [],
      invitedExperts: reloaded.invites.map((invite) => invite.expert)
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.status(500).json({ message: 'Failed to update session' });
  }
});

export default router;
