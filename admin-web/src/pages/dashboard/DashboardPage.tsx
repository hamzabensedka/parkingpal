import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth.store';
import {
  Users,
  MapPin,
  CalendarCheck,
  FileCheck,
  AlertTriangle,
  IdCard,
  UserPlus,
  Activity,
} from 'lucide-react';

export function DashboardPage() {
  const { admin } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats,
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Total Spots', value: stats?.totalSpots ?? 0, icon: MapPin, color: 'text-green-600' },
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: 'text-purple-600' },
    { label: 'Pending Documents', value: stats?.pendingDocuments ?? 0, icon: FileCheck, color: 'text-orange-600' },
    { label: 'Pending Reports', value: stats?.pendingReports ?? 0, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Pending ID Verifications', value: stats?.pendingIdVerifications ?? 0, icon: IdCard, color: 'text-yellow-600' },
    { label: 'Recent Signups (7d)', value: stats?.recentSignups ?? 0, icon: UserPlus, color: 'text-teal-600' },
    { label: 'Active Bookings', value: stats?.activeBookings ?? 0, icon: Activity, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {admin?.firstName}. Here's an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
