import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/apis/auth';
import { useAuth } from '@/contexts/AuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      try {
        // Call server-side logout to create audit trail
        const result = await authApi.logout();
        
        // Clear local storage
        authApi.clearLocalStorage();
        
        // Update auth context
        authLogout();
        
        return result;
      } catch (error: any) {
        // Even if server logout fails, clear local storage
        authApi.clearLocalStorage();
        authLogout();
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Logged out successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      // Show error but still redirect to login
      toast.error(error.response?.data?.message || 'Logout completed');
      navigate('/login');
    },
  });
};
