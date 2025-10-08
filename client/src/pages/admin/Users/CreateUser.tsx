// pages/admin/CreateUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Plus, Shield } from 'lucide-react';

interface NewUserFormData {
  avatar?: File | null;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'medecin' | 'admin' | '';
  // Patient specific
  CIN?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  sexe?: string;
  age?: number;
  contact?: string;
  dateNaissance?: string;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [createStep, setCreateStep] = useState(1);
  const [formData, setFormData] = useState<NewUserFormData>({
    avatar: null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    CIN: '',
    nom: '',
    prenom: '',
    adresse: '',
    sexe: '',
    age: undefined,
    contact: '',
    dateNaissance: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  const handleCreateUser = () => {
    // API call to create user
    console.log('Creating user:', formData);
    navigate('/admin/users');
  };

  const nextStep = () => {
    if (createStep < 3) setCreateStep(createStep + 1);
  };

  const prevStep = () => {
    if (createStep > 1) setCreateStep(createStep - 1);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User</h1>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Progress Steps */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      createStep >= step ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    <span className={`ml-2 font-medium ${createStep >= step ? 'text-lime-600' : 'text-gray-500'}`}>
                      {step === 1 ? 'Basic Info' : step === 2 ? 'Select Role' : 'Additional Info'}
                    </span>
                  </div>
                  {step < 3 && <div className={`flex-1 h-1 mx-4 ${createStep > step ? 'bg-lime-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Basic Info */}
            {createStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-lime-100 flex items-center justify-center">
                        <UserCircle className="w-16 h-16 text-lime-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-lime-500 hover:bg-lime-600 text-white rounded-full p-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Upload avatar</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Role */}
            {createStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Select User Role</h2>
                <div className="grid grid-cols-3 gap-6">
                  {['patient', 'medecin', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setFormData({ ...formData, role: role as any })}
                      className={`p-8 border-2 rounded-xl text-center transition-all ${
                        formData.role === role
                          ? 'border-lime-500 bg-lime-50'
                          : 'border-gray-200 hover:border-lime-300'
                      }`}
                    >
                      <Shield className={`w-16 h-16 mx-auto mb-4 ${
                        formData.role === role ? 'text-lime-600' : 'text-gray-400'
                      }`} />
                      <h4 className="font-semibold text-gray-900 capitalize mb-2 text-lg">{role}</h4>
                      <p className="text-sm text-gray-600">
                        {role === 'patient' ? 'Regular patient user' :
                         role === 'medecin' ? 'Medical professional' :
                         'System administrator'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Additional Info */}
            {createStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                
                {formData.role === 'patient' && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CIN *</label>
                        <input
                          type="text"
                          value={formData.CIN}
                          onChange={(e) => setFormData({ ...formData, CIN: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                          placeholder="CIN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                        <input
                          type="text"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateNaissance}
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
                          placeholder="Age"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={formData.sexe}
                        onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                        rows={3}
                        placeholder="Full address"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'medecin' && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CIN *</label>
                        <input
                          type="text"
                          value={formData.CIN}
                          onChange={(e) => setFormData({ ...formData, CIN: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                          placeholder="CIN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prenom *</label>
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                          placeholder="First name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                      <textarea
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
                        rows={3}
                        placeholder="Full address"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'admin' && (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-lime-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Admin User</h4>
                    <p className="text-gray-600">
                      Admin users have full system access. No additional information is required.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
              {createStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
              
              {createStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                  className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleCreateUser}
                  disabled={
                    (formData.role === 'patient' && (!formData.CIN || !formData.nom || !formData.prenom || !formData.adresse)) ||
                    (formData.role === 'medecin' && (!formData.CIN || !formData.nom || !formData.prenom || !formData.adresse))
                  }
                  className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Create User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;