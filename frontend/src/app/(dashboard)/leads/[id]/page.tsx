'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import type { Lead } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusLabel } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/leads/${id}`)
      .then((res) => setLead(res.data.data))
      .catch((e) => { toast.error(getErrorMessage(e)); router.push('/leads'); })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <Skeleton className="h-96" />;
  if (!lead) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{lead.fullName}</h2>
          <p className="text-muted-foreground">{lead.company}</p>
        </div>
        <Badge variant="secondary">{getStatusLabel(lead.status)}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Email:</span> {lead.email || '-'}</p>
            <p><span className="text-muted-foreground">Phone:</span> {lead.phone || '-'}</p>
            <p><span className="text-muted-foreground">Source:</span> {lead.source || '-'}</p>
            <p><span className="text-muted-foreground">Priority:</span> {lead.priority}</p>
            <p><span className="text-muted-foreground">Assigned:</span> {lead.assignedTo?.name || '-'}</p>
            <p><span className="text-muted-foreground">Created:</span> {formatDateTime(lead.createdAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes || 'No notes'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lead.activities?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              lead.activities?.map((a) => (
                <div key={a.id} className="flex gap-3 border-b pb-3 last:border-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {a.user?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
