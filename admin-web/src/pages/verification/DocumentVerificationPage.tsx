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
import { Check, X, ExternalLink, FileText } from 'lucide-react';
import type { SpotDocument } from '@/types';

export function DocumentVerificationPage() {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<SpotDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-documents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/documents', { params: { status: 'PENDING', limit: 50, offset: 0 } });
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyDocument(id, 'APPROVED'),
    onSuccess: () => {
      toast.success('Document approved');
      queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
    },
    onError: () => toast.error('Failed to approve document'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.verifyDocument(id, 'REJECTED', reason),
    onSuccess: () => {
      toast.success('Document rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedDoc(null);
      queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
    },
    onError: () => toast.error('Failed to reject document'),
  });

  const documents: SpotDocument[] = data?.data?.documents ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
        <p className="text-muted-foreground">
          Review and approve/reject spot ownership documents.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No pending documents</p>
            <p className="text-sm text-muted-foreground/70">All documents have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{doc.type.replace(/_/g, ' ')}</CardTitle>
                  <Badge variant="outline">PENDING</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.spot && (
                  <div className="text-sm">
                    <p className="font-medium">{doc.spot.title}</p>
                    <p className="text-muted-foreground">{doc.spot.address}</p>
                    <p className="text-xs text-muted-foreground">
                      Host: {doc.spot.host.firstName} {doc.spot.host.lastName} ({doc.spot.host.email})
                    </p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Document
                  </a>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(doc.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setRejectDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this document. This will be visible to the host.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDoc && rejectMutation.mutate({ id: selectedDoc.id, reason: rejectReason })
              }
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
