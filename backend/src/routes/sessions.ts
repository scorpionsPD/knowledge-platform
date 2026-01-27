import { Router } from 'express';
import { z } from 'zod';

import prisma from '../prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { validateUUID } from '../middleware/validation';

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

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const isAuthed = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
    
    // Extract query parameters
    const { search, tags, visibility, from, to } = req.query;
    
    // Build where clause
    const where: any = isAuthed ? {} : { visibility: 'public' };
    
    // Add search filter (searches title and description)
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add visibility filter (if provided and user is authed)
    if (visibility && typeof visibility === 'string' && isAuthed) {
      where.visibility = visibility;
    }
    
    // Add date range filters
    if (from && typeof from === 'string') {
      where.scheduledAt = { ...where.scheduledAt, gte: new Date(from) };
    }
    if (to && typeof to === 'string') {
      where.scheduledAt = { ...where.scheduledAt, lte: new Date(to) };
    }
    
    const sessions = await prisma.session.findMany({
      where,
      include: sessionInclude,
      orderBy: { scheduledAt: 'asc' }
    });
    
    // Filter by tags in memory (since tags is a JSON field)
    let filteredSessions = sessions;
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      filteredSessions = sessions.filter(session => {
        const sessionTags = ((session.tags as string[]) ?? []).map(t => t.toLowerCase());
        return tagArray.some(tag => sessionTags.includes(tag));
      });
    }
    
    const shaped = filteredSessions.map((session) => ({
      ...session,
      tags: (session.tags as string[]) ?? [],
      outcomes: (session.outcomes as string[]) ?? [],
      invitedExperts: session.invites.map((invite) => invite.expert)
    }));
    res.json(shaped);
  })
);

router.get('/:id', validateUUID('id'), async (req, res) => {
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

router.post('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const parseResult = sessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }
  const { invitedExperts, ...sessionData } = parseResult.data;
  try {
    const session = await prisma.session.create({
      data: {
        ...sessionData,
        tags: sessionData.tags,
        outcomes: sessionData.outcomes ?? [],
        invites: {
          create: invitedExperts.map((expertId) => ({ expert: { connect: { id: expertId } } }))
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

router.put('/:id', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
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
