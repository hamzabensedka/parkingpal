import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { apiClient } from '@/lib/api/client';
import { Search, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MODELS = [
  'User',
  'Vehicle',
  'PaymentMethod',
  'Spot',
  'SpotPhoto',
  'SpotDocument',
  'SpotAvailability',
  'Booking',
  'Review',
  'Conversation',
  'Message',
  'Notification',
  'UserReport',
  'UserBlock',
];

// Fields to show in table per model
const MODEL_COLUMNS: Record<string, string[]> = {
  User: ['id', 'email', 'firstName', 'lastName', 'userType', 'isActive', 'createdAt'],
  Vehicle: ['id', 'userId', 'make', 'model', 'licensePlate', 'type'],
  PaymentMethod: ['id', 'userId', 'type', 'last4', 'brand', 'isDefault'],
  Spot: ['id', 'hostId', 'title', 'city', 'status', 'hourlyRate', 'rating'],
  SpotPhoto: ['id', 'spotId', 'url', 'isPrimary', 'sortOrder'],
  SpotDocument: ['id', 'spotId', 'type', 'status', 'reviewedBy', 'createdAt'],
  SpotAvailability: ['id', 'spotId', 'dayOfWeek', 'startTime', 'endTime', 'isAllDay'],
  Booking: ['id', 'renterId', 'spotId', 'status', 'totalPrice', 'paymentStatus', 'startTime'],
  Review: ['id', 'bookingId', 'reviewerId', 'rating', 'comment', 'createdAt'],
  Conversation: ['id', 'bookingId', 'createdAt'],
  Message: ['id', 'conversationId', 'senderId', 'text', 'read', 'createdAt'],
  Notification: ['id', 'userId', 'type', 'title', 'read', 'createdAt'],
  UserReport: ['id', 'reporterId', 'reportedId', 'reason', 'status', 'createdAt'],
  UserBlock: ['id', 'blockerId', 'blockedId', 'createdAt'],
};

export function EntitiesPage() {
  const [selectedModel, setSelectedModel] = useState('User');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['entities', selectedModel, offset, search],
    queryFn: async () => {
      const { data } = await apiClient.get(`/entities/${selectedModel}`, {
        params: { limit, offset, search },
      });
      return data;
    },
  });

  const records = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const columns = MODEL_COLUMNS[selectedModel] ?? ['id'];

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50);
    const str = String(value);
    return str.length > 40 ? str.slice(0, 40) + '...' : str;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Entities</h1>
        <p className="text-muted-foreground">Browse and manage all database records.</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select
          value={selectedModel}
          onValueChange={(v) => { setSelectedModel(v); setOffset(0); setSearch(''); }}
        >
          <SelectTrigger className="w-48">
            <Database className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="pl-9"
          />
        </div>
        <Badge variant="outline">{total} records</Badge>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
              ))}
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record: Record<string, unknown>) => (
                <TableRow key={String(record.id)}>
                  {columns.map((col) => (
                    <TableCell key={col} className="max-w-[200px] truncate text-sm">
                      {formatValue(record[col])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/entities/${selectedModel}/${record.id}`)}
                    >
                      Edit
                    </Button>
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
          <Button variant="outline" size="sm" disabled={offset + records.length >= total} onClick={() => setOffset(offset + limit)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
