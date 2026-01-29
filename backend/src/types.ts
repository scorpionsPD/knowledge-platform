export type Visibility = 'public' | 'private';

export interface Expert {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  expertise: string[];
  contactEmail?: string;
  organisation?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  tags: string[];
  scheduledAt: string;
  visibility: Visibility;
  invitedExperts: string[];
  hostOrganisation: string;
  summary?: string;
  outcomes?: string[];
  format?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}
