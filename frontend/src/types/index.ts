export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role: Role;
  status: UserStatus;
  avatar?: string | null;
  emailVerified: boolean;
  lastActivity?: string | null;
  lastOnline?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  notes?: string | null;
  status: LeadStatus;
  priority: Priority;
  assignedToId?: string | null;
  assignedTo?: { id: string; name: string; email: string; avatar?: string | null } | null;
  createdBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
  _count?: { activities: number };
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string | null };
  lead?: { id: string; fullName: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type?: string | null;
  link?: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalLeads: number;
    wonDeals: number;
    lostDeals: number;
    conversionRate: number;
    activeLeads: number;
  };
  leadsByStatus: Record<LeadStatus, number>;
  monthlyAnalytics: { month: string; leads: number; won: number; lost: number }[];
  recentActivities: Activity[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
