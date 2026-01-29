import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
let app;
let prisma;
beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
    process.env.AUTH_DISABLED = 'true';
    const prismaModule = await import('../src/prisma');
    prisma = prismaModule.prisma;
    await prisma.sessionInvite.deleteMany();
    await prisma.session.deleteMany();
    await prisma.expert.deleteMany();
    const expert = await prisma.expert.create({
        data: {
            name: 'Test Expert',
            expertise: ['Testing'],
            contactEmail: 'test@example.com'
        }
    });
    await prisma.session.create({
        data: {
            title: 'Test Session',
            description: 'Testing the API',
            tags: ['Testing'],
            scheduledAt: new Date(),
            visibility: 'public',
            hostOrganisation: 'QA Org',
            invites: { create: [{ expertId: expert.id }] }
        }
    });
    const appModule = await import('../src/app');
    app = appModule.default;
});
afterAll(async () => {
    await prisma.$disconnect();
});
describe('health', () => {
    it('returns ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
describe('sessions', () => {
    it('lists sessions', async () => {
        const res = await request(app).get('/api/sessions');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].title).toBeDefined();
    });
});
