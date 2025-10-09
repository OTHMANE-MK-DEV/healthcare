// pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, UserCircle, Mail, Shield, Edit, Trash2, Eye, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
  isVerified: boolean;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  avatar?: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const usersPerPage = 12;

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : 'username',
        sortOrder: sortBy === 'newest' ? 'desc' : sortBy === 'oldest' ? 'asc' : 'asc'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`http://localhost:5001/api/users?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setTotalUsers(data.data.pagination.totalUsers);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {

      const response = await fetch(`http://localhost:5001/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove user from local state
        setUsers(users.filter(u => u._id !== selectedUser._id));
        setShowDeleteDialog(false);
        setSelectedUser(null);
        
        // Refresh the list if we're on the last page with only one user
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchUsers(); // Refresh to get updated pagination info
        }
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  // Update user status (approve/reject)
  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {

      const response = await fetch(`http://localhost:5001/api/users/${userId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          isApproved: status === 'approved'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update user in local state
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, status: data.data.user.status, isApproved: data.data.user.isApproved }
            : user
        ));
      } else {
        throw new Error(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  // Fetch users when component mounts or filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medecin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'patient':
        return 'bg-lime-100 text-lime-700 border-lime-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleViewDetails = (user: User) => {
    navigate(`/admin/users/${user._id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/admin/users/${user._id}/edit`);
  };

  const startIndex = (currentPage - 1) * usersPerPage;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users, roles, and permissions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter by Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patient</option>
              <option value="medecin">Medecin</option>
              <option value="admin">Admin</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* Create Button */}
            <button
              onClick={() => navigate('/admin/users/create')}
              className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create User
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-lime-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        )}

        {/* User Cards Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {users.map((user) => (
                <div key={user._id} className='flex items-center gap-4 w-full p-4 bg-white rounded-lg shadow-lg border border-gray-200 relative'>
                  {/* Three Dots Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setShowUserMenu(showUserMenu === user._id ? null : user._id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {showUserMenu === user._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            handleViewDetails(user);
                            setShowUserMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            handleEditUser(user);
                            setShowUserMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit User
                        </button>
                        
                        {/* Status Actions for Pending Users */}
                        {user.status === 'pending' && user.role === 'medecin' && (
                          <>
                            <button
                              onClick={() => {
                                handleUpdateStatus(user._id, 'approved');
                                setShowUserMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateStatus(user._id, 'rejected');
                                setShowUserMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                            setShowUserMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar Section */}
                  <div className='w-1/4 h-20 bg-lime-400 rounded-lg flex items-center justify-center'>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <UserCircle className="w-10 h-10 text-white" />
                    )}
                  </div>

                  {/* User Info Section */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1">{user.username}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {user.role}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                      {!user.isVerified && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg border bg-orange-100 text-orange-700 border-orange-200">
                          Unverified
                        </span>
                      )}
                      {user.role === 'medecin' && !user.isApproved && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg border bg-purple-100 text-purple-700 border-purple-200">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-lime-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {users.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <UserCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by creating your first user.'
                  }
                </p>
                {!searchQuery && roleFilter === 'all' && (
                  <button
                    onClick={() => navigate('/admin/users/create')}
                    className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create First User
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{selectedUser.username}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;