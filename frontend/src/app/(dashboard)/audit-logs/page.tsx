'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dashboard/audit-logs?page=${page}&limit=20`)
      .then((res) => {
        setLogs(res.data.data.logs);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Audit Logs</h2>
        <p className="text-muted-foreground">System activity and security events</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-primary">{log.action}</span> on {log.entity}
                      {log.entityId && <span className="text-muted-foreground"> ({log.entityId.slice(0, 8)}...)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.name || 'System'} · {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
