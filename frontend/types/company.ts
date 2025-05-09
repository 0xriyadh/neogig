export type Industry = 'TECH' | 'AGRI' | 'HEALTH' | 'FINANCE' | 'EDUCATION' | 'OTHER';

export interface Company {
  userId: string;
  name: string;
  location?: string | null;
  phone?: string | null;
  industry?: Industry | null;
  description?: string | null;
  registrationDate?: string | null;
  createdAt: string;
  updatedAt: string;
} 