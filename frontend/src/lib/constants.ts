import type { LeadStatus } from '@/types';

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'NEW', label: 'New', color: 'bg-blue-500' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-cyan-500' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-indigo-500' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-purple-500' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'WON', label: 'Won', color: 'bg-green-500' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-500' },
];

export const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

export const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
] as const;

export const USER_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export function getStatusLabel(status: LeadStatus) {
  return LEAD_STATUSES.find((s) => s.value === status)?.label || status;
}

export function getStatusColor(status: LeadStatus) {
  return LEAD_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-500';
}
