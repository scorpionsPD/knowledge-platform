import { randomUUID } from 'crypto';

import { Expert, Session } from '../types';

const now = new Date().toISOString();

const experts: Expert[] = [
  {
    id: randomUUID(),
    name: 'Alex Rivera',
    title: 'Principal Engineer',
    expertise: ['Architecture', 'Security', 'Platform'],
    contactEmail: 'alex.rivera@example.com',
    organisation: 'Acme Corp'
  },
  {
    id: randomUUID(),
    name: 'Priya Nair',
    title: 'Staff Mobile Engineer',
    expertise: ['Mobile', 'AI'],
    contactEmail: 'priya.nair@example.com',
    organisation: 'Global Apps'
  }
];

const sessions: Session[] = [
  {
    id: randomUUID(),
    title: 'Zero Trust in Hybrid Clouds',
    description: 'Designing secure access for multi-cloud environments.',
    tags: ['Security', 'Architecture'],
    scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    visibility: 'private',
    invitedExperts: [experts[0].id],
    hostOrganisation: 'Acme Corp',
    summary: 'Explored patterns for conditional access and observability.',
    outcomes: ['Pilot network segmentation in Q1', 'Adopt OIDC for service auth'],
    format: 'Virtual',
    location: 'Zoom',
    createdAt: now,
    updatedAt: now
  },
  {
    id: randomUUID(),
    title: 'AI Safety for Mobile Clients',
    description: 'Mitigating prompt injection and misuse in on-device models.',
    tags: ['AI', 'Mobile'],
    scheduledAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    visibility: 'public',
    invitedExperts: [experts[1].id],
    hostOrganisation: 'Global Apps',
    format: 'Hybrid',
    location: 'HQ Auditorium',
    createdAt: now,
    updatedAt: now
  }
];

export function listSessions(): Session[] {
  return sessions;
}

export function getSession(id: string): Session | undefined {
  return sessions.find((s) => s.id === id);
}

export function addSession(input: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Session {
  const newSession: Session = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  sessions.push(newSession);
  return newSession;
}

export function updateSession(
  id: string,
  input: Partial<Omit<Session, 'id' | 'createdAt'>>
): Session | undefined {
  const session = getSession(id);
  if (!session) return undefined;
  const updated: Session = {
    ...session,
    ...input,
    updatedAt: new Date().toISOString()
  };
  const idx = sessions.findIndex((s) => s.id === id);
  sessions[idx] = updated;
  return updated;
}

export function listExperts(): Expert[] {
  return experts;
}

export function getExpert(id: string): Expert | undefined {
  return experts.find((e) => e.id === id);
}

export function addExpert(input: Omit<Expert, 'id'>): Expert {
  const newExpert: Expert = { ...input, id: randomUUID() };
  experts.push(newExpert);
  return newExpert;
}

export function upsertExpert(id: string, input: Partial<Expert>): Expert {
  const existing = getExpert(id);
  if (!existing) {
    const created = { id, ...input } as Expert;
    experts.push(created);
    return created;
  }
  const updated: Expert = { ...existing, ...input };
  const idx = experts.findIndex((e) => e.id === id);
  experts[idx] = updated;
  return updated;
}
