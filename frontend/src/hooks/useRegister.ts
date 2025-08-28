import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, RegisterData } from '@/apis/auth';
import { useAuth } from '@/contexts/AuthContext';

export const useRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      const user = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role_id: response.user.role_id,
        role: response.user.role,
      };

      login(user, response.permissions, response.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};
