import apiClient from './client';
import { AuthResponse } from './types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  roleName: 'Buyer' | 'Supplier';
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Create admin user
  createAdmin: async (data: CreateAdminData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/create-admin', data);
    return response.data;
  },

  // Logout user (server-side with audit trail)
  logout: async (): Promise<{ message: string; logout_time: string }> => {
    const response = await apiClient.post<{ message: string; logout_time: string }>('/auth/logout');
    return response.data;
  },

  // Clear local storage (client-side cleanup)
  clearLocalStorage: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
