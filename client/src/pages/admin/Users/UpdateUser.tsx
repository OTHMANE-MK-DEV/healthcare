// pages/admin/UpdateUser.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Shield, Save } from 'lucide-react';

interface UserFormData {
  avatar?: File | null;
  username: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
  isVerified: boolean;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  // Profile fields
  nom?: string;
  prenom?: string;
  CIN?: string;
  adresse?: string;
  sexe?: string;
  age?: number;
  contact?: string;
  dateNaissance?: string;
}

const mockUser: UserFormData = {
  username: 'john_doe',
  email: 'john@example.com',
  role: 'patient',
  isVerified: true,
  isApproved: true,
  status: 'approved',
  nom: 'Doe',
  prenom: 'John',
  CIN: 'AB123456',
  adresse: '123 Main Street, City, Country',
  sexe: 'M',
  age: 30,
  contact: '+1234567890',
  dateNaissance: '1994-05-15'
};

const UpdateUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>(mockUser);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch user data
    setTimeout(() => {
      setFormData(mockUser);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update user
    console.log('Updating user:', formData);
    navigate('/admin/users');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-lime-600 hover:text-lime-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit User</h1>
          <p className="text-gray-600">Update user information and permissions</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-lime-100 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-lime-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-lime-500 hover:bg-lime-600 text-white rounded-full p-2 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <UserCircle className="w-4 h-4" />
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">Click to change avatar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                >
                  <option value="patient">Patient</option>
                  <option value="medecin">Medecin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Profile Information */}
              <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.prenom || ''}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                <input
                  type="text"
                  value={formData.CIN || ''}
                  onChange={(e) => setFormData({ ...formData, CIN: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                <input
                  type="text"
                  value={formData.contact || ''}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateNaissance || ''}
                  onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.sexe || ''}
                  onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.adresse || ''}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              {/* Status Toggles */}
              <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 text-lime-600 focus:ring-lime-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Email Verified</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isApproved}
                      onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                      className="w-4 h-4 text-lime-600 focus:ring-lime-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Account Approved</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;