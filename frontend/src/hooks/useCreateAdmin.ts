import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, CreateAdminData } from '@/apis/auth';
import { toast } from 'sonner';

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminData) => authApi.createAdmin(data),
    onSuccess: () => {
      toast.success('Admin user created successfully');
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create admin user');
    },
  });
};
