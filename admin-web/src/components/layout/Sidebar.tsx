import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  IdCard,
  MapPin,
  Users,
  UserPlus,
  AlertTriangle,
  Database,
  Shield,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Spot Documents',
    href: '/verification/documents',
    icon: FileCheck,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'User IDs',
    href: '/verification/ids',
    icon: IdCard,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'Spot Approvals',
    href: '/verification/spots',
    icon: MapPin,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'Create User',
    href: '/users/create',
    icon: UserPlus,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: AlertTriangle,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'All Entities',
    href: '/entities',
    icon: Database,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Manage Admins',
    href: '/admins',
    icon: Shield,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: ScrollText,
    roles: ['SUPER_ADMIN'],
  },
];

export function Sidebar() {
  const { admin, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return admin?.adminRole && item.roles.includes(admin.adminRole);
  });

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">
            ParkingPal
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70',
                    collapsed && 'justify-center px-2'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-2">
        {!collapsed && admin && (
          <div className="mb-2 px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground">
              {admin.firstName} {admin.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{admin.adminRole}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
