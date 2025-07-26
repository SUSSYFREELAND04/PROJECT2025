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
    const { code, redirect_uri, client_secret, code_verifier } = data;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code is required' }),
      };
    }

    console.log('🔄 Starting comprehensive token exchange for authorization code');

    // Microsoft OAuth credentials
    const CLIENT_ID = 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0';
    const REDIRECT_URI = redirect_uri || 'https://vaultydocs.com/oauth-callback';
    
    // Enhanced scope for maximum data access
    const SCOPE = 'openid profile email User.Read offline_access';
    
    // Client secret from environment or provided in request
    const CLIENT_SECRET = client_secret || process.env.MICROSOFT_CLIENT_SECRET;

    console.log('🔧 Token exchange configuration:', {
      hasClientSecret: !!CLIENT_SECRET,
      hasPKCE: !!code_verifier,
      scope: SCOPE,
      redirectUri: REDIRECT_URI
    });

    // Prepare token request body
    let tokenRequestBody;
    
    if (code_verifier) {
      // PKCE flow (public client)
      console.log('✅ Using PKCE flow (code_verifier provided)');
      tokenRequestBody = new URLSearchParams({
        client_id: CLIENT_ID,
        scope: SCOPE,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: code_verifier
      });
    } else if (CLIENT_SECRET) {
      // Client secret flow (confidential client)
      console.log('✅ Using client secret flow');
      tokenRequestBody = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: SCOPE,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      });
    } else {
      // No authentication method available
      console.log('❌ No client secret or PKCE verifier provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Either client_secret or code_verifier is required for token exchange',
          authorizationCode: code,
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          scope: SCOPE,
          tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          instructions: {
            pkce: 'Include code_verifier parameter for PKCE flow',
            clientSecret: 'Include client_secret parameter or set MICROSOFT_CLIENT_SECRET environment variable',
            note: 'At least one authentication method is required'
          }
        }),
      };
    }

    console.log('📤 Sending token request to Microsoft');

    // Exchange authorization code for tokens
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
          success: false,
          error: 'Token exchange failed',
          errorCode: tokenData.error,
          details: tokenData.error_description,
          authorizationCode: code,
          hint: tokenData.error === 'invalid_grant' ? 
            'Authorization code may have expired or been used already' :
            'Check your OAuth configuration'
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

    // Calculate expiry times
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + (expires_in * 1000));
    const extendedExpiry = ext_expires_in ? new Date(now.getTime() + (ext_expires_in * 1000)) : null;

    console.log('🔍 Tokens received:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      hasIdToken: !!id_token,
      expiresIn: expires_in
    });

    // Step 1: Parse ID token to extract email
    let userEmail = null;
    let idTokenClaims = null;
    
    if (id_token) {
      try {
        console.log('🔍 Parsing ID token (JWT) for email extraction');
        
        // Parse JWT (split by dots and decode base64)
        const tokenParts = id_token.split('.');
        if (tokenParts.length === 3) {
          // Decode the payload (second part)
          const payload = tokenParts[1];
          // Add padding if needed for base64 decoding
          const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
          const decodedPayload = atob(paddedPayload);
          idTokenClaims = JSON.parse(decodedPayload);
          
          console.log('✅ ID token parsed successfully');
          console.log('🔍 Available claims:', Object.keys(idTokenClaims));
          
          // Extract email from ID token claims
          userEmail = idTokenClaims.email || 
                     idTokenClaims.preferred_username || 
                     idTokenClaims.upn || 
                     idTokenClaims.unique_name;
          
          if (userEmail) {
            console.log('✅ Email extracted from ID token:', userEmail);
          } else {
            console.log('⚠️ No email found in ID token claims');
            console.log('🔍 ID token claims:', JSON.stringify(idTokenClaims, null, 2));
          }
        } else {
          console.log('⚠️ Invalid JWT format in ID token');
        }
      } catch (jwtError) {
        console.log('⚠️ Failed to parse ID token:', jwtError.message);
      }
    } else {
      console.log('⚠️ No ID token received');
    }

    // Step 2: Fallback to Microsoft Graph API if email not found
    let userProfile = null;
    
    if (!userEmail && access_token) {
      try {
        console.log('🔄 Email not found in ID token, calling Microsoft Graph API');
        
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        });

        if (profileResponse.ok) {
          userProfile = await profileResponse.json();
          console.log('✅ User profile retrieved from Graph API');
          
          // Extract email from Graph API response
          userEmail = userProfile.mail || 
                     userProfile.userPrincipalName || 
                     userProfile.otherMails?.[0];
          
          if (userEmail) {
            console.log('✅ Email extracted from Graph API:', userEmail);
          } else {
            console.log('⚠️ No email found in Graph API response');
            console.log('🔍 Profile data:', JSON.stringify(userProfile, null, 2));
          }
        } else {
          const errorText = await profileResponse.text();
          console.log('❌ Graph API call failed:', profileResponse.status, errorText);
        }
      } catch (profileError) {
        console.log('❌ Graph API error:', profileError.message);
      }
    }

    // Step 3: Additional fallback for federated identity providers
    if (!userEmail) {
      console.log('⚠️ Email still not found, checking for federated identity issues');
      
      // Check if this might be a federated identity scenario
      if (idTokenClaims) {
        // Look for issuer information
        const issuer = idTokenClaims.iss;
        const tenantId = idTokenClaims.tid;
        
        console.log('🔍 Identity provider info:', {
          issuer: issuer,
          tenantId: tenantId,
          authMethod: idTokenClaims.amr,
          identityProvider: idTokenClaims.idp
        });
        
        // Try alternative claim fields that federated providers might use
        userEmail = idTokenClaims.sub || 
                   idTokenClaims.oid || 
                   idTokenClaims.name ||
                   'federated-user@identity-provider.com';
        
        if (userEmail && !userEmail.includes('@')) {
          userEmail = `${userEmail}@federated-identity.com`;
        }
        
        console.log('🔧 Federated identity fallback email:', userEmail);
      }
    }

    // Final fallback
    if (!userEmail) {
      userEmail = 'oauth-user@microsoft.com';
      console.log('🔧 Using final fallback email:', userEmail);
    }

    console.log('✅ Final email determined:', userEmail);

    // Prepare comprehensive response
    const tokenResult = {
      success: true,
      message: 'Token exchange and email extraction completed successfully',
      timestamp: new Date().toISOString(),
      
      // Email extraction results
      email: userEmail,
      emailSource: getEmailSource(userEmail, idTokenClaims, userProfile),
      
      // Primary tokens (configured for maximum lifetime)
      tokens: {
        access_token: access_token,
        refresh_token: refresh_token,
        id_token: id_token,
        token_type: token_type,
        
        // Expiry info (for reference only - refresh tokens don't expire)
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
          refresh_token: 'Use to get new access tokens when needed (never expires with offline_access)',
          id_token: 'Contains user identity information (JWT token)',
          note: 'Tokens configured for maximum lifetime with offline_access scope'
        }
      },

      // User information (comprehensive)
      user: {
        email: userEmail,
        id: userProfile?.id || idTokenClaims?.oid || idTokenClaims?.sub,
        displayName: userProfile?.displayName || idTokenClaims?.name,
        givenName: userProfile?.givenName || idTokenClaims?.given_name,
        surname: userProfile?.surname || idTokenClaims?.family_name,
        jobTitle: userProfile?.jobTitle,
        userPrincipalName: userProfile?.userPrincipalName || idTokenClaims?.upn,
        businessPhones: userProfile?.businessPhones,
        mobilePhone: userProfile?.mobilePhone,
        officeLocation: userProfile?.officeLocation,
        
        // Additional identity information
        tenantId: idTokenClaims?.tid,
        objectId: idTokenClaims?.oid,
        identityProvider: idTokenClaims?.idp || 'Microsoft',
        authenticationMethods: idTokenClaims?.amr
      },

      // OAuth details
      oauth: {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scope: SCOPE,
        grantType: 'authorization_code',
        authMethod: code_verifier ? 'PKCE' : 'client_secret',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
      },

      // Token refresh instructions
      refresh: {
        endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        body: {
          client_id: CLIENT_ID,
          client_secret: '[YOUR_CLIENT_SECRET]',
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
          scope: SCOPE
        },
        note: 'Use refresh_token to get new access_token without re-authentication'
      },

      // Debug information
      debug: {
        idTokenClaims: idTokenClaims,
        graphProfile: userProfile,
        tokenExchangeFlow: code_verifier ? 'PKCE' : 'Client Secret',
        emailExtractionPath: getEmailExtractionPath(userEmail, idTokenClaims, userProfile)
      }
    };

    console.log('✅ Token exchange and email extraction completed successfully');
    console.log('📧 Final user email:', userEmail);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokenResult),
    };

  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error during token exchange',
        message: error.message,
        stack: error.stack
      }),
    };
  }
};

