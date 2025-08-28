import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAllRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/useAdmin';
import { UserPermissions } from '@/types/permissions';
import { Loader2, Save, RotateCcw, Shield, Users, FileText, MessageSquare, Database, BarChart3, Settings, Key } from 'lucide-react';

interface PermissionSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  donot_show_in_admin?: boolean;
  permissions: {
    key: string;
    label: string;
    description: string;
    type: 'boolean' | 'object';
    subPermissions?: {
      key: string;
      label: string;
      description: string;
    }[];
  }[];
}

interface NavbarOption {
  key: string;
  label: string;
  description: string;
}

// Available navbar pages for each role
const navbarOptions: Record<string, NavbarOption[]> = {
  Buyer: [
    { key: 'dashboard', label: 'Dashboard', description: 'Main dashboard overview' },
    { key: 'my_rfps', label: 'My RFPs', description: 'View and manage owned RFPs' },
    { key: 'create_rfp', label: 'Create RFP', description: 'Create new RFPs' },
    { key: 'browse_rfps', label: 'Browse RFPs', description: 'Browse published RFPs' },
    { key: 'audit', label: 'Audit Trail', description: 'View audit logs' },
  ],
  Supplier: [
    { key: 'dashboard', label: 'Dashboard', description: 'Main dashboard overview' },
    { key: 'browse_rfps', label: 'Browse RFPs', description: 'Browse and respond to RFPs' },
    { key: 'my_responses', label: 'My Responses', description: 'View and manage responses' },
    { key: 'audit', label: 'Audit Trail', description: 'View audit logs' },
  ],
  Admin: [
    { key: 'dashboard', label: 'Dashboard', description: 'Admin dashboard' },
    { key: 'users', label: 'User Management', description: 'Manage users' },
    { key: 'analytics', label: 'Analytics', description: 'View analytics and reports' },
    { key: 'audit', label: 'Audit Logs', description: 'View audit logs' },
    { key: 'rfps', label: 'RFP Management', description: 'Manage RFPs' },
    { key: 'responses', label: 'Response Management', description: 'Manage responses' },
    { key: 'permissions', label: 'Permissions', description: 'Manage role permissions' },
  ]
};

