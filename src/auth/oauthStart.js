export async function startMicrosoftLogin() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem('pkce_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0',
    response_type: 'code',
    redirect_uri: 'https://vaultydocs.com/oauth-callback',
    response_mode: 'query',
    scope: 'openid profile email offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'login',
  });

  window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
}

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = window.crypto.getRandomValues(new Uint8Array(length));
  return [...randomValues].map(x => charset[x % charset.length]).join('');
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}