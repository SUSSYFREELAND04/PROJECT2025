import jwt_decode from 'jwt-decode';

(async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const verifier = sessionStorage.getItem('pkce_verifier');

  const res = await fetch('/.netlify/functions/tokenExchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier }),
  });

  const tokenData = await res.json();

  if (tokenData.error) {
    console.error('❌ Token exchange failed:', tokenData.error);
    return;
  }

  const user = jwt_decode(tokenData.id_token);
  console.log('✅ Logged in user:', {
    name: user.name,
    email: user.email || user.preferred_username,
  });

  // Optional: redirect to dashboard or store token
  // window.location.href = '/dashboard.html';
})();