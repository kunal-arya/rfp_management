import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Only show navbar for authenticated users who are not admin
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Don't show navbar for admin users (they have their own sidebar)
  if (user?.role === 'Admin') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-8">
        {children}
      </main>
    </div>
  );
};
