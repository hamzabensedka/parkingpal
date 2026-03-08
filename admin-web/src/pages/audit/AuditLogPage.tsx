import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin.api';
import { Search, ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import type { AuditLog } from '@/types';

const ACTION_TYPES = [
  'LOGIN', 'APPROVE_DOCUMENT', 'REJECT_DOCUMENT', 'APPROVE_USER_ID', 'REJECT_USER_ID',
  'CREATE_USER', 'UPDATE_USER', 'SUSPEND_USER', 'UNSUSPEND_USER',
  'APPROVE_SPOT', 'REJECT_SPOT', 'UPDATE_SPOT',
  'RESOLVE_REPORT', 'DISMISS_REPORT',
  'CREATE_ADMIN', 'UPDATE_ADMIN_ROLE', 'REMOVE_ADMIN',
];

const ENTITY_TYPES = [
  'User', 'Spot', 'SpotDocument', 'UserReport', 'Booking',
];

export function AuditLogPage() {
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', offset, actionFilter, entityTypeFilter],
    queryFn: () =>
      adminApi.getAuditLogs({
        limit,
        offset,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
      }),
  });

  const logs: AuditLog[] = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const actionColor = (action: string) => {
    if (action.startsWith('APPROVE')) return 'bg-green-100 text-green-800';
    if (action.startsWith('REJECT') || action.startsWith('SUSPEND') || action === 'REMOVE_ADMIN')
      return 'bg-red-100 text-red-800';
    if (action.startsWith('CREATE')) return 'bg-blue-100 text-blue-800';
    if (action.startsWith('UPDATE')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Track all admin actions on the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === 'all' ? '' : v); setOffset(0); }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityTypeFilter} onValueChange={(v) => { setEntityTypeFilter(v === 'all' ? '' : v); setOffset(0); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {ENTITY_TYPES.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{total} entries</Badge>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <ScrollText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : log.adminId.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColor(log.action)}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.entityType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {log.newValue ? JSON.stringify(log.newValue).slice(0, 60) : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {total > 0 ? offset + 1 : 0}-{Math.min(offset + limit, total)} of {total}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={offset + logs.length >= total} onClick={() => setOffset(offset + limit)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
