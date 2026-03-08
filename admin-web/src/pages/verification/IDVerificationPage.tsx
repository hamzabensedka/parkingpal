import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { adminApi } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import { Check, X, ExternalLink, IdCard } from 'lucide-react';
import type { User } from '@/types';

export function IDVerificationPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-id-verifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/pending-id', { params: { limit: 50, offset: 0 } });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyUserId(id, true),
    onSuccess: () => {
      toast.success('User ID verified');
      queryClient.invalidateQueries({ queryKey: ['pending-id-verifications'] });
    },
    onError: () => toast.error('Failed to verify user ID'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.verifyUserId(id, false, reason),
    onSuccess: () => {
      toast.success('User ID rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['pending-id-verifications'] });
    },
    onError: () => toast.error('Failed to reject user ID'),
  });

  const users: User[] = data?.data?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ID Verification</h1>
        <p className="text-muted-foreground">
          Review and verify user identity documents.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IdCard className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No pending ID verifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <Badge variant="outline">PENDING</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{user.email}</p>
                  <p>Type: {user.userType}</p>
                </div>
                {user.idDocument && (
                  <a
                    href={user.idDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View ID Document
                  </a>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <Check className="mr-1 h-3 w-3" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setSelectedUser(user); setRejectDialogOpen(true); }}
                    className="flex-1"
                  >
                    <X className="mr-1 h-3 w-3" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject ID Document</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && rejectMutation.mutate({ id: selectedUser.id, reason: rejectReason })}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
