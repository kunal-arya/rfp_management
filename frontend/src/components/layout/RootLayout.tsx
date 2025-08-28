import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from './Layout';
import LandingPage from '@/pages/LandingPage';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // If user is not authenticated, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // If user is authenticated, show the app with layout
  return <Layout>{children}</Layout>;
};
