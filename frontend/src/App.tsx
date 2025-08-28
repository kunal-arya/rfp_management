import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Toaster } from 'sonner';
import { RootLayout } from './components/layout/RootLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateRfpPage } from './pages/rfp/CreateRfpPage';
import { EditRfpPage } from './pages/rfp/EditRfpPage';
import { MyRfpsPage } from './pages/rfp/MyRfpsPage';
import { BrowseRfpsPage } from './pages/rfp/BrowseRfpsPage';
import { CreateResponsePage } from './pages/response/CreateResponsePage';
import { MyResponsesPage } from './pages/response/MyResponsesPage';
import { RfpResponsesPage } from './pages/response/RfpResponsesPage';
import { RfpDetailPage } from './pages/rfp/RfpDetailPage';
import { ResponseDetailPage } from './pages/response/ResponseDetailPage';
import { AuditTrailPage } from './pages/audit/AuditTrailPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import RfpManagementPage from './pages/admin/RfpManagementPage';
import ResponseManagementPage from './pages/admin/ResponseManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import NotificationManagementPage from './pages/admin/NotificationManagementPage';
import DocumentManagementPage from './pages/admin/DocumentManagementPage';
import SupportPage from './pages/admin/SupportPage';
import SystemConfigPage from './pages/admin/SystemConfigPage';
import { PermissionManagementPage } from './pages/admin/PermissionManagementPage';
import { RoleBasedRedirect } from './components/layout/RoleBasedRedirect';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes - wrapped in RootLayout */}
              <Route path="/*" element={
                <RootLayout>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<DashboardPage />}
                    />
                    
                    {/* RFP routes */}
                    <Route 
                      path="/rfps/create" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'create' }}>
                          <CreateRfpPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/rfps/my" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                          <MyRfpsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/rfps/browse" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                          <BrowseRfpsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/rfps/:rfpId/edit" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'edit' }}>
                          <EditRfpPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/rfps/:rfpId" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'rfp', action: 'view' }}>
                          <RfpDetailPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Response routes */}
                    <Route 
                      path="/responses/create" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'create' }}>
                          <CreateResponsePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/responses/create/:rfpId" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'create' }}>
                          <CreateResponsePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/responses/my" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                          <MyResponsesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/rfps/:rfpId/responses" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                          <RfpResponsesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/responses/:responseId" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'supplier_response', action: 'view' }}>
                          <ResponseDetailPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Audit Trail routes */}
                    <Route 
                      path="/audit" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'audit', action: 'view' }}>
                          <AuditTrailPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredPermission={{ resource: 'admin', action: 'view_analytics' }}>
                          <AdminLayout />
                        </ProtectedRoute>
                      } 
                    >
                      <Route path="" element={<AdminDashboardPage />} />
                      <Route path="users" element={<UserManagementPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="audit" element={<AuditLogsPage />} />
                      <Route path="rfps" element={<RfpManagementPage />} />
                      <Route path="responses" element={<ResponseManagementPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="notifications" element={<NotificationManagementPage />} />
                      <Route path="documents" element={<DocumentManagementPage />} />
                      <Route path="support" element={<SupportPage />} />
                      <Route path="settings" element={<SystemConfigPage />} />
                      <Route path="permissions" element={<PermissionManagementPage />} />
                    </Route>
                    
                    {/* Redirect root based on role */}
                    <Route path="/" element={<RoleBasedRedirect />} />
                    
                    {/* Catch all - redirect based on role */}
                    <Route path="*" element={<RoleBasedRedirect />} />
                  </Routes>
                </RootLayout>
              } />
            </Routes>
          </Router>
          <Toaster richColors position="top-right" />
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
