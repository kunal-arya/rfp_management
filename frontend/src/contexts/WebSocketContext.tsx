import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Connect to the WebSocket server
      const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3000', {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      // --- Notification Listeners ---
      newSocket.on('rfp_published', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`New RFP Published: ${data.title}`, {
          description: 'A new RFP is available for you to browse.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      newSocket.on('response_submitted', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.success(`New Response Submitted for ${data.rfp?.title || 'RFP'}`, {
          description: `A new response was submitted by ${data.supplier?.email || 'a supplier'}.`,
          action: {
            label: 'Review',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });
      
      newSocket.on('rfp_status_changed', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.warning(`RFP Status Updated: ${data.title || 'RFP'}`, {
          description: `The status of an RFP has been updated.`,
          action: {
            label: 'View RFP',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      // Response status change notifications
      newSocket.on('response_moved_to_review', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`Response Under Review: ${data.rfp?.title || 'RFP'}`, {
          description: `Your response is now being reviewed by the buyer.`,
          action: {
            label: 'View Response',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('response_approved', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.success(`Response Approved: ${data.rfp?.title || 'RFP'}`, {
          description: `Congratulations! Your response has been approved.`,
          action: {
            label: 'View Response',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('response_rejected', (notification) => {
        const data = notification.data;

        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        toast.error(`Response Rejected: ${data.rfp?.title || 'RFP'}`, {
          description: `Your response has been rejected. Check the details for more information.`,
          action: {
            label: 'View Response',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('response_reopened', (notification) => {
        const data = notification.data;

        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        toast.info(`Response Reopened: ${data.rfp?.title || 'RFP'}`, {
          description: `Your response has been reopened for editing. You can now make changes.`,
          action: {
            label: 'Edit Response',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('response_awarded', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.success(`🎉 Response Awarded: ${data.rfp?.title || 'RFP'}`, {
          description: `Congratulations! Your response has been awarded!`,
          action: {
            label: 'View Response',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('rfp_awarded', (notification) => {
        const data = notification.data;
        
        // Invalidate dashboard queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`RFP Awarded: ${data.title || 'RFP'}`, {
          description: `This RFP has been awarded to a supplier.`,
          action: {
            label: 'View RFP',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      // Additional real-time events for dashboard updates
      newSocket.on('rfp_created', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`New RFP Created: ${data.title}`, {
          description: 'A new RFP has been created.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      newSocket.on('rfp_updated', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`RFP Updated: ${data.title}`, {
          description: 'An RFP has been updated.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      newSocket.on('response_created', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        toast.info(`New Response Created`, {
          description: 'A new response has been created.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('response_draft_created', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        toast.info(`New Response Draft Created: ${data.rfp_title}`, {
          description: `A new response draft has been created by ${data.supplier_name}`,
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/responses/${data.response_id}`),
          },
        });
      });

      newSocket.on('response_updated', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`Response Updated`, {
          description: 'A response has been updated.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });

      newSocket.on('document_uploaded', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        
        toast.success(`Document Uploaded: ${data.file_name}`, {
          description: 'A new document has been uploaded.',
        });
      });

      newSocket.on('document_deleted', (notification) => {
        const data = notification.data;
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        
        toast.info(`Document Deleted: ${data.file_name}`, {
          description: 'A document has been deleted.',
        });
      });

      // Admin-specific notification listeners
      newSocket.on('user_created', (notification) => {
        const data = notification.data;
        
        // Invalidate admin queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        toast.info(`New User Created: ${data.email}`, {
          description: `A new user has been created with role ${data.role?.name || 'Unknown'}.`,
          action: {
            label: 'View Users',
            onClick: () => (window.location.href = '/admin/users'),
          },
        });
      });

      setSocket(newSocket);

      // Clean up the connection when the component unmounts or user logs out
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // If the user logs out, disconnect the existing socket
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user, token]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
