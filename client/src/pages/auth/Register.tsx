import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Stethoscope, User, UserCog, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Step 1 Schema
const step1Schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 3 Doctor Schema
const doctorSchema = z.object({
  cin: z.string().min(5, 'CIN is required'),
  nom: z.string().min(2, 'Nom is required'),
  prenom: z.string().min(2, 'Prenom is required'),
  adresse: z.string().min(5, 'Adresse is required'),
});

// Step 3 Patient Schema
const patientSchema = z.object({
  cin: z.string().min(5, 'CIN is required'),
  nom: z.string().min(2, 'Nom is required'),
  prenom: z.string().min(2, 'Prenom is required'),
  adresse: z.string().min(5, 'Adresse is required'),
  sexe: z.enum(['male', 'female'], { required_error: 'Sexe is required' }),
  age: z.string().min(1, 'Age is required'),
  contact: z.string().min(10, 'Contact is required'),
  dateNaissance: z.string().min(1, 'Date de naissance is required'),
});

type Step1Data = z.infer<typeof step1Schema>;
type DoctorData = z.infer<typeof doctorSchema>;
type PatientData = z.infer<typeof patientSchema>;

export default function HealthcareRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  // Step 3 Forms
  const doctorForm = useForm<DoctorData>({
    resolver: zodResolver(doctorSchema),
  });

  const patientForm = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
  });

  const handleStep1Submit = (data: Step1Data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    setCurrentStep(3);
  };

  const handleStep3Submit = async (data: DoctorData | PatientData) => {
    setIsLoading(true);
    const finalData = { ...formData, ...data };
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log('Registration data:', finalData);
    // Here you would send the data to your backend
    // await fetch('/api/register', { method: 'POST', body: JSON.stringify(finalData) });
    
    setIsLoading(false);
    setCurrentStep(4);
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-2xl z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-500 rounded-2xl mb-4 shadow-lg">
              <Stethoscope className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join Healthcare Suptech Platform</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-sm font-medium text-gray-600">
              <span className={currentStep >= 1 ? 'text-lime-600' : ''}>Account Info</span>
              <span className={currentStep >= 2 ? 'text-lime-600' : ''}>Select Role</span>
              <span className={currentStep >= 3 ? 'text-lime-600' : ''}>Details</span>
              <span className={currentStep >= 4 ? 'text-lime-600' : ''}>Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-lime-500 to-lime-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  {...step1Form.register('username')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                />
                {step1Form.formState.errors.username && (
                  <p className="text-red-500 text-xs font-medium">{step1Form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...step1Form.register('email')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                />
                {step1Form.formState.errors.email && (
                  <p className="text-red-500 text-xs font-medium">{step1Form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...step1Form.register('password')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 pr-12 hover:border-lime-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lime-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {step1Form.formState.errors.password && (
                  <p className="text-red-500 text-xs font-medium">{step1Form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...step1Form.register('confirmPassword')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 pr-12 hover:border-lime-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lime-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {step1Form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium">{step1Form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={step1Form.handleSubmit(handleStep1Submit)}
                className="w-full py-3.5 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 flex items-center justify-center gap-2"
              >
                Next Step
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Select Your Role</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => handleRoleSelection('patient')}
                  className="p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-lime-500 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="text-white" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Patient</h3>
                    <p className="text-sm text-gray-600 text-center">Access health monitoring and medical records</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelection('doctor')}
                  className="p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-lime-500 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UserCog className="text-white" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Doctor</h3>
                    <p className="text-sm text-gray-600 text-center">Manage patients and provide healthcare services</p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
          )}

          {/* Step 3: Doctor Details */}
          {currentStep === 3 && selectedRole === 'doctor' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">CIN</label>
                  <input
                    type="text"
                    placeholder="Enter CIN"
                    {...doctorForm.register('cin')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {doctorForm.formState.errors.cin && (
                    <p className="text-red-500 text-xs font-medium">{doctorForm.formState.errors.cin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Nom</label>
                  <input
                    type="text"
                    placeholder="Enter nom"
                    {...doctorForm.register('nom')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {doctorForm.formState.errors.nom && (
                    <p className="text-red-500 text-xs font-medium">{doctorForm.formState.errors.nom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Prenom</label>
                  <input
                    type="text"
                    placeholder="Enter prenom"
                    {...doctorForm.register('prenom')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {doctorForm.formState.errors.prenom && (
                    <p className="text-red-500 text-xs font-medium">{doctorForm.formState.errors.prenom.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block">Adresse</label>
                  <input
                    type="text"
                    placeholder="Enter adresse"
                    {...doctorForm.register('adresse')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {doctorForm.formState.errors.adresse && (
                    <p className="text-red-500 text-xs font-medium">{doctorForm.formState.errors.adresse.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={doctorForm.handleSubmit(handleStep3Submit)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Details */}
          {currentStep === 3 && selectedRole === 'patient' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">CIN</label>
                  <input
                    type="text"
                    placeholder="Enter CIN"
                    {...patientForm.register('cin')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.cin && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.cin.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Nom</label>
                  <input
                    type="text"
                    placeholder="Enter nom"
                    {...patientForm.register('nom')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.nom && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.nom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Prenom</label>
                  <input
                    type="text"
                    placeholder="Enter prenom"
                    {...patientForm.register('prenom')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.prenom && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.prenom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Sexe</label>
                  <select
                    {...patientForm.register('sexe')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  >
                    <option value="">Select sexe</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {patientForm.formState.errors.sexe && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.sexe.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Age</label>
                  <input
                    type="number"
                    placeholder="Enter age"
                    {...patientForm.register('age')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.age && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Contact</label>
                  <input
                    type="tel"
                    placeholder="Enter contact"
                    {...patientForm.register('contact')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.contact && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.contact.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Date de Naissance</label>
                  <input
                    type="date"
                    {...patientForm.register('dateNaissance')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.dateNaissance && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.dateNaissance.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block">Adresse</label>
                  <input
                    type="text"
                    placeholder="Enter adresse"
                    {...patientForm.register('adresse')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {patientForm.formState.errors.adresse && (
                    <p className="text-red-500 text-xs font-medium">{patientForm.formState.errors.adresse.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={patientForm.handleSubmit(handleStep3Submit)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success Message */}
          {currentStep === 4 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lime-500 to-lime-500 rounded-full mb-6">
                <CheckCircle className="text-white" size={48} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
              
              <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-6 mb-6 text-left">
                <h3 className="font-bold text-lime-900 mb-3 text-lg">Next Steps:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">1.</span>
                    <span>Check your email <strong>{formData.email}</strong> for a confirmation link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">2.</span>
                    <span>Complete your profile verification within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">3.</span>
                    <span>You'll receive a welcome package with platform guidelines</span>
                  </li>
                  {/* {selectedRole === 'doctor' && (
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">4.</span>
                      <span>Medical license verification may take 2-3 business days</span>
                    </li>
                  )}
                  {selectedRole === 'patient' && (
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">4.</span>
                      <span>Schedule your first health assessment appointment</span>
                    </li>
                  )} */}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedRole(null);
                    step1Form.reset();
                    doctorForm.reset();
                    patientForm.reset();
                    setFormData({});
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg"
                >
                  Register Another Account
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    // Redirect to login or dashboard
                    console.log('Redirecting to login...');
                  }}
                  className="flex-1 py-3.5 bg-white border-2 border-lime-500 text-lime-600 font-bold rounded-xl hover:bg-lime-50 transition-all duration-300"
                >
                  Go to Dashboard
                </button>
              </div>

              {/* <div className="mt-6 p-4 bg-lime-50 border border-lime-200 rounded-xl">
                <p className="text-sm text-lime-800">
                  <strong>Important:</strong> Keep your login credentials secure. 
                  {selectedRole === 'doctor' 
                    ? ' You will be notified once your medical credentials are verified.' 
                    : ' Your medical data privacy is our top priority.'
                  }
                </p>
              </div> */}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-lime-600 cursor-pointer font-semibold hover:text-lime-700 transition-colors"
              >
                Sign in here
              </button>
            </p>
            
            <div className="mt-4 flex justify-center space-x-6">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => console.log('Terms clicked')}
              >
                Terms of Service
              </button>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => console.log('Privacy clicked')}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => console.log('Support clicked')}
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}