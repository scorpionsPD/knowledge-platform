export interface Session {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  visibility: 'public' | 'private';
  tags: string[];
  outcomes: string[];
  hostOrganisation: string;
  summary?: string;
  format?: string;
  location?: string;
  invitedExperts: Expert[];
  createdAt: string;
  updatedAt: string;
}

export interface Expert {
  id: string;
  name: string;
  expertise: string[];
  organisation: string;
  contactEmail: string;
  linkedInProfile?: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string | null;
  roles: string[];
}

export interface Feedback {
  id: string;
  sessionId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: User;
}
