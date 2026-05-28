'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', phone: '', company: '' },
  });

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setUser(res.data.data);
      reset({
        name: res.data.data.name,
        phone: res.data.data.phone || '',
        company: res.data.data.company || '',
      });
    });
  }, [reset, setUser]);

  const onSubmit = async (data: { name: string; phone: string; company: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, data);
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const avatarUrl = user?.avatar ? `${apiBase}${user.avatar}` : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-3xl font-bold">Profile</h2>

      <Card>
        <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>Upload Avatar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input {...register('company')} />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Role: {user?.role}</p>
              <p>Status: {user?.status}</p>
              {user?.lastActivity && <p>Last activity: {formatDateTime(user.lastActivity)}</p>}
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