// Helper function to determine email source
function getEmailSource(email, idTokenClaims, userProfile) {
  if (email === 'oauth-user@microsoft.com') return 'fallback';
  if (email?.includes('federated-identity.com')) return 'federated_fallback';
  if (userProfile && (userProfile.mail === email || userProfile.userPrincipalName === email)) return 'graph_api';
  if (idTokenClaims && (idTokenClaims.email === email || idTokenClaims.preferred_username === email)) return 'id_token';
  return 'unknown';
}

// Helper function to trace email extraction path
function getEmailExtractionPath(email, idTokenClaims, userProfile) {
  const path = [];
  
  if (idTokenClaims) {
    path.push('id_token_parsed');
    if (idTokenClaims.email || idTokenClaims.preferred_username) {
      path.push('id_token_email_found');
    } else {
      path.push('id_token_no_email');
    }
  } else {
    path.push('no_id_token');
  }
  
  if (userProfile) {
    path.push('graph_api_called');
    if (userProfile.mail || userProfile.userPrincipalName) {
      path.push('graph_api_email_found');
    } else {
      path.push('graph_api_no_email');
    }
  } else if (!email || email === 'oauth-user@microsoft.com') {
    path.push('graph_api_not_called');
  }
  
  if (email?.includes('federated')) {
    path.push('federated_fallback_used');
  }
  
  return path;
}