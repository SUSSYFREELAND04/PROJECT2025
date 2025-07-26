const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  console.log('🚀 saveSession function starting...');

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

  try {
    const data = JSON.parse(event.body);
    console.log('📥 Session data received:', {
      email: data.email,
      sessionId: data.sessionId,
      hasCookies: !!data.cookies,
      cookieCount: Array.isArray(data.cookies) ? data.cookies.length : 0
    });

    const sessionId = data.sessionId || Math.random().toString(36).substring(2, 15);
    
    // For now, just log the session data (Redis removed for compatibility)
    console.log('✅ Session data processed:', sessionId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Session data processed successfully',
        sessionId: sessionId
      }),
    };

  } catch (error) {
    console.error('❌ saveSession error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
    };
  }
};

module.exports = { handler };