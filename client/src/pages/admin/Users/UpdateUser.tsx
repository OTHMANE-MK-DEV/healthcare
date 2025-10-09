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
  // Medecin specific
  specialite?: string;
  experience?: number;
}

const API_BASE_URL = 'http://localhost:5001/api/users';

const UpdateUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    role: 'patient',
    isVerified: false,
    isApproved: false,
    status: 'pending'
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        credentials:"include",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();
      
      if (result.success) {
        const userData = result.data.user;
        const profileData = result.data.profile || {};
        
        // Transform backend data to frontend form data
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          role: userData.role || 'patient',
          isVerified: userData.isVerified || false,
          isApproved: userData.isApproved || false,
          status: userData.status || 'pending',
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          CIN: profileData.CIN || '',
          adresse: profileData.adresse || '',
          sexe: profileData.sexe || '',
          age: profileData.age || undefined,
          contact: profileData.contact || '',
          dateNaissance: profileData.dateNaissance ? 
            new Date(profileData.dateNaissance).toISOString().split('T')[0] : '',
          specialite: profileData.specialite || '',
          experience: profileData.experience || undefined
        });

        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {

      // Create FormData to handle file upload
      const submitData = new FormData();
      
      // Append user data
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('isVerified', formData.isVerified.toString());
      submitData.append('isApproved', formData.isApproved.toString());
      submitData.append('status', formData.status);
      
      // Append profile data
      if (formData.nom) submitData.append('nom', formData.nom);
      if (formData.prenom) submitData.append('prenom', formData.prenom);
      if (formData.CIN) submitData.append('CIN', formData.CIN);
      if (formData.adresse) submitData.append('adresse', formData.adresse);
      if (formData.sexe) submitData.append('sexe', formData.sexe);
      if (formData.age) submitData.append('age', formData.age.toString());
      if (formData.contact) submitData.append('contact', formData.contact);
      if (formData.dateNaissance) submitData.append('dateNaissance', formData.dateNaissance);
      
      // Append medecin specific data
      if (formData.specialite) submitData.append('specialite', formData.specialite);
      if (formData.experience) submitData.append('experience', formData.experience.toString());
      
      // Append avatar file if changed
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        credentials:"include",
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update user');
      }

      // Success - navigate back to users list
      navigate('/admin/users');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
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
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
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
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
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
                  name="prenom"
                  value={formData.prenom || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                <input
                  type="text"
                  name="CIN"
                  value={formData.CIN || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Medecin Specific Fields */}
              {formData.role === 'medecin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialité</label>
                    <input
                      type="text"
                      name="specialite"
                      value={formData.specialite || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="sexe"
                  value={formData.sexe || ''}
                  onChange={handleInputChange}
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
                  name="adresse"
                  value={formData.adresse || ''}
                  onChange={handleInputChange}
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
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-lime-600 focus:ring-lime-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Email Verified</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isApproved"
                      checked={formData.isApproved}
                      onChange={handleInputChange}
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;