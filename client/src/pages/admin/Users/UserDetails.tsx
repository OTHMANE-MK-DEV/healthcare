// pages/admin/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Mail, Shield, Edit, Calendar, MapPin, Phone, IdCard } from 'lucide-react';

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
  // Additional fields that might come from API
  profile?: {
    nom?: string;
    prenom?: string;
    CIN?: string;
    adresse?: string;
    sexe?: string;
    age?: number;
    contact?: string;
    dateNaissance?: string;
  };
}

const mockUser: User = {
  _id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  role: 'patient',
  isVerified: true,
  isApproved: true,
  status: 'approved',
  createdAt: '2024-01-15T10:30:00Z',
  profile: {
    nom: 'Doe',
    prenom: 'John',
    CIN: 'AB123456',
    adresse: '123 Main Street, City, Country',
    sexe: 'M',
    age: 30,
    contact: '+1234567890',
    dateNaissance: '1994-05-15'
  }
};

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-lime-600 hover:text-lime-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Users
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
              <p className="text-gray-600">View and manage user information</p>
            </div>
            <button
              onClick={() => navigate(`/admin/users/${user._id}/edit`)}
              className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-lime-100 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-lime-600" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user.username}</h2>
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>

              {/* Status Badges */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-center">
                  <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="w-4 h-4 inline mr-2" />
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-center gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    user.isVerified 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    user.isApproved 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {user.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-gray-900">{user._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="text-gray-900">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>

              {user.profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Personal Information</h4>
                    
                    {user.profile.nom && user.profile.prenom && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-gray-900">{user.profile.prenom} {user.profile.nom}</p>
                      </div>
                    )}

                    {user.profile.CIN && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          CIN
                        </label>
                        <p className="text-gray-900">{user.profile.CIN}</p>
                      </div>
                    )}

                    {user.profile.dateNaissance && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </label>
                        <p className="text-gray-900">
                          {new Date(user.profile.dateNaissance).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {user.profile.age && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p className="text-gray-900">{user.profile.age} years</p>
                      </div>
                    )}

                    {user.profile.sexe && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-gray-900 capitalize">{user.profile.sexe === 'M' ? 'Male' : 'Female'}</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Contact Information</h4>

                    {user.profile.contact && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Number
                        </label>
                        <p className="text-gray-900">{user.profile.contact}</p>
                      </div>
                    )}

                    {user.profile.adresse && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address
                        </label>
                        <p className="text-gray-900">{user.profile.adresse}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {!user.profile && (
                <div className="text-center py-8">
                  <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Profile Information</h4>
                  <p className="text-gray-600">This user hasn't completed their profile yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;