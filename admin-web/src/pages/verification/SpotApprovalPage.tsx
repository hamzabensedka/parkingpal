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
import { Check, X, MapPin } from 'lucide-react';
import type { Spot } from '@/types';

export function SpotApprovalPage() {
  const queryClient = useQueryClient();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-spots'],
    queryFn: async () => {
      const { data } = await apiClient.get('/spots/pending', { params: { limit: 50, offset: 0 } });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.updateSpotStatus(id, 'ACTIVE'),
    onSuccess: () => {
      toast.success('Spot approved');
      queryClient.invalidateQueries({ queryKey: ['pending-spots'] });
    },
    onError: () => toast.error('Failed to approve spot'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.updateSpotStatus(id, 'REJECTED', reason),
    onSuccess: () => {
      toast.success('Spot rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['pending-spots'] });
    },
    onError: () => toast.error('Failed to reject spot'),
  });

  const spots: Spot[] = data?.data?.spots ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spot Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending spot listings.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : spots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No pending spot approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <Card key={spot.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{spot.title}</CardTitle>
                  <Badge variant="outline">{spot.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{spot.address}, {spot.city}</p>
                  <p>Rate: {spot.hourlyRate} EUR/hr</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => approveMutation.mutate(spot.id)} className="flex-1">
                    <Check className="mr-1 h-3 w-3" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setSelectedSpot(spot); setRejectDialogOpen(true); }}
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
          <DialogHeader><DialogTitle>Reject Spot</DialogTitle></DialogHeader>
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
              onClick={() => selectedSpot && rejectMutation.mutate({ id: selectedSpot.id, reason: rejectReason })}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject Spot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
