'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ROLES, USER_STATUSES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth.store';

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

const updateSchema = createSchema.omit({ password: true }).extend({
  password: z.string().min(8).optional().or(z.literal('')),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(user ? updateSchema : createSchema),
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          company: user.company || '',
          role: user.role,
          status: user.status,
          password: '',
        });
      } else {
        reset({ role: 'EMPLOYEE', status: 'ACTIVE' });
      }
    }
  }, [open, user, reset]);

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      if (user) {
        await api.put(`/users/${user.id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
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
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{user ? 'Edit User' : 'Create User'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label>{user ? 'New Password (optional)' : 'Password'}</Label>
            <Input type="password" {...register('password')} />
          </div>
          {isAdmin && (
            <>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select {...register('role')}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select {...register('status')}>
                  {USER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
