/**
 * src/components/auth/GoogleAuthButton.jsx
 *
 * Drop-in Google Sign-In button for RevReview.
 *
 * Install:
 *   npm install @react-oauth/google
 *
 * Add to your .env:
 *   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
 *
 * USAGE:
 *   <GoogleAuthButton
 *     onSuccess={(userData) => dispatch(setUser(userData))}
 *     onError={(msg) => setError(msg)}
 *   />
 *
 * Wrap your app root (main.jsx / App.jsx) with GoogleOAuthProvider:
 *   import { GoogleOAuthProvider } from '@react-oauth/google';
 *   <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
 *     <App />
 *   </GoogleOAuthProvider>
 */

import { useGoogleLogin } from '@react-oauth/google';
import authApi from '../services/authApi.js';

/**
 * @param {object}   props
 * @param {function} props.onSuccess  - Called with the full auth payload on success
 * @param {function} props.onError    - Called with an error message string on failure
 * @param {string}   [props.label]    - Button text (default: "Continue with Google")
 * @param {boolean}  [props.disabled] - Disables the button
 */
export default function GoogleAuthButton({
  onSuccess,
  onError,
  label = 'Continue with Google',
  disabled = false,
}) {
  /**
   * The "auth-code" flow only yields an authorization code, which requires a
   * server-side exchange (with a client secret) that this backend doesn't
   * implement — codeResponse.code can never be turned into a user's email.
   *
   * The backend's /api/auth/social-login endpoint expects a real
   * provider/providerId/email/fullName payload, so we use the "implicit"
   * flow to get an access_token, then call Google's userinfo endpoint to
   * resolve the profile fields it needs.
   */
  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',

    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch Google profile.');
        }

        const profile = await userInfoRes.json();

        // authApi.socialLogin() already persists authToken/userId on success
        const result = await authApi.socialLogin(
          'google',
          profile.sub,
          profile.email,
          profile.name,
        );

        onSuccess?.(result);
      } catch (err) {
        console.error('[GoogleAuthButton] Social login failed:', err);
        onError?.(err?.message || 'Google sign-in failed. Please try again.');
      }
    },

    onError: (err) => {
      console.error('[GoogleAuthButton] Google OAuth error:', err);
      onError?.('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={disabled}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '10px',
        width:          '100%',
        padding:        '10px 16px',
        border:         '1px solid #dadce0',
        borderRadius:   '6px',
        background:     '#ffffff',
        color:          '#3c4043',
        fontSize:       '14px',
        fontWeight:     '500',
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.6 : 1,
        transition:     'background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = '#f8f9fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff';
      }}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

// Inline SVG — no extra icon library needed
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
