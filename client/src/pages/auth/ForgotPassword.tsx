// pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 p-8 md:p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-lime-500 rounded-full mb-6">
                <CheckCircle className="text-white" size={48} />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent mb-4">
                Check Your Email
              </h1>
              
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. The link will expire in 1 hour.
              </p>

              <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-6 text-left mb-6">
                <h3 className="font-bold text-lime-900 mb-3 text-lg">Didn't receive the email?</h3>
                <ul className="space-y-2 text-lime-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>Make sure you entered the correct email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>Wait a few minutes and try again</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600"
                >
                  Back to Login
                </Button>
                
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full py-3 border-2 border-lime-500 text-lime-600 font-bold rounded-xl hover:bg-lime-50"
                >
                  Try Another Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-500 rounded-2xl mb-4 shadow-lg">
              <Mail className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-600">Enter your email to reset your password</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register('email')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300 hover:border-lime-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Sending Reset Link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="flex items-center justify-center gap-2 text-lime-600 hover:text-lime-700"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}