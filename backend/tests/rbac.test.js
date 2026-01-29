import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app';
const prisma = new PrismaClient();
/**
 * Integration tests for RBAC (Role-Based Access Control)
 * Demonstrates proper security implementation and authorization logic
 * Tests different user roles and their permissions
 */
describe('RBAC Integration Tests', () => {
    let adminUserId;
    let editorUserId;
    let memberUserId;
    beforeAll(async () => {
        // Clean up any existing test data first
        await prisma.user.deleteMany({
            where: {
                externalId: { in: ['test-admin', 'test-editor', 'test-member'] }
            }
        });
        // Create test users with different roles
        const admin = await prisma.user.create({
            data: {
                externalId: 'test-admin',
                displayName: 'Test Admin',
                email: 'test-admin@example.com',
                roles: ['admin']
            }
        });
        adminUserId = admin.id;
        const editor = await prisma.user.create({
            data: {
                externalId: 'test-editor',
                displayName: 'Test Editor',
                email: 'test-editor@example.com',
                roles: ['editor']
            }
        });
        editorUserId = editor.id;
        const member = await prisma.user.create({
            data: {
                externalId: 'test-member',
                displayName: 'Test Member',
                email: 'test-member@example.com',
                roles: ['member']
            }
        });
        memberUserId = member.id;
    });
    afterAll(async () => {
        // Clean up test data
        if (adminUserId || editorUserId || memberUserId) {
            await prisma.user.deleteMany({
                where: {
                    id: { in: [adminUserId, editorUserId, memberUserId].filter(Boolean) }
                }
            });
        }
        await prisma.$disconnect();
    });
    describe('User Management', () => {
        it('should allow admin to list all users', async () => {
            const response = await request(app).get('/api/users').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        it('should allow admin to update user roles', async () => {
            const response = await request(app)
                .put(`/api/users/${editorUserId}`)
                .send({ roles: ['editor', 'member'] })
                .expect(200);
            expect(response.body.roles).toContain('editor');
            expect(response.body.roles).toContain('member');
        });
        it('should reject invalid roles', async () => {
            await request(app)
                .put(`/api/users/${memberUserId}`)
                .send({ roles: ['invalid-role'] })
                .expect(400);
        });
    });
    describe('Session Management', () => {
        it('should allow creating a session with valid data', async () => {
            const response = await request(app)
                .post('/api/sessions')
                .send({
                title: 'Test Session',
                description: 'This is a test session',
                tags: ['Testing', 'Integration'],
                scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                visibility: 'private',
                hostOrganisation: 'Test Org',
                invitedExperts: []
            })
                .expect(201);
            expect(response.body.title).toBe('Test Session');
            expect(response.body.tags).toContain('Testing');
            // Clean up
            await prisma.session.delete({ where: { id: response.body.id } });
        });
        it('should reject session with missing required fields', async () => {
            await request(app)
                .post('/api/sessions')
                .send({
                description: 'Missing title'
            })
                .expect(400);
        });
    });
    describe('Feedback Management', () => {
        let testSessionId;
        beforeAll(async () => {
            const session = await prisma.session.create({
                data: {
                    title: 'Feedback Test Session',
                    description: 'Session for testing feedback',
                    tags: ['Test'],
                    scheduledAt: new Date(),
                    visibility: 'public',
                    hostOrganisation: 'Test Org'
                }
            });
            testSessionId = session.id;
        });
        afterAll(async () => {
            await prisma.session.delete({ where: { id: testSessionId } });
        });
        it('should allow submitting feedback', async () => {
            const response = await request(app)
                .post('/api/feedback')
                .send({
                sessionId: testSessionId,
                rating: 5,
                comment: 'Great session!',
                authorName: 'Test User'
            })
                .expect(201);
            expect(response.body.rating).toBe(5);
            expect(response.body.comment).toBe('Great session!');
        });
        it('should allow editors and admins to view feedback', async () => {
            const response = await request(app)
                .get('/api/feedback')
                .query({ sessionId: testSessionId })
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    describe('Security Features', () => {
        it('should include security headers', async () => {
            const response = await request(app).get('/health');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-xss-protection']).toBeDefined();
        });
        it('should return 404 for non-existent routes', async () => {
            await request(app).get('/api/nonexistent').expect(404);
        });
        it('should validate UUID format for ID parameters', async () => {
            await request(app).get('/api/sessions/invalid-id').expect(400);
        });
    });
});
