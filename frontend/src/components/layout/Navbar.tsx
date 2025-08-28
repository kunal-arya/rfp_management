import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Home, 
  Plus, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useLogout } from '@/hooks/useLogout';

export const Navbar: React.FC = () => {
  const { user, permissionHelpers } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoutMutation = useLogout();

  const isActive = (path: string) => location.pathname === path;

  // Navigation configuration
  const navigationConfig = {
    dashboard: { label: 'Dashboard', path: '/dashboard', icon: Home },
    my_rfps: { label: 'My RFPs', path: '/rfps/my', icon: FileText },
    create_rfp: { label: 'Create RFP', path: '/rfps/create', icon: Plus },
    browse_rfps: { label: 'Browse RFPs', path: '/rfps/browse', icon: Search },
    my_responses: { label: 'My Responses', path: '/responses/my', icon: MessageSquare },
    audit: { label: 'Audit Trail', path: '/audit', icon: Activity },
  };

  // Get allowed pages from permissions
  const allowedPages = permissionHelpers.getNavbarPages();
  
  // Build navigation based on allowed pages
  const navItems = allowedPages
    .map(page => navigationConfig[page as keyof typeof navigationConfig])
    .filter(Boolean)
    .map(item => ({
      ...item,
      permission: () => true, // All items in navbar permission are allowed
    }));

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2 shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RFPFlow
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems
              .filter(item => item.permission())
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems
                .filter(item => item.permission())
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
            
            {/* Mobile User Info */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <div className="px-3 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
