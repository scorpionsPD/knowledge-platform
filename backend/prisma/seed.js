import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Comprehensive seed script for demonstration and testing
 * Creates users with different roles, experts, sessions, invites, and feedback
 * Demonstrates full RBAC functionality and data relationships
 */
async function main() {
    console.log('🌱 Seeding database...');
    // Step 1: Create users with different roles (demonstrates RBAC)
    console.log('Creating users with different roles...');
    const [adminUser, editorUser, memberUser] = await prisma.$transaction([
        prisma.user.upsert({
            where: { externalId: 'admin-001' },
            update: {},
            create: {
                externalId: 'admin-001',
                displayName: 'Admin User',
                email: 'admin@example.com',
                roles: ['admin']
            }
        }),
        prisma.user.upsert({
            where: { externalId: 'editor-001' },
            update: {},
            create: {
                externalId: 'editor-001',
                displayName: 'Editor User',
                email: 'editor@example.com',
                roles: ['editor']
            }
        }),
        prisma.user.upsert({
            where: { externalId: 'member-001' },
            update: {},
            create: {
                externalId: 'member-001',
                displayName: 'Member User',
                email: 'member@example.com',
                roles: ['member']
            }
        })
    ]);
    console.log(`✓ Created ${adminUser.displayName}, ${editorUser.displayName}, ${memberUser.displayName}`);
    // Step 2: Create experts (demonstrates domain expertise)
    console.log('Creating expert profiles...');
    // Delete existing experts to ensure clean seed
    await prisma.expert.deleteMany({
        where: {
            contactEmail: {
                in: [
                    'alex.rivera@example.com',
                    'priya.nair@example.com',
                    'jordan.kim@example.com',
                    'maya.patel@example.com'
                ]
            }
        }
    });
    const [alex, priya, jordan, maya] = await prisma.$transaction([
        prisma.expert.create({
            data: {
                name: 'Alex Rivera',
                title: 'Principal Security Architect',
                bio: 'Security expert with 15+ years experience in cloud infrastructure and zero-trust architectures.',
                expertise: ['Security', 'Architecture', 'Cloud Infrastructure', 'Zero Trust'],
                contactEmail: 'alex.rivera@example.com',
                organisation: 'Acme Corp'
            }
        }),
        prisma.expert.create({
            data: {
                name: 'Dr. Priya Nair',
                title: 'Staff AI/ML Engineer',
                bio: 'PhD in Machine Learning. Specializes in production ML systems and ethical AI.',
                expertise: ['Machine Learning', 'AI Ethics', 'MLOps', 'Data Science'],
                contactEmail: 'priya.nair@example.com',
                organisation: 'Global AI Labs'
            }
        }),
        prisma.expert.create({
            data: {
                name: 'Jordan Kim',
                title: 'VP of Engineering',
                bio: 'Engineering leader focused on building high-performing teams and scalable systems.',
                expertise: ['Engineering Leadership', 'Platform Engineering', 'DevOps', 'Team Building'],
                contactEmail: 'jordan.kim@example.com',
                organisation: 'TechScale Inc'
            }
        }),
        prisma.expert.create({
            data: {
                name: 'Maya Patel',
                title: 'Senior Frontend Architect',
                bio: 'Expert in modern web technologies and accessibility. Building inclusive user experiences.',
                expertise: ['Frontend Architecture', 'React', 'Accessibility', 'Performance Optimization'],
                contactEmail: 'maya.patel@example.com',
                organisation: 'WebFlow Design'
            }
        })
    ]);
    console.log(`✓ Created ${[alex, priya, jordan, maya].length} expert profiles`);
    // Step 3: Create sessions (demonstrates session management)
    console.log('Creating knowledge sessions...');
    const session1 = await prisma.session.create({
        data: {
            title: 'Zero Trust Architecture for Multi-Cloud Environments',
            description: 'Deep dive into implementing zero-trust security models across AWS, Azure, and GCP. We\'ll explore identity-based access, network segmentation, and continuous verification strategies.',
            tags: ['Security', 'Architecture', 'Cloud', 'DevOps'],
            scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            visibility: 'private',
            hostOrganisation: 'Acme Corp',
            summary: 'Explored patterns for conditional access and observability across cloud providers. Discussed implementing policy-as-code and runtime security monitoring.',
            outcomes: [
                'Pilot network segmentation in Q1 2026',
                'Adopt OIDC for service-to-service auth',
                'Implement policy-as-code with OPA'
            ],
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
    console.log(`✓ Created session: "${session1.title}"`);
    const session2 = await prisma.session.create({
        data: {
            title: 'Production ML Systems: From Jupyter to Production',
            description: 'Building reliable ML pipelines with monitoring, versioning, and ethical considerations. Learn how to deploy models at scale.',
            tags: ['Machine Learning', 'MLOps', 'Data Science', 'Ethics'],
            scheduledAt: new Date(Date.now() + 14 * 24 * 3600 * 1000),
            visibility: 'public',
            hostOrganisation: 'Global AI Labs',
            format: 'Hybrid',
            location: 'Innovation Center, Building 5',
            invites: {
                create: [
                    {
                        expert: { connect: { id: priya.id } }
                    }
                ]
            }
        }
    });
    console.log(`✓ Created session: "${session2.title}"`);
    const session3 = await prisma.session.create({
        data: {
            title: 'Building High-Performing Engineering Teams',
            description: 'Workshop on engineering culture, hiring practices, career development, and creating psychological safety in technical teams.',
            tags: ['Leadership', 'Engineering Culture', 'Team Building', 'Management'],
            scheduledAt: new Date(Date.now() + 21 * 24 * 3600 * 1000),
            visibility: 'private',
            hostOrganisation: 'TechScale Inc',
            summary: 'Discussed building inclusive teams, effective 1-on-1s, and creating growth opportunities for engineers.',
            outcomes: [
                'Implement structured career ladders',
                'Launch mentorship program',
                'Quarterly engineering culture surveys'
            ],
            format: 'In-Person',
            location: 'TechScale HQ',
            invites: {
                create: [
                    {
                        expert: { connect: { id: jordan.id } }
                    }
                ]
            }
        }
    });
    console.log(`✓ Created session: "${session3.title}"`);
    // Step 4: Create participant invites (demonstrates invite management)
    console.log('Creating participant invites...');
    const [invite1, invite2, invite3] = await prisma.$transaction([
        prisma.sessionParticipantInvite.create({
            data: {
                sessionId: session1.id,
                email: 'sarah.chen@example.com',
                name: 'Sarah Chen',
                status: 'accepted'
            }
        }),
        prisma.sessionParticipantInvite.create({
            data: {
                sessionId: session1.id,
                email: 'marcus.johnson@example.com',
                name: 'Marcus Johnson',
                status: 'pending'
            }
        }),
        prisma.sessionParticipantInvite.create({
            data: {
                sessionId: session2.id,
                email: 'liu.wei@example.com',
                name: 'Liu Wei',
                status: 'sent'
            }
        })
    ]);
    console.log(`✓ Created ${[invite1, invite2, invite3].length} participant invites`);
    // Step 5: Create session feedback (demonstrates feedback collection)
    console.log('Creating session feedback...');
    const [feedback1, feedback2, feedback3] = await prisma.$transaction([
        prisma.sessionFeedback.create({
            data: {
                sessionId: session1.id,
                authorName: 'Sarah Chen',
                authorEmail: 'sarah.chen@example.com',
                rating: 5,
                comment: 'Excellent deep dive into zero-trust architecture. The practical examples from multi-cloud deployments were invaluable. Looking forward to implementing these patterns in our infrastructure.'
            }
        }),
        prisma.sessionFeedback.create({
            data: {
                sessionId: session3.id,
                authorName: 'Anonymous',
                rating: 5,
                comment: 'Jordan\'s insights on building inclusive teams were transformative. The frameworks for career development and psychological safety are exactly what our organization needs.'
            }
        }),
        prisma.sessionFeedback.create({
            data: {
                sessionId: session1.id,
                authorName: 'Dev Team Lead',
                rating: 4,
                comment: 'Great session on security architecture. Would have loved more time for Q&A, but the content was comprehensive and well-presented.'
            }
        })
    ]);
    console.log(`✓ Created ${[feedback1, feedback2, feedback3].length} feedback entries`);
    // Summary
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`
📊 Summary:
   - Users: 3 (admin, editor, member)
   - Experts: 4 professionals
   - Sessions: 3 knowledge sessions
   - Invites: 3 participant invitations
   - Feedback: 3 session reviews
  `);
}
main()
    .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
