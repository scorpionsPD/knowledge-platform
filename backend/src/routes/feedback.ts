import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import prisma from '../prisma';

const router = Router();

const feedbackSchema = z.object({
  sessionId: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(3).max(2000).optional(),
  authorName: z.string().min(1).optional(),
  authorEmail: z.string().email().optional()
});

router.get('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  const feedback = await prisma.sessionFeedback.findMany({
    where: sessionId ? { sessionId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { session: { select: { id: true, title: true } } }
  });

  res.json(feedback);
});

router.post('/', requireAuth, async (req, res) => {
  const parseResult = feedbackSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  try {
    const data = parseResult.data;
    const feedback = await prisma.sessionFeedback.create({
      data: {
        sessionId: data.sessionId,
        rating: data.rating,
        comment: data.comment,
        authorName: data.authorName ?? req.user?.displayName,
        authorEmail: data.authorEmail ?? req.user?.email ?? undefined
      }
    });
    return res.status(201).json(feedback);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

export default router;
