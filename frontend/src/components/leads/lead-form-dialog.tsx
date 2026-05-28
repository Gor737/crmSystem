'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import type { Lead, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LEAD_STATUSES, PRIORITIES } from '@/lib/constants';

const schema = z.object({
  fullName: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedToId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSuccess: () => void;
}

export function LeadFormDialog({ open, onOpenChange, lead, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      api.get('/users?limit=100').then((res) => setUsers(res.data.data.users)).catch(() => {});
      if (lead) {
        reset({
          fullName: lead.fullName,
          company: lead.company || '',
          email: lead.email || '',
          phone: lead.phone || '',
          source: lead.source || '',
          notes: lead.notes || '',
          status: lead.status,
          priority: lead.priority,
          assignedToId: lead.assignedToId || '',
        });
      } else {
        reset({ status: 'NEW', priority: 'MEDIUM' });
      }
    }
  }, [open, lead, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (lead) {
        await api.put(`/leads/${lead.id}`, data);
        toast.success('Lead updated');
      } else {
        await api.post('/leads', data);
        toast.success('Lead created');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{lead ? 'Edit Lead' : 'Create Lead'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input {...register('company')} />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input {...register('source')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select {...register('status')}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select {...register('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>
          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select {...register('assignedToId')}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('notes')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
