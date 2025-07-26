const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

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
    const { code, redirect_uri } = data;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' }),
      };
    }

    // Microsoft OAuth client credentials
    const CLIENT_ID = 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0';
    const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET; // You'd need to set this

    // If no client secret is configured, return auth code info instead
    if (!CLIENT_SECRET) {
      console.log('⚠️ No client secret configured, returning auth code info');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Token exchange requires client secret',
          authorizationCode: code,
          clientId: CLIENT_ID,
          redirectUri: redirect_uri || 'https://vaultydocs.com/oauth-callback'
        }),
      };
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'openid profile email User.Read',
        code: code,
        redirect_uri: redirect_uri || 'https://vaultydocs.com/oauth-callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('❌ Token exchange failed:', tokenData.error_description);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Token exchange failed',
          details: tokenData.error_description,
          authorizationCode: code
        }),
      };
    }

    // Get user profile with the access token
    let userProfile = null;
    if (tokenData.access_token) {
      try {
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (profileResponse.ok) {
          userProfile = await profileResponse.json();
        }
      } catch (profileError) {
        console.warn('⚠️ Failed to get user profile:', profileError.message);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        userProfile: userProfile,
        email: userProfile?.mail || userProfile?.userPrincipalName || null,
        name: userProfile?.displayName || null
      }),
    };

  } catch (error) {
    console.error('❌ Token exchange error:', error);
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