import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { API_BASE, auth } from '../services/api.js';
import './LoginModal.css';

function LoginModal({ onClose, onSuccess, onFailure, onSignupClick }) {
  const [isLoading, setIsLoading] = useState(null); // 'google' | 'facebook' | null
  const [errorMsg, setErrorMsg] = useState('');
  const backdropRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    const firstFocusable = backdropRef.current?.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
  }, []);

  const handleSocialLogin = (provider) => {
    setErrorMsg('');
    setIsLoading(provider);

    const base = API_BASE || '';
    const url = `${base}/auth/${provider}`;
    const w = 600;
    const h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2.5;

    const popup = window.open(
      url,
      `${provider}-auth`,
      `width=${w},height=${h},left=${left},top=${top},resizable,scrollbars`
    );

    if (!popup) {
      setErrorMsg('Popup was blocked. Please allow popups for this site.');
      setIsLoading(null);
      return;
    }

    const pollInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollInterval);
        setIsLoading(null);

        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        if (userId) {
          onSuccess?.({ userId, username, provider });
        } else {
          const msg = 'Login did not complete. Please try again or sign up.';
          setErrorMsg(msg);
          onFailure?.(msg);
        }
      }
    }, 800);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="lm-backdrop modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lm-title"
      onClick={handleBackdropClick}
      ref={backdropRef}
    >
      <div className="lm-card">
        {/* Close button */}
        <button
          className="lm-close"
          aria-label="Close login modal"
          onClick={onClose}
        >
          ×
        </button>

        {/* Header */}
        <div className="lm-header">
          <div className="lm-icon-ring">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 id="lm-title" className="lm-title">Welcome back</h2>
          <p className="lm-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="lm-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {errorMsg}
          </div>
        )}

        {/* Social login buttons */}
        <div className="lm-social">
          {/* Google */}
          <button
            type="button"
            className="lm-btn lm-btn--google"
            onClick={() => handleSocialLogin('google')}
            disabled={!!isLoading}
            aria-busy={isLoading === 'google'}
          >
            {isLoading === 'google' ? (
              <span className="lm-spinner" aria-hidden="true" />
            ) : (
              <svg className="lm-btn-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M21.35 11.1h-9.2v2.89h5.28c-.23 1.34-1.07 2.47-2.28 3.22v2.68h3.68c2.16-1.99 3.42-4.93 3.42-8.79 0-.6-.05-1.18-.1-1.99z"/>
                <path fill="#34A853" d="M12.15 22c2.92 0 5.36-.97 7.14-2.62l-3.68-2.68c-1.03.7-2.35 1.12-3.46 1.12-2.67 0-4.93-1.8-5.74-4.22H3.3v2.64C5.08 19.94 8.36 22 12.15 22z"/>
                <path fill="#4A90E2" d="M6.41 13.62a6.99 6.99 0 010-3.24V7.74H3.3a10.85 10.85 0 000 8.52l3.11-2.64z"/>
                <path fill="#FBBC05" d="M12.15 6.4c1.58 0 3.01.54 4.13 1.6l3.09-3.05C17.5 2.9 15.06 2 12.15 2 8.36 2 5.08 4.06 3.3 7.36l3.11 2.64c.81-2.42 3.07-4.22 5.74-4.22z"/>
              </svg>
            )}
            <span>{isLoading === 'google' ? 'Connecting…' : 'Continue with Google'}</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            className="lm-btn lm-btn--facebook"
            onClick={() => handleSocialLogin('facebook')}
            disabled={!!isLoading}
            aria-busy={isLoading === 'facebook'}
          >
            {isLoading === 'facebook' ? (
              <span className="lm-spinner lm-spinner--white" aria-hidden="true" />
            ) : (
              <svg className="lm-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.3c0-2.2 1.3-3.4 3.2-3.4.9 0 1.8.16 1.8.16v2h-1c-1 0-1.3.62-1.3 1.3v1.5h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z"/>
              </svg>
            )}
            <span>{isLoading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="lm-divider">
          <span>or</span>
        </div>

        {/* Sign up CTA */}
        <div className="lm-signup-section">
          <p className="lm-signup-text">Don&apos;t have an account?</p>
          <button
            type="button"
            className="lm-btn lm-btn--signup"
            onClick={() => {
              onClose();
              onSignupClick?.();
            }}
            disabled={!!isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Create an account
          </button>
        </div>

        {/* Footer note */}
        <p className="lm-footer-note">
          By signing in you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  onSignupClick: PropTypes.func,
};

export default LoginModal;
