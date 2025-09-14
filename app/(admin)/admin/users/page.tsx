'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield,
  User as UserIcon,
  Crown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { authApi, userApi } from '@/lib/api';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('editor');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('editor');
  const [creatingUser, setCreatingUser] = useState(false);
  const { user: currentUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserForm>();

  // Fetch users from API
  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(!showLoader);
      
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
      
      console.log('Users fetched:', usersData.length);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      
      // Show user-friendly error
      if (error.response?.status === 403) {
        alert('You do not have permission to view users. Admin access required.');
      } else {
        alert('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRoleIcon = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN')) return <Crown className="h-4 w-4" />;
    if (roles.includes('ROLE_EDITOR')) return <Edit className="h-4 w-4" />;
    return <UserIcon className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN')) return 'destructive';
    if (roles.includes('ROLE_EDITOR')) return 'default';
    return 'secondary';
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_EDITOR')) return 'Editor';
    return 'User';
  };

  const onCreateUser = async (data: CreateUserForm) => {
    setCreatingUser(true);
    try {
      const userData = {
        ...data,
        roles: [selectedRole === 'admin' ? 'admin' : 'editor']
      };
      
      console.log('Creating user:', userData);
      await authApi.signup(userData);
      
      // Refresh the users list
      await fetchUsers(false);
      
      setIsCreateDialogOpen(false);
      reset();
      setSelectedRole('editor');
      
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.';
      alert(errorMessage);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('Deleting user:', user.id);
      await userApi.deleteUser(user.id);
      
      // Remove user from local state
      setUsers(users.filter(u => u.id !== user.id));
      
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      alert(errorMessage);
    }
  };

  const handleRoleChange = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot change your own role.');
      return;
    }

    setSelectedUser(user);
    setNewRole(user.roles.includes('ROLE_ADMIN') ? 'admin' : 'editor');
    setIsRoleDialogOpen(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;

    try {
      console.log('Updating user role:', selectedUser.id, newRole);
      await userApi.updateUserRole(selectedUser.id, newRole);
      
      // Update user in local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, roles: [`ROLE_${newRole.toUpperCase()}`] }
          : user
      ));
      
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      
      alert('User role updated successfully!');
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to update user role. Please try again.';
      alert(errorMessage);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">User Management</h1>
            {refreshing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground">
            Manage user accounts and permissions • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchUsers(false)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate permissions.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    disabled={creatingUser}
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    disabled={creatingUser}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email format'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    disabled={creatingUser}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={selectedRole} 
                    onValueChange={setSelectedRole}
                    disabled={creatingUser}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={creatingUser}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingUser}>
                    {creatingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.username}</h3>
                      <Badge 
                        variant={getRoleBadgeVariant(user.roles)}
                        className="flex items-center space-x-1"
                      >
                        {getRoleIcon(user.roles)}
                        <span>{getRoleLabel(user.roles)}</span>
                      </Badge>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(user)}
                      disabled={user.id === currentUser?.id}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 focus:text-red-600"
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search query.' : 'Start by adding your first user.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.username}. This will affect their permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateUserRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
