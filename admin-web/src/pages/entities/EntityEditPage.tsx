import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

// Fields that should never be edited
const READ_ONLY_FIELDS = new Set([
  'id', 'createdAt', 'updatedAt',
  // Foreign keys
  'userId', 'spotId', 'hostId', 'renterId', 'bookingId', 'vehicleId',
  'reporterId', 'reportedId', 'blockerId', 'blockedId', 'conversationId',
  'senderId', 'receiverId', 'reviewerId', 'revieweeId', 'adminId',
  // Sensitive
  'password', 'refreshToken', 'emailVerificationToken', 'emailVerificationExpires',
  'phoneVerificationCode', 'phoneVerificationExpires', 'passwordResetToken',
  'passwordResetExpires',
  // Stripe
  'stripePaymentIntentId', 'stripeTransferId', 'stripeCustomerId',
  'stripeConnectAccountId', 'stripeEventId',
]);

export function EntityEditPage() {
  const { model, id } = useParams<{ model: string; id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['entity', model, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/entities/${model}/${id}`);
      return data.data;
    },
    enabled: !!model && !!id,
  });

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Only send changed, editable fields
      const updates: Record<string, unknown> = {};
      if (data) {
        for (const [key, value] of Object.entries(formData)) {
          if (!READ_ONLY_FIELDS.has(key) && JSON.stringify(value) !== JSON.stringify(data[key])) {
            updates[key] = value;
          }
        }
      }
      const { data: result } = await apiClient.patch(`/entities/${model}/${id}`, { updates });
      return result;
    },
    onSuccess: () => {
      toast.success('Record updated successfully');
      queryClient.invalidateQueries({ queryKey: ['entity', model, id] });
      queryClient.invalidateQueries({ queryKey: ['entities', model] });
    },
    onError: () => toast.error('Failed to update record'),
  });

  const renderField = (key: string, value: unknown) => {
    const isReadOnly = READ_ONLY_FIELDS.has(key);

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox
            id={key}
            checked={formData[key] as boolean}
            onCheckedChange={(checked) =>
              !isReadOnly && setFormData({ ...formData, [key]: checked === true })
            }
            disabled={isReadOnly}
          />
          <Label htmlFor={key} className={isReadOnly ? 'text-muted-foreground' : ''}>
            {key}
            {isReadOnly && <Badge variant="outline" className="ml-2 text-xs">read-only</Badge>}
          </Label>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="space-y-1">
          <Label className="text-muted-foreground">
            {key} <Badge variant="outline" className="text-xs">JSON</Badge>
          </Label>
          <pre className="rounded bg-muted p-2 text-xs overflow-auto max-h-32">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-1">
        <Label htmlFor={key} className={isReadOnly ? 'text-muted-foreground' : ''}>
          {key}
          {isReadOnly && <Badge variant="outline" className="ml-2 text-xs">read-only</Badge>}
        </Label>
        <Input
          id={key}
          value={formData[key] == null ? '' : String(formData[key])}
          onChange={(e) => !isReadOnly && setFormData({ ...formData, [key]: e.target.value })}
          disabled={isReadOnly}
          className={isReadOnly ? 'bg-muted' : ''}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const fields = data ? Object.entries(data) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {model}
          </h1>
          <p className="text-sm text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(([key, value]) => renderField(key, value))}

          <div className="flex gap-2 pt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
