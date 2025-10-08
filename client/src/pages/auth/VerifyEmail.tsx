import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Mail, Info } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'already_verified' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setVerificationStatus('success');
          setMessage(result.message || 'Email verified successfully!');
          setNeedsApproval(result.needsApproval || false);
        } else {
          // Check if it's an "already verified" case
          if (result.message && result.message.toLowerCase().includes('already verified')) {
            setVerificationStatus('already_verified');
            setMessage(result.message);
            setNeedsApproval(result.needsApproval || false);
          } else {
            setVerificationStatus('error');
            setMessage(result.message || 'Email verification failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    navigate('/login', { 
      state: { 
        message: 'Please login with your email to resend verification if needed.' 
      } 
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-lime-50 via-white to-lime-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      {/* Verification Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 transition-all duration-500 ${
              verificationStatus === 'loading' ? 'bg-blue-500' :
              verificationStatus === 'success' ? 'bg-lime-500' :
              verificationStatus === 'already_verified' ? 'bg-blue-500' :
              'bg-red-500'
            }`}>
              {verificationStatus === 'loading' && <Clock className="text-white" size={48} />}
              {verificationStatus === 'success' && <CheckCircle className="text-white" size={48} />}
              {verificationStatus === 'already_verified' && <Info className="text-white" size={48} />}
              {verificationStatus === 'error' && <XCircle className="text-white" size={48} />}
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent mb-4">
              {verificationStatus === 'loading' && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'already_verified' && 'Already Verified'}
              {verificationStatus === 'error' && 'Verification Failed'}
            </h1>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Loading State */}
            {verificationStatus === 'loading' && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                </div>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {/* Success State */}
            {(verificationStatus === 'success' || verificationStatus === 'already_verified') && (
              <>
                <div className="space-y-4">
                  <div className={`border-2 rounded-2xl p-6 text-left ${
                    verificationStatus === 'success' 
                      ? 'bg-lime-50 border-lime-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h3 className={`font-bold mb-3 text-lg flex items-center gap-2 ${
                      verificationStatus === 'success' ? 'text-lime-900' : 'text-blue-900'
                    }`}>
                      {verificationStatus === 'success' ? (
                        <><CheckCircle size={20} /> Email Verified Successfully!</>
                      ) : (
                        <><Info size={20} /> Already Verified</>
                      )}
                    </h3>
                    <p className={verificationStatus === 'success' ? 'text-lime-800' : 'text-blue-800'}>
                      {message}
                    </p>
                  </div>

                  {/* Show different content based on approval status */}
                  {needsApproval ? (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-left">
                      <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                        <Clock size={20} />
                        Awaiting Admin Approval
                      </h3>
                      <p className="text-blue-800 mb-3">
                        Your account is now pending administrator approval. This process usually takes 24-48 hours.
                      </p>
                      <ul className="space-y-2 text-blue-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>Your application is under review</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>You will receive an email once approved</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>You can login only after approval</span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-left">
                      <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        Account Activated!
                      </h3>
                      <p className="text-green-800 mb-3">
                        Your account has been fully activated and you can now login.
                      </p>
                      <ul className="space-y-2 text-green-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>You can now login to your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>Complete your profile setup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>Explore the platform features</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  {!needsApproval && (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3.5 bg-gradient-to-r from-lime-500 to-lime-500 text-white font-bold rounded-xl hover:from-lime-600 hover:to-lime-600 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all duration-300 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50"
                    >
                      Go to Login
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-white border-2 border-lime-500 text-lime-600 font-bold rounded-xl hover:bg-lime-50 transition-all duration-300"
                  >
                    Back to Home
                  </button>

                  {needsApproval && (
                    <button
                      onClick={() => navigate('/contact')}
                      className="w-full py-3 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
                    >
                      Contact Support
                    </button>
                  )}
                </div>
              </>
            )}
            
            {/* Error State */}
            {verificationStatus === 'error' && (
              <>
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-red-900 mb-3 text-lg flex items-center gap-2">
                      <XCircle size={20} />
                      Verification Issue
                    </h3>
                    <p className="text-red-800">{message}</p>
                  </div>

                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-orange-900 mb-3 text-lg">Possible Solutions:</h3>
                    <ul className="space-y-2 text-orange-800 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Check if the verification link has expired</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Ensure you're using the most recent verification email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Contact support if the problem persists</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleResendEmail}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                  >
                    Request New Verification Email
                  </button>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Back to Login
                  </button>
                  
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full py-3 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Need help?{' '}
              <button
                onClick={() => navigate('/contact')}
                className="text-lime-600 cursor-pointer font-semibold hover:text-lime-700 transition-colors"
              >
                Contact our support team
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}