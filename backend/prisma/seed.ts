import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [alex, priya] = await prisma.$transaction([
    prisma.expert.upsert({
      where: { contactEmail: 'alex.rivera@example.com' },
      update: {},
      create: {
        name: 'Alex Rivera',
        title: 'Principal Engineer',
        expertise: ['Architecture', 'Security', 'Platform'],
        contactEmail: 'alex.rivera@example.com',
        organisation: 'Acme Corp'
      }
    }),
    prisma.expert.upsert({
      where: { contactEmail: 'priya.nair@example.com' },
      update: {},
      create: {
        name: 'Priya Nair',
        title: 'Staff Mobile Engineer',
        expertise: ['Mobile', 'AI'],
        contactEmail: 'priya.nair@example.com',
        organisation: 'Global Apps'
      }
    })
  ]);

  const session = await prisma.session.create({
    data: {
      title: 'Zero Trust in Hybrid Clouds',
      description: 'Designing secure access for multi-cloud environments.',
      tags: ['Security', 'Architecture'],
      scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      visibility: 'private',
      hostOrganisation: 'Acme Corp',
      summary: 'Explored patterns for conditional access and observability.',
      outcomes: ['Pilot network segmentation in Q1', 'Adopt OIDC for service auth'],
      format: 'Virtual',
      location: 'Zoom',
      invites: {
        create: [
          {
            expert: { connect: { id: alex.id } }
          }
        ]
      }
    }
  });

  await prisma.session.create({
    data: {
      title: 'AI Safety for Mobile Clients',
      description: 'Mitigating prompt injection and misuse in on-device models.',
      tags: ['AI', 'Mobile'],
      scheduledAt: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      visibility: 'public',
      hostOrganisation: 'Global Apps',
      format: 'Hybrid',
      location: 'HQ Auditorium',
      invites: {
        create: [
          {
            expert: { connect: { id: priya.id } }
          }
        ]
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log('Seeded experts and sessions. First session id:', session.id);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
