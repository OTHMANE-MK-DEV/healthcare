// pages/admin/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Mail, Shield, Edit, Calendar, MapPin, Phone, IdCard, Loader } from 'lucide-react';

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
  lastLogin?: string;
}

interface Profile {
  nom?: string;
  prenom?: string;
  CIN?: string;
  adresse?: string;
  sexe?: string;
  age?: number;
  contact?: string;
  dateNaissance?: string;
  specialite?: string;
  experience?: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    user: User;
    profile: Profile | null;
  };
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user details');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setProfile(data.data.profile);
      } else {
        throw new Error('Failed to load user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-lime-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/admin/users')}
              className="px-6 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium"
            >
              Back to Users
            </button>
            <button
              onClick={fetchUserDetails}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-gray-600" />
          </div>
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
      <div className="max-w-7xl mx-auto">
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
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-lime-100"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-lime-100 flex items-center justify-center border-4 border-lime-200">
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
                <div className="flex justify-center gap-2 flex-wrap">
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
                  <span className="font-mono text-gray-900 text-xs">{user._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="text-gray-900">
                    {user.lastLogin ? getTimeAgo(user.lastLogin) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>

              {profile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Personal Information</h4>
                    
                    {(profile.nom || profile.prenom) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-gray-900">
                          {profile.prenom} {profile.nom}
                        </p>
                      </div>
                    )}

                    {profile.CIN && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          CIN
                        </label>
                        <p className="text-gray-900">{profile.CIN}</p>
                      </div>
                    )}

                    {profile.dateNaissance && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </label>
                        <p className="text-gray-900">
                          {formatDate(profile.dateNaissance)}
                        </p>
                      </div>
                    )}

                    {profile.age && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p className="text-gray-900">{profile.age} years</p>
                      </div>
                    )}

                    {profile.sexe && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-gray-900 capitalize">
                          {profile.sexe === 'M' ? 'Male' : profile.sexe === 'F' ? 'Female' : profile.sexe}
                        </p>
                      </div>
                    )}

                    {/* Medecin specific fields */}
                    {user.role === 'medecin' && profile.specialite && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                        <p className="text-gray-900">{profile.specialite}</p>
                      </div>
                    )}

                    {user.role === 'medecin' && profile.experience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                        <p className="text-gray-900">{profile.experience} years</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Contact Information</h4>

                    {profile.contact && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Number
                        </label>
                        <p className="text-gray-900">{profile.contact}</p>
                      </div>
                    )}

                    {profile.adresse && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address
                        </label>
                        <p className="text-gray-900">{profile.adresse}</p>
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
              ) : (
                <div className="text-center py-8">
                  <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Profile Information</h4>
                  <p className="text-gray-600">
                    {user.role === 'admin' 
                      ? 'Admin users do not have additional profile information.' 
                      : 'This user hasn\'t completed their profile yet.'
                    }
                  </p>
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