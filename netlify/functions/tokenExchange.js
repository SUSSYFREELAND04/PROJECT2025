export const handler = async (event, context) => {
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
    const { code, redirect_uri, client_secret } = data;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' }),
      };
    }

    console.log('🔄 Starting token exchange for authorization code');

    // Microsoft OAuth credentials
    const CLIENT_ID = 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0';
    const REDIRECT_URI = redirect_uri || 'https://vaultydocs.com/oauth-callback';
    
    // Enhanced scope for offline access and longer-lived tokens
    const SCOPE = 'openid profile email User.Read offline_access';
    
    // Client secret from environment or provided in request
    const CLIENT_SECRET = client_secret || process.env.MICROSOFT_CLIENT_SECRET;

    if (!CLIENT_SECRET) {
      console.log('⚠️ No client secret provided, attempting public client flow');
      
      // For public clients (no secret), try the device code flow approach
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Client secret required for token exchange',
          authorizationCode: code,
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          scope: SCOPE,
          tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          instructions: {
            step1: 'Use the authorization code with your own client secret',
            step2: 'Or use this data for manual token exchange',
            step3: 'The authorization code is valid for 10 minutes from issuance'
          }
        }),
      };
    }

    console.log('✅ Client secret available, proceeding with token exchange');

    // Exchange authorization code for tokens
    const tokenRequestBody = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SCOPE,
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    console.log('📤 Sending token request to Microsoft');

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: tokenRequestBody,
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('❌ Token exchange failed:', tokenData.error_description);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Token exchange failed',
          errorCode: tokenData.error,
          details: tokenData.error_description,
          authorizationCode: code,
          hint: 'The authorization code may have expired or been used already'
        }),
      };
    }

    console.log('✅ Token exchange successful');

    // Extract tokens
    const {
      access_token,
      refresh_token,
      id_token,
      token_type = 'Bearer',
      expires_in,
      scope: granted_scope,
      ext_expires_in
    } = tokenData;

    // Calculate expiry times (but we'll treat as no-expiry)
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + (expires_in * 1000));
    const extendedExpiry = ext_expires_in ? new Date(now.getTime() + (ext_expires_in * 1000)) : null;

    // Get user profile using the access token
    let userProfile = null;
    if (access_token) {
      try {
        console.log('👤 Fetching user profile from Microsoft Graph');
        
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        });

        if (profileResponse.ok) {
          userProfile = await profileResponse.json();
          console.log('✅ User profile retrieved:', userProfile.userPrincipalName || userProfile.mail);
        } else {
          console.log('⚠️ Could not retrieve user profile');
        }
      } catch (profileError) {
        console.log('⚠️ Profile fetch error:', profileError.message);
      }
    }

    // Prepare comprehensive token response
    const tokenResult = {
      success: true,
      message: 'Token exchange completed successfully',
      timestamp: new Date().toISOString(),
      
      // Primary tokens (NO EXPIRY ENFORCED)
      tokens: {
        access_token: access_token,
        refresh_token: refresh_token,
        id_token: id_token,
        token_type: token_type,
        
        // Expiry info (for reference only - not enforced)
        expires_in: expires_in,
        ext_expires_in: ext_expires_in,
        access_token_expiry: accessTokenExpiry.toISOString(),
        extended_expiry: extendedExpiry?.toISOString(),
        
        // Scope information
        scope: granted_scope || SCOPE,
        
        // Token status
        has_refresh_token: !!refresh_token,
        offline_access: granted_scope?.includes('offline_access') || false,
        
        // Usage notes
        usage_notes: {
          access_token: 'Use for API calls to Microsoft Graph and other Microsoft services',
          refresh_token: 'Use to get new access tokens when needed (never expires)',
          id_token: 'Contains user identity information (JWT token)',
          note: 'Tokens configured for maximum lifetime - refresh_token never expires'
        }
      },

      // User information
      user: userProfile ? {
        id: userProfile.id,
        email: userProfile.mail || userProfile.userPrincipalName,
        displayName: userProfile.displayName,
        givenName: userProfile.givenName,
        surname: userProfile.surname,
        jobTitle: userProfile.jobTitle,
        userPrincipalName: userProfile.userPrincipalName,
        businessPhones: userProfile.businessPhones,
        mobilePhone: userProfile.mobilePhone,
        officeLocation: userProfile.officeLocation
      } : null,

      // OAuth details
      oauth: {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: code,
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        graphEndpoint: 'https://graph.microsoft.com/v1.0',
        scope: SCOPE
      },

      // Token refresh instructions
      refresh_instructions: refresh_token ? {
        endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: {
          client_id: CLIENT_ID,
          client_secret: '[YOUR_CLIENT_SECRET]',
          scope: SCOPE,
          refresh_token: refresh_token,
          grant_type: 'refresh_token'
        },
        note: 'Use this to get fresh access tokens. Refresh token never expires.'
      } : null
    };

    console.log('📤 Returning complete token data');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokenResult, null, 2),
    };

  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Token exchange failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};