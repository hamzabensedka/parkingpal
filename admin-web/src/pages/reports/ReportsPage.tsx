import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api/client';
import { adminApi } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { UserReport } from '@/types';

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [actionTaken, setActionTaken] = useState('NO_ACTION');
  const [shouldSuspend, setShouldSuspend] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/entities/UserReport', {
        params: { limit: 50, offset: 0, status: 'PENDING' },
      });
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      adminApi.resolveReport(selectedReport!.id, {
        resolution,
        actionTaken,
        suspendUser: shouldSuspend,
        suspensionReason: shouldSuspend ? suspensionReason : undefined,
      }),
    onSuccess: () => {
      toast.success('Report resolved');
      setResolveDialogOpen(false);
      setResolution('');
      setActionTaken('NO_ACTION');
      setShouldSuspend(false);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => toast.error('Failed to resolve report'),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => adminApi.dismissReport(id),
    onSuccess: () => {
      toast.success('Report dismissed');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => toast.error('Failed to dismiss report'),
  });

  const reports: UserReport[] = data?.data ?? [];

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'DISMISSED': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Review and moderate user reports.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No pending reports</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Report: {report.reason.replace(/_/g, ' ')}
                  </CardTitle>
                  <Badge className={statusColor(report.status)}>{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reporter:</span> {report.reporterId}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reported:</span> {report.reportedId}
                  </div>
                </div>
                {report.description && (
                  <p className="text-sm">{report.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(report.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => { setSelectedReport(report); setResolveDialogOpen(true); }}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissMutation.mutate(report.id)}
                    disabled={dismissMutation.isPending}
                  >
                    <XCircle className="mr-1 h-3 w-3" /> Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action Taken</Label>
              <Select value={actionTaken} onValueChange={setActionTaken}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_ACTION">No Action</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="SUSPENSION">Suspension</SelectItem>
                  <SelectItem value="BAN">Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe the resolution (min 10 characters)..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="suspend"
                checked={shouldSuspend}
                onCheckedChange={(checked) => setShouldSuspend(checked === true)}
              />
              <Label htmlFor="suspend">Also suspend reported user</Label>
            </div>
            {shouldSuspend && (
              <Textarea
                placeholder="Suspension reason..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={2}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => resolveMutation.mutate()}
              disabled={resolution.length < 10 || resolveMutation.isPending}
            >
              Resolve Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
