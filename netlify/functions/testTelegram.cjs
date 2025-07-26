// Test function for Telegram integration debugging
const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Test environment variables
    const envTest = {
      hasBotToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      botTokenLength: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.length : 0,
      chatIdLength: TELEGRAM_CHAT_ID ? TELEGRAM_CHAT_ID.length : 0,
      botTokenPrefix: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'N/A',
      botTokenValid: TELEGRAM_BOT_TOKEN ? /^\d+:[A-Za-z0-9_-]+$/.test(TELEGRAM_BOT_TOKEN) : false
    };

    console.log('🔍 Environment Test:', envTest);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing environment variables',
          details: envTest
        }),
      };
    }

    // Test Telegram API connection
    try {
      console.log('🔍 Testing Telegram API...');
      const testResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      const testData = await testResponse.json();
      console.log('🔍 Telegram API Response:', testData);

      if (!testResponse.ok || !testData.ok) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Telegram API test failed',
            details: {
              status: testResponse.status,
              response: testData,
              envTest
            }
          }),
        };
      }

      // Send test message
      const testMessage = `🧪 <b>TELEGRAM TEST</b>

✅ Bot token is valid
🤖 Bot name: ${testData.result.first_name}
👤 Bot username: @${testData.result.username}
🕒 Test time: ${new Date().toISOString()}

This is a test message to verify Telegram integration is working.`;

      const messageResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: testMessage,
          parse_mode: 'HTML'
        }),
        signal: AbortSignal.timeout(10000)
      });

      const messageData = await messageResponse.json();
      console.log('🔍 Test Message Response:', messageData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: messageResponse.ok && messageData.ok,
          botInfo: testData.result,
          messageResult: messageData,
          envTest,
          timestamp: new Date().toISOString()
        }),
      };

    } catch (apiError) {
      console.error('❌ Telegram API Error:', apiError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Telegram API connection failed',
          details: {
            message: apiError.message,
            envTest
          }
        }),
      };
    }

  } catch (error) {
    console.error('❌ Test function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal test error',
        details: error.message
      }),
    };
  }
};

module.exports = { handler };