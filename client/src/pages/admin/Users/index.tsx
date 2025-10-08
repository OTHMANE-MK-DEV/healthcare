// pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, UserCircle, Mail, Shield, Edit, Trash2, Eye } from 'lucide-react';
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

// Mock data
const mockUsers: User[] = [
  {
    _id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'patient',
    isVerified: true,
    isApproved: true,
    status: 'approved',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    username: 'dr_smith',
    email: 'smith@hospital.com',
    role: 'medecin',
    isVerified: true,
    isApproved: true,
    status: 'approved',
    createdAt: '2024-02-20T14:20:00Z'
  },
  {
    _id: '3',
    username: 'admin_user',
    email: 'admin@system.com',
    role: 'admin',
    isVerified: true,
    isApproved: true,
    status: 'approved',
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    _id: '4',
    username: 'jane_patient',
    email: 'jane@example.com',
    role: 'patient',
    isVerified: false,
    isApproved: false,
    status: 'pending',
    createdAt: '2024-03-25T16:45:00Z'
  },
  {
    _id: '5',
    username: 'dr_wilson',
    email: 'wilson@clinic.com',
    role: 'medecin',
    isVerified: true,
    isApproved: false,
    status: 'pending',
    createdAt: '2024-03-28T11:20:00Z'
  }
];

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const usersPerPage = 8;

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.username.localeCompare(b.username);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

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

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleViewDetails = (user: User) => {
    navigate(`/admin/users/${user._id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/admin/users/${user._id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users, roles, and permissions</p>
        </div>

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

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {paginatedUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 relative">
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

              {/* Avatar */}
              <div className="flex justify-center mb-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-lime-600" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">{user.username}</h3>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center gap-4 w-[400px] p-4 bg-white rounded-lg shadow-lg border border-gray-200'>
          <div className='w-1/4 h-20 bg-lime-400 rounded-lg'>
            <img src="" alt="" />
          </div>
          <div>
            <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">musashi</h3>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  othmane@gmail.com
                </p>
              </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getRoleBadgeColor('admin')}`}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    admin
                  </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
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

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
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