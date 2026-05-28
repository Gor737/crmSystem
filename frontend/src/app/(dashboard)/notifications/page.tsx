'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import type { Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('All marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-50" />
            <p>No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card key={n.id} className={!n.read ? 'border-primary/50 bg-primary/5' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{n.title}</CardTitle>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>Mark read</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-2">{formatDateTime(n.createdAt)}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
