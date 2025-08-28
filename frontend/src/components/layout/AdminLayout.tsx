import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  LogOut,
  Menu,
  X,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';
import { NotificationBell } from '@/components/shared/NotificationBell';

const AdminLayout: React.FC = () => {
  const { user, permissionHelpers } = useAuth();
  const location = useLocation();
  const logoutMutation = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation configuration
  const navigationConfig = {
    dashboard: { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, permission: 'admin' },
    users: { name: 'User Management', href: '/admin/users', icon: Users, permission: 'admin' },
    analytics: { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'admin' },
    audit: { name: 'Audit Logs', href: '/admin/audit', icon: Shield, permission: 'admin' },
    rfps: { name: 'RFP Management', href: '/admin/rfps', icon: FileText, permission: 'admin' },
    responses: { name: 'Response Management', href: '/admin/responses', icon: MessageSquare, permission: 'admin' },
    permissions: { name: 'Permissions', href: '/admin/permissions', icon: Key, permission: 'admin' },
    config: { name: 'System Config', href: '/admin/config', icon: Settings, permission: 'admin' },
    database: { name: 'Database', href: '/admin/database', icon: Database, permission: 'admin' }
  };

  // Get allowed pages from permissions
  const allowedPages = permissionHelpers.getNavbarPages();
  
  // Build navigation based on allowed pages
  const navigation = allowedPages
    .map(page => navigationConfig[page as keyof typeof navigationConfig])
    .filter(Boolean);

  console.log('Allowed pages:', allowedPages);
  console.log('Navigation:', navigation);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#00000050] z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending && (
                <span className="ml-2 text-xs">Logging out...</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar with hamburger */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden mr-3"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome back,</span>
                <span className="font-medium text-gray-900">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
