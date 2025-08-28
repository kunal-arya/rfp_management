import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from './Layout';
import LandingPage from '@/pages/LandingPage';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // If user is not authenticated, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // If user is authenticated, show the app with layout
  return <Layout>{children}</Layout>;
};
