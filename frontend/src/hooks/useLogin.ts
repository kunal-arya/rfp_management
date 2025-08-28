import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginData } from '@/apis/auth';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role_id: response.user.role_id,
        role: response.user.role,
      };

      login(user, response.permissions, response.token);
      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