const permissionSections: PermissionSection[] = [
  {
    title: 'RFP Management',
    description: 'Create, edit, and manage RFPs',
    icon: FileText,
    permissions: [
      {
        key: 'rfp.create.allowed',
        label: 'Create RFP',
        description: 'Create new RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.view.allowed',
        label: 'View RFP',
        description: 'View RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.edit.allowed',
        label: 'Edit RFP',
        description: 'Edit existing RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.publish.allowed',
        label: 'Publish RFP',
        description: 'Publish RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.close.allowed',
        label: 'Close RFP',
        description: 'Close RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.cancel.allowed',
        label: 'Cancel RFP',
        description: 'Cancel RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.award.allowed',
        label: 'Award RFP',
        description: 'Award RFPs to suppliers',
        type: 'boolean'
      },
      {
        key: 'rfp.review_responses.allowed',
        label: 'Review Responses',
        description: 'Review supplier responses',
        type: 'boolean'
      },
      {
        key: 'rfp.read_responses.allowed',
        label: 'Read Responses',
        description: 'Read supplier responses',
        type: 'boolean'
      },
      {
        key: 'rfp.manage_documents.allowed',
        label: 'Manage Documents',
        description: 'Manage RFP documents',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Supplier Responses',
    description: 'Manage supplier responses to RFPs',
    icon: MessageSquare,
    permissions: [
      {
        key: 'supplier_response.create.allowed',
        label: 'Create Response',
        description: 'Create responses to RFPs',
        type: 'boolean'
      },
      {
        key: 'supplier_response.submit.allowed',
        label: 'Submit Response',
        description: 'Submit responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.view.allowed',
        label: 'View Response',
        description: 'View responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.edit.allowed',
        label: 'Edit Response',
        description: 'Edit responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.manage_documents.allowed',
        label: 'Manage Documents',
        description: 'Manage response documents',
        type: 'boolean'
      },
      {
        key: 'supplier_response.review.allowed',
        label: 'Review Response',
        description: 'Review responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.approve.allowed',
        label: 'Approve Response',
        description: 'Approve responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.reject.allowed',
        label: 'Reject Response',
        description: 'Reject responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.award.allowed',
        label: 'Award Response',
        description: 'Award responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.reopen.allowed',
        label: 'Reopen Response',
        description: 'Reopen rejected responses for editing',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Documents',
    description: 'Upload and manage documents',
    icon: Database,
    permissions: [
      {
        key: 'documents.upload_for_rfp.allowed',
        label: 'Upload for RFP',
        description: 'Upload documents for RFPs',
        type: 'boolean'
      },
      {
        key: 'documents.upload_for_response.allowed',
        label: 'Upload for Response',
        description: 'Upload documents for responses',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Audit',
    description: 'View audit logs',
    icon: Shield,
    permissions: [
      {
        key: 'audit.view.allowed',
        label: 'View Audit Logs',
        description: 'View audit trail',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Admin',
    description: 'Administrative functions',
    icon: Users,
    permissions: [
      {
        key: 'admin.manage_users',
        label: 'Manage Users',
        description: 'Create, edit, and manage users',
        type: 'boolean'
      },
      {
        key: 'admin.manage_roles',
        label: 'Manage Roles',
        description: 'Manage role permissions',
        type: 'boolean'
      },
      {
        key: 'admin.view_analytics',
        label: 'View Analytics',
        description: 'Access analytics and reports',
        type: 'boolean'
      },

    ]
  },
  {
    title: 'Navigation',
    description: 'Control which pages appear in the navigation menu',
    icon: Key,
    donot_show_in_admin: true,
    permissions: [
      {
        key: 'navbar',
        label: 'Navbar Pages',
        description: 'Select which pages to show in navigation',
        type: 'object'
      }
    ]
  }
];

export const PermissionManagementPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [navbarPages, setNavbarPages] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);


  const { data: roles, isLoading: rolesLoading } = useAllRoles();
  const { data: rolePermissions, isLoading: permissionsLoading } = useRolePermissions(selectedRole);
  const updatePermissionsMutation = useUpdateRolePermissions();

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].name);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (rolePermissions) {
      setPermissions(rolePermissions);
      // Initialize navbar pages from permissions
      const navbarString = rolePermissions.navbar || '';
      const pages = navbarString.split(',').map(page => page.trim()).filter(page => page);
      setNavbarPages(pages);
      setHasChanges(false);
    }
  }, [rolePermissions]);

  const handlePermissionChange = (path: string, value: boolean) => {
    if (!permissions) return;

    const pathParts = path.split('.');
    let current: any = permissions;

    // Navigate to the resource level
    const resourceKey = pathParts[0];
    if (!current[resourceKey]) {
      current[resourceKey] = {};
    }
    current = current[resourceKey];

    // Navigate to the action level
    const actionKey = pathParts[1];
    if (!current[actionKey]) {
      current[actionKey] = {};
    }

    // Set the allowed property
    current[actionKey].allowed = value;

    setPermissions({ ...permissions });
    setHasChanges(true);
  };

  const handleNavbarChange = (pageKey: string, checked: boolean) => {
    if (!permissions) return;

    let updatedPages: string[];
    if (checked) {
      updatedPages = [...navbarPages, pageKey];
    } else {
      updatedPages = navbarPages.filter(page => page !== pageKey);
    }

    setNavbarPages(updatedPages);
    setHasChanges(true);
  };

  const getPermissionValue = (path: string): boolean => {
    if (!permissions) return false;

    const pathParts = path.split('.');
    const resourceKey = pathParts[0];
    const actionKey = pathParts[1];
    const propertyKey = pathParts[2]; // 'allowed', 'scope', etc.

    if (!permissions[resourceKey] || !permissions[resourceKey][actionKey]) {
      return false;
    }

    const actionObj = permissions[resourceKey][actionKey];

    if (propertyKey === 'allowed') {
      return Boolean(actionObj.allowed);
    }

    return false;
  };

  const getPermissionProperty = (path: string, property: string): any => {
    if (!permissions) return null;

    const pathParts = path.split('.');
    const resourceKey = pathParts[0];
    const actionKey = pathParts[1];

    if (!permissions[resourceKey] || !permissions[resourceKey][actionKey]) {
      return null;
    }

    const actionObj = permissions[resourceKey][actionKey];
    return actionObj[property] || null;
  };

  const handleSave = async () => {
    if (!permissions || !selectedRole) return;

    try {
      // Update permissions with navbar pages
      const updatedPermissions = {
        ...permissions,
        navbar: navbarPages.join(',')
      };

      await updatePermissionsMutation.mutateAsync({
        roleName: selectedRole,
        permissions: updatedPermissions
      });

      toast.success(`Permissions for ${selectedRole} role have been updated successfully.`);

      setHasChanges(false);
    } catch {
      toast.error('Failed to update permissions. Please try again.');
    }
  };

  const handleReset = () => {
    if (rolePermissions) {
      setPermissions(rolePermissions);
      // Reset navbar pages from permissions
      const navbarString = rolePermissions.navbar || '';
      const pages = navbarString.split(',').map(page => page.trim()).filter(page => page);
      setNavbarPages(pages);
      setHasChanges(false);
    }
  };

  const isAdminRole = selectedRole === 'Admin';

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage role-based permissions for users across the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Selection</CardTitle>
          <CardDescription>
            Select a role to manage its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.name} value={role.name}>
                    <div className="flex items-center gap-2">
                      {role.name === 'Admin' && <Shield className="h-4 w-4" />}
                      {role.name === 'Buyer' && <Users className="h-4 w-4" />}
                      {role.name === 'Supplier' && <FileText className="h-4 w-4" />}
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdminRole && (
              <Alert className="w-96">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Admin role permissions are read-only for security reasons.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdminRole ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Role Permissions
            </CardTitle>
            <CardDescription>
              Admin role has full system access and cannot be modified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionSections
                .filter((section) => !(isAdminRole && section.title === 'Navigation'))
                .map((section) => (
                <div key={section.title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {section.permissions.map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {permissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {selectedRole} Role Permissions
                </CardTitle>
                <CardDescription>
                  Configure permissions for the {selectedRole} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="all">All Permissions</TabsTrigger>
                    <TabsTrigger value="rfp">RFP Management</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-6">
                    {permissionSections
                      .filter((section) => !(isAdminRole && section.title === 'Navigation'))
                      .map((section) => (
                      <div key={section.title}>
                        <div className="flex items-center gap-2 mb-4">
                          <section.icon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.permissions.map((permission) => (
                            <div key={permission.key}>
                              {permission.key === 'navbar' ? (
                                <div className="p-4 border rounded-lg">
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium">
                                        {permission.label}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-medium">Available Pages:</Label>
                                      {navbarOptions[selectedRole]?.map((option) => (
                                        <div key={option.key} className="flex items-start space-x-3">
                                          <Checkbox
                                            id={`navbar-${option.key}`}
                                            checked={navbarPages.includes(option.key)}
                                            onCheckedChange={(checked) =>
                                              handleNavbarChange(option.key, checked as boolean)
                                            }
                                            disabled={isAdminRole}
                                          />
                                          <div className="grid gap-1.5 leading-none">
                                            <Label
                                              htmlFor={`navbar-${option.key}`}
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              {option.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                              {option.description}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {navbarPages.length > 0 && (
                                      <div>
                                        <Label className="text-sm font-medium">Selected Pages:</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {navbarPages.map((page) => {
                                            const option = navbarOptions[selectedRole]?.find(opt => opt.key === page);
                                            return (
                                              <Badge key={page} variant="secondary">
                                                {option?.label || page}
                                              </Badge>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <Label htmlFor={permission.key} className="text-sm font-medium">
                                        {permission.label}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                    <Switch
                                      id={permission.key}
                                      checked={getPermissionValue(permission.key)}
                                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                      disabled={isAdminRole}
                                    />
                                  </div>

                                  {/* Show additional properties if they exist */}
                                  {(() => {
                                    const scope = getPermissionProperty(permission.key, 'scope');
                                    const allowedRfpStatuses = getPermissionProperty(permission.key, 'allowed_rfp_statuses');
                                    const allowedResponseStatuses = getPermissionProperty(permission.key, 'allowed_response_statuses');

                                    return (scope || allowedRfpStatuses || allowedResponseStatuses) ? (
                                      <div className="space-y-3 pt-3 border-t">
                                        {scope && (
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">Scope:</Label>
                                            <Select
                                              value={scope}
                                              onValueChange={(value) => {
                                                const pathParts = permission.key.split('.');
                                                const current: any = permissions;
                                                const resourceKey = pathParts[0];
                                                const actionKey = pathParts[1];

                                                if (!current[resourceKey]) current[resourceKey] = {};
                                                if (!current[resourceKey][actionKey]) current[resourceKey][actionKey] = {};
                                                current[resourceKey][actionKey].scope = value || null;

                                                setPermissions({ ...permissions });
                                                setHasChanges(true);
                                              }}
                                              disabled={isAdminRole}
                                            >
                                              <SelectTrigger className="mt-1 h-8">
                                                <SelectValue placeholder="Select scope" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="own">Own</SelectItem>
                                                <SelectItem value="rfp_owner">RFP Owner</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                        {allowedRfpStatuses && (
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">Allowed RFP Statuses:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {['Draft', 'Published', 'Closed', 'Awarded', 'Rejected'].map((status) => (
                                                <div key={status} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`rfp-${permission.key}-${status}`}
                                                    checked={allowedRfpStatuses.includes(status)}
                                                    onCheckedChange={(checked) => {
                                                      const pathParts = permission.key.split('.');
                                                      const current: any = permissions;
                                                      const resourceKey = pathParts[0];
                                                      const actionKey = pathParts[1];

                                                      if (!current[resourceKey]) current[resourceKey] = {};
                                                      if (!current[resourceKey][actionKey]) current[resourceKey][actionKey] = {};

                                                      let updatedStatuses = [...(allowedRfpStatuses || [])];
                                                      if (checked) {
                                                        if (!updatedStatuses.includes(status)) {
                                                          updatedStatuses.push(status);
                                                        }
                                                      } else {
                                                        updatedStatuses = updatedStatuses.filter(s => s !== status);
                                                      }

                                                      current[resourceKey][actionKey].allowed_rfp_statuses = updatedStatuses.length > 0 ? updatedStatuses : null;
                                                      setPermissions({ ...permissions });
                                                      setHasChanges(true);
                                                    }}
                                                    disabled={isAdminRole}
                                                  />
                                                  <Label htmlFor={`rfp-${permission.key}-${status}`} className="text-xs">
                                                    {status}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {allowedResponseStatuses && (
                                          <div>
                                            <Label className="text-xs font-medium text-gray-600">Allowed Response Statuses:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Awarded'].map((status) => (
                                                <div key={status} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`response-${permission.key}-${status}`}
                                                    checked={allowedResponseStatuses.includes(status)}
                                                    onCheckedChange={(checked) => {
                                                      const pathParts = permission.key.split('.');
                                                      const current: any = permissions;
                                                      const resourceKey = pathParts[0];
                                                      const actionKey = pathParts[1];

                                                      if (!current[resourceKey]) current[resourceKey] = {};
                                                      if (!current[resourceKey][actionKey]) current[resourceKey][actionKey] = {};

                                                      let updatedStatuses = [...(allowedResponseStatuses || [])];
                                                      if (checked) {
                                                        if (!updatedStatuses.includes(status)) {
                                                          updatedStatuses.push(status);
                                                        }
                                                      } else {
                                                        updatedStatuses = updatedStatuses.filter(s => s !== status);
                                                      }

                                                      current[resourceKey][actionKey].allowed_response_statuses = updatedStatuses.length > 0 ? updatedStatuses : null;
                                                      setPermissions({ ...permissions });
                                                      setHasChanges(true);
                                                    }}
                                                    disabled={isAdminRole}
                                                  />
                                                  <Label htmlFor={`response-${permission.key}-${status}`} className="text-xs">
                                                    {status}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="rfp" className="space-y-6">
                    {permissionSections
                      .filter(section => ['RFP Management', 'Documents'].includes(section.title) && !(isAdminRole && section.title === 'Navigation'))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key}>
                                {permission.key === 'navbar' ? (
                                  <div className="p-4 border rounded-lg">
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm font-medium">
                                          {permission.label}
                                        </Label>
                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-sm font-medium">Available Pages:</Label>
                                        {navbarOptions[selectedRole]?.map((option) => (
                                          <div key={option.key} className="flex items-start space-x-3">
                                            <Checkbox
                                              id={`navbar-${option.key}`}
                                              checked={navbarPages.includes(option.key)}
                                              onCheckedChange={(checked) =>
                                                handleNavbarChange(option.key, checked as boolean)
                                              }
                                              disabled={isAdminRole}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                              <Label
                                                htmlFor={`navbar-${option.key}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                {option.label}
                                              </Label>
                                              <p className="text-xs text-muted-foreground">
                                                {option.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {navbarPages.length > 0 && (
                                        <div>
                                          <Label className="text-sm font-medium">Selected Pages:</Label>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {navbarPages.map((page) => {
                                              const option = navbarOptions[selectedRole]?.find(opt => opt.key === page);
                                              return (
                                                <Badge key={page} variant="secondary">
                                                  {option?.label || page}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                      <Label htmlFor={permission.key} className="text-sm font-medium">
                                        {permission.label}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                    <Switch
                                      id={permission.key}
                                      checked={getPermissionValue(permission.key)}
                                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                      disabled={isAdminRole}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-6">
                    {permissionSections
                      .filter(section => ['Supplier Responses'].includes(section.title) && !(isAdminRole && section.title === 'Navigation'))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key}>
                                {permission.key === 'navbar' ? (
                                  <div className="p-4 border rounded-lg">
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm font-medium">
                                          {permission.label}
                                        </Label>
                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-sm font-medium">Available Pages:</Label>
                                        {navbarOptions[selectedRole]?.map((option) => (
                                          <div key={option.key} className="flex items-start space-x-3">
                                            <Checkbox
                                              id={`navbar-${option.key}`}
                                              checked={navbarPages.includes(option.key)}
                                              onCheckedChange={(checked) =>
                                                handleNavbarChange(option.key, checked as boolean)
                                              }
                                              disabled={isAdminRole}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                              <Label
                                                htmlFor={`navbar-${option.key}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                {option.label}
                                              </Label>
                                              <p className="text-xs text-muted-foreground">
                                                {option.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {navbarPages.length > 0 && (
                                        <div>
                                          <Label className="text-sm font-medium">Selected Pages:</Label>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {navbarPages.map((page) => {
                                              const option = navbarOptions[selectedRole]?.find(opt => opt.key === page);
                                              return (
                                                <Badge key={page} variant="secondary">
                                                  {option?.label || page}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                      <Label htmlFor={permission.key} className="text-sm font-medium">
                                        {permission.label}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                    <Switch
                                      id={permission.key}
                                      checked={getPermissionValue(permission.key)}
                                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                      disabled={isAdminRole}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-6">
                    {permissionSections
                      .filter(section => ['Admin'].includes(section.title) && !(isAdminRole && section.title === 'Navigation'))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key}>
                                {permission.key === 'navbar' ? (
                                  <div className="p-4 border rounded-lg">
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm font-medium">
                                          {permission.label}
                                        </Label>
                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-sm font-medium">Available Pages:</Label>
                                        {navbarOptions[selectedRole]?.map((option) => (
                                          <div key={option.key} className="flex items-start space-x-3">
                                            <Checkbox
                                              id={`navbar-${option.key}`}
                                              checked={navbarPages.includes(option.key)}
                                              onCheckedChange={(checked) =>
                                                handleNavbarChange(option.key, checked as boolean)
                                              }
                                              disabled={isAdminRole}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                              <Label
                                                htmlFor={`navbar-${option.key}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                {option.label}
                                              </Label>
                                              <p className="text-xs text-muted-foreground">
                                                {option.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {navbarPages.length > 0 && (
                                        <div>
                                          <Label className="text-sm font-medium">Selected Pages:</Label>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {navbarPages.map((page) => {
                                              const option = navbarOptions[selectedRole]?.find(opt => opt.key === page);
                                              return (
                                                <Badge key={page} variant="secondary">
                                                  {option?.label || page}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                      <Label htmlFor={permission.key} className="text-sm font-medium">
                                        {permission.label}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                    <Switch
                                      id={permission.key}
                                      checked={getPermissionValue(permission.key)}
                                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                      disabled={isAdminRole}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Unsaved Changes
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges || isAdminRole}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isAdminRole || updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
