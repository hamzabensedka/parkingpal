import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { DocumentVerificationPage } from '@/pages/verification/DocumentVerificationPage';
import { IDVerificationPage } from '@/pages/verification/IDVerificationPage';
import { SpotApprovalPage } from '@/pages/verification/SpotApprovalPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { CreateUserPage } from '@/pages/users/CreateUserPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { EntitiesPage } from '@/pages/entities/EntitiesPage';
import { EntityEditPage } from '@/pages/entities/EntityEditPage';
import { AdminManagementPage } from '@/pages/admins/AdminManagementPage';
import { AuditLogPage } from '@/pages/audit/AuditLogPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        {/* Verification */}
        <Route path="/verification/documents" element={<DocumentVerificationPage />} />
        <Route path="/verification/ids" element={<IDVerificationPage />} />
        <Route path="/verification/spots" element={<SpotApprovalPage />} />

        {/* Users */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/create" element={<CreateUserPage />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Entities (Universal CRUD) */}
        <Route path="/entities" element={<EntitiesPage />} />
        <Route path="/entities/:model/:id" element={<EntityEditPage />} />

        {/* Admin Management */}
        <Route path="/admins" element={<AdminManagementPage />} />

        {/* Audit Log */}
        <Route path="/audit" element={<AuditLogPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
