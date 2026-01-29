import { Router } from 'express';
import { z } from 'zod';

import prisma from '../prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const expertSchema = z.object({
  name: z.string().min(3),
  title: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  contactEmail: z.string().email().optional(),
  organisation: z.string().optional()
});

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const experts = await prisma.expert.findMany({ orderBy: { name: 'asc' } });
    const shaped = experts.map((expert) => ({
      ...expert,
      expertise: (expert.expertise as string[]) ?? []
    }));
    res.json(shaped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch experts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expert = await prisma.expert.findUnique({ where: { id: req.params.id } });
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.json({ ...expert, expertise: (expert.expertise as string[]) ?? [] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expert' });
  }
});

router.post('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const parseResult = expertSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  try {
    const expert = await prisma.expert.create({
      data: {
        ...parseResult.data,
        expertise: parseResult.data.expertise
      }
    });
    res.status(201).json({ ...expert, expertise: (expert.expertise as string[]) ?? [] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to create expert' });
  }
});

router.put('/:id', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  const parseResult = expertSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  try {
    const expert = await prisma.expert.upsert({
      where: { id: req.params.id },
      update: { ...parseResult.data, expertise: parseResult.data.expertise },
      create: {
        id: req.params.id,
        ...parseResult.data,
        expertise: parseResult.data.expertise ?? []
      }
    });
    res.json({ ...expert, expertise: (expert.expertise as string[]) ?? [] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to upsert expert' });
  }
});

export default router;
