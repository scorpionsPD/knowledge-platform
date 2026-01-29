import { Router } from 'express';

import prisma from '../prisma';

const router = Router();

router.get('/:sessionId/markdown', async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.sessionId },
      include: { invites: { include: { expert: true } } }
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const experts = session.invites
      .map((invite) => invite.expert)
      .filter(Boolean)
      .map((expert) => `- ${expert.name}${expert.title ? ` (${expert.title})` : ''}`)
      .join('\n');

    const markdownReport = `# Session Report: ${session.title}

**Host:** ${session.hostOrganisation}

**Scheduled:** ${session.scheduledAt.toISOString()}

**Visibility:** ${session.visibility}

## Description
${session.description}

## Invited Experts
${experts || '-'}

## Tags
${((session.tags as string[]) ?? []).map((tag) => `- ${tag}`).join('\n')}

## Summary
${session.summary || '_Not captured yet_'}

## Outcomes
${((session.outcomes as string[]) ?? []).map((item) => `- ${item}`).join('\n') || '_TBD_'}`;

    res.type('text/markdown').send(markdownReport);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Failed to build report' });
  }
});

export default router;
