import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  console.log(user);
  
  // Redirect admin users to admin panel, others to dashboard
  if (user?.role === 'Admin') {
    return <Navigate to="/admin" />;
  }
  
  return <Navigate to="/dashboard" replace />;
};
