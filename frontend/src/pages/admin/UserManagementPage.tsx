import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUsers, useUpdateUser, useDeleteUser, useToggleUserStatus, useUserStats, useCreateUser } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface CreateUserFormProps {
  onSubmit: (data: { name: string; email: string; password: string; roleName: string }) => void;
}

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about the user
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Name</Label>
              <p className="text-sm">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-sm">{user.role.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ user, isOpen, onClose, onConfirm, isLoading }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">{user.name}</p>
                <p className="text-sm text-red-700">{user.email}</p>
                <p className="text-xs text-red-600">{user.role.name}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the user account and all associated data.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditUserFormProps {
  user: User | null;
  onSubmit: (data: { name: string; email: string; roleName: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    roleName: user?.role.name || 'Buyer',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleName: user.role.name,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <select
          id="edit-role"
          value={formData.roleName}
          onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="Buyer">Buyer</option>
          <option value="Supplier">Supplier</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update User'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'Buyer',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={formData.roleName}
          onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="Buyer">Buyer</option>
          <option value="Supplier">Supplier</option>
        </select>
      </div>
      <DialogFooter>
        <Button type="submit">Create User</Button>
      </DialogFooter>
    </form>
  );
};

const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const params = {
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  }

  // Use real API data
  const { data: usersData, isLoading, error } = useUsers(params);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  const toggleUserStatusMutation = useToggleUserStatus(params);
  const { data: userStats } = useUserStats();

  const users = usersData?.data?.data || [];
  const total = usersData?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);



  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error is handled by the mutation
      console.log(error);
    }
  };

  const handleCreateUser = async (data: { name: string; email: string; password: string; roleName: string }) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.log(error);
    }
  };

  const handleUpdateUser = async (data: { name: string; email: string; roleName: string }) => {
    if (!selectedUser) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: {
          name: data.name,
          email: data.email,
          role: data.roleName
        }
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error is handled by the mutation
      console.log(error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewDetailsDialogOpen(true);
  };

  const handleActivateUser = async (user: User) => {
    const action = user.status === 'active' ? 'deactivate' : 'activate';
    try {
      await toggleUserStatusMutation.mutateAsync({ id: user.id, action });
    } catch (error) {
      // Error is handled by the mutation
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load users</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Buyer': return 'bg-blue-100 text-blue-800';
      case 'Supplier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm onSubmit={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.data?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{userStats?.data?.userGrowthLastMonth || '0%'}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.data?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{userStats?.data?.activeUserGrowthLastWeek || '0%'}</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            
            <div className="text-2xl font-bold">
              {userStats?.data?.totalBuyers || 0}
            </div>
            <p className="text-xs flex items-center justify-center">
              {userStats?.data?.inactiveBuyers ?
                <span className='flex items-center gap-2'>
                  <span className="text-green-600">{userStats?.data?.inactiveBuyers || 0}</span>Inactive
                </span>
                :
                <span className='flex items-center gap-2'>
                  <span className="text-muted-foreground">Rfp Creators</span>
                </span>
              }
            </p>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.data?.totalSuppliers || 0}
            </div>
            <p className="text-xs flex items-center justify-center">
              {userStats?.data?.inactiveSuppliers ?
                <span className='flex items-center gap-2'>
                  <span className="text-green-600">{userStats?.data?.inactiveSuppliers || 0}</span>Inactive
                </span>
                :
                <span className='flex items-center gap-2'>
                  <span className="text-muted-foreground">Response Providers</span>
                </span>
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                console.log(e.target.value);
                setRoleFilter(e.target.value)
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="Buyer">Buyer</option>
              <option value="Supplier">Supplier</option>
            </select>

          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-center py-3 px-4 font-medium">User</th>
                  <th className="text-center  py-3 px-4 font-medium">Role</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleBadgeColor(user.role.name)}>
                        {user.role.name}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        isOpen={isViewDetailsDialogOpen}
        onClose={() => {
          setIsViewDetailsDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={userToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteUserMutation.isPending}
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <EditUserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedUser(null);
            }}
            isLoading={updateUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
