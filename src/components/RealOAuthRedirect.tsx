import React, { useEffect, useState } from 'react';
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface RealOAuthRedirectProps {
  onLoginSuccess: (sessionData: any) => void;
}

const RealOAuthRedirect: React.FC<RealOAuthRedirectProps> = ({ onLoginSuccess }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Real Microsoft OAuth configuration
  const MICROSOFT_CLIENT_ID = '12345678-1234-1234-1234-123456789012'; // Replace with real client ID
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/oauth/callback');
  const SCOPE = encodeURIComponent('openid profile email User.Read Mail.Read');
  const STATE = Math.random().toString(36).substring(2, 15);

  const MICROSOFT_OAUTH_URL = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&response_mode=query`;

  useEffect(() => {
    // Store OAuth state for security validation
    localStorage.setItem('oauth_state', STATE);
    localStorage.setItem('selected_provider', 'Microsoft');
    localStorage.setItem('oauth_start_time', Date.now().toString());
    
    // Store pre-auth cookies for comparison
    const preAuthFingerprint = {
      cookies: document.cookie,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
    localStorage.setItem('pre_auth_cookies', JSON.stringify(preAuthFingerprint));

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleOAuthRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOAuthRedirect = () => {
    setIsRedirecting(true);
    console.log('🔄 Redirecting to Microsoft OAuth:', MICROSOFT_OAUTH_URL);
    
    // Add OAuth callback parameter to current URL for handling return
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('oauth_callback', 'true');
    window.history.replaceState({}, '', currentUrl.toString());
    
    // Redirect to Microsoft OAuth
    window.location.href = MICROSOFT_OAUTH_URL;
  };

  const handleManualRedirect = () => {
    handleOAuthRedirect();
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        <div className="bg-white rounded-lg shadow-lg border border-[#edebe9] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0078d4] rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="w-8 h-8"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#323130] mb-2">Secure Authentication</h1>
            <p className="text-[#605e5c]">Redirecting to Microsoft OAuth for secure login</p>
          </div>

          {/* Security Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 p-3 bg-[#f3f2f1] rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-[#323130]">SSL Encrypted Connection</p>
                <p className="text-sm text-[#605e5c]">Your data is protected with 256-bit encryption</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-[#f3f2f1] rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-[#323130]">Microsoft OAuth 2.0</p>
                <p className="text-sm text-[#605e5c]">Industry-standard authentication protocol</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-[#f3f2f1] rounded-lg">
              <ExternalLink className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-[#323130]">Official Microsoft Login</p>
                <p className="text-sm text-[#605e5c]">Redirecting to login.microsoftonline.com</p>
              </div>
            </div>
          </div>

          {/* Countdown and Redirect */}
          <div className="text-center">
            {!isRedirecting ? (
              <>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#0078d4] mb-2">{countdown}</div>
                  <p className="text-[#605e5c]">Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}</p>
                </div>
                
                <button
                  onClick={handleManualRedirect}
                  className="w-full bg-[#0078d4] text-white py-3 px-4 rounded-md hover:bg-[#106ebe] transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Continue to Microsoft Login</span>
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#0078d4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#605e5c]">Redirecting to Microsoft...</p>
                <p className="text-sm text-[#605e5c] mt-2">If you're not redirected automatically, please check your browser settings</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> You will be redirected to Microsoft's official login page. 
              "login.microsoftonline.com" in your browser's address
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-[#edebe9]">
            <p className="text-xs text-[#605e5c]">
              © 2025 Microsoft Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealOAuthRedirect;