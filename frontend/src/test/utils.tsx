import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient(),
}: { 
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {}
) => {
  const client = queryClient || createTestQueryClient();
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={client}>
        {children}
      </AllTheProviders>
    ),
    ...options,
  });
};

// Mock user data for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: {
    id: '1',
    name: 'Buyer',
    permissions: {
      dashboard: { view: { allowed: true } },
      rfp: {
        create: { allowed: true },
        view: { allowed: true, scope: 'own' },
        edit: { allowed: true, scope: 'own' },
      },
    },
  },
};

export const mockRfp = {
  id: '1',
  title: 'Test RFP',
  description: 'Test description',
  requirements: 'Test requirements',
  budget_min: 1000,
  budget_max: 5000,
  deadline: '2024-12-31T23:59:59Z',
  notes: 'Test notes',
  status: 'Draft',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  buyer_id: '1',
  buyer: mockUser,
};

export const mockResponse = {
  id: '1',
  rfp_id: '1',
  supplier_id: '2',
  status: 'Draft',
  proposed_budget: 3000,
  timeline: '2 weeks',
  cover_letter: 'Test cover letter',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  rfp: mockRfp,
  supplier: {
    id: '2',
    email: 'supplier@example.com',
    role: { id: '2', name: 'Supplier' },
  },
};

// re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };
