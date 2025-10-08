// Update your HealthcareLogin component
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Stethoscope, Activity, Heart, Zap, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function HealthcareLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // In your HealthcareLogin component - update the success handler
const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      }),
      credentials: 'include',
    });

    const result = await response.json();

    if (result.success) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Store profile data if available
      if (result.data.profile) {
        localStorage.setItem('profile', JSON.stringify(result.data.profile));
      }
      
      // Navigate based on role
      switch (result.data.user.role) {
        case 'patient':
          navigate('/patient');
          break;
        case 'medecin':
          navigate('/doctor');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      // Redirect based on role
      switch (user.role) {
        case 'patient':
          navigate('/patient');
          break;
        case 'medecin':
          navigate('/doctor');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-lime-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-20 left-20 text-lime-400/40 animate-bounce pointer-events-none hidden md:block">
        <HeartPulse size={40} />
      </div>
      <div className="absolute bottom-20 right-20 text-lime-400/40 animate-bounce pointer-events-none hidden md:block" style={{ animationDelay: '500ms' }}>
        <Activity size={40} />
      </div>
      <div className="absolute top-1/2 left-10 text-lime-300/30 animate-pulse pointer-events-none hidden md:block">
        <Zap size={32} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-5xl z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-lime-500 to-lime-700 text-white relative overflow-hidden">
              {/* ... your existing branding content ... */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl mb-6 shadow-lg">
                  <Stethoscope className="text-white" size={48} />
                </div>
                <h2 className="text-4xl font-bold mb-4">Healthcare Suptech</h2>
                <p className="text-white/90 text-lg mb-8 max-w-sm">
                  Your trusted partner in modern healthcare management and patient care excellence
                </p>
                
                <div className="space-y-4 text-left max-w-sm mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Real-time Monitoring</h3>
                      <p className="text-sm text-white/80">Track patient vitals and health data instantly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Patient Care</h3>
                      <p className="text-sm text-white/80">Comprehensive care management system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                      <HeartPulse size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Advanced Analytics</h3>
                      <p className="text-sm text-white/80">Data-driven insights for better decisions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Mobile Logo */}
              <div className="text-center mb-8 md:hidden">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-500 rounded-2xl mb-4 shadow-lg">
                  <Stethoscope className="text-white" size={32} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent">
                  Healthcare Suptech
                </h1>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to access your dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Username/Email Input */}
                <div className="space-y-2">
                  <label htmlFor="emailOrUsername" className="text-sm font-semibold text-gray-700 block">
                    Username or Email
                  </label>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Enter your username or email"
                    {...register('emailOrUsername')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
                  />
                  {errors.emailOrUsername && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.emailOrUsername.message}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password')}
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-gray-300 text-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-lime-600 hover:text-lime-700 transition-colors font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Social Login (optional) */}
              {/* ... your social login buttons ... */}

              {/* Register Link */}
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  onClick={() => navigate('/register')}
                  className="text-lime-600 hover:text-lime-700 font-bold transition-colors"
                >
                  Register now
                </button>
              </div>

              {/* Terms */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  By signing in, you agree to our{' '}
                  <button
                    onClick={() => navigate('/terms')}
                    className="text-lime-600 hover:text-lime-700 transition-colors font-medium"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    onClick={() => navigate('/privacy')}
                    className="text-lime-600 hover:text-lime-700 transition-colors font-medium"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}