import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '../Components/LoginModal.jsx';
import SignupForm from '../Components/SignUpForm.jsx';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/Home';
  const [showSignup, setShowSignup] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Sign in to continue.');

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem', color: '#111' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Login</h1>
      <p style={{ marginBottom: '1rem', color: '#444' }}>
        Registered users can email compared car results directly from the compare page.
      </p>
      {statusMessage && <p role="status">{statusMessage}</p>}

      {!showSignup ? (
        <LoginModal
          onClose={() => navigate('/Home')}
          onSuccess={({ userId, username }) => {
            if (userId) {
              localStorage.setItem('userId', String(userId));
            }
            if (username) {
              localStorage.setItem('username', username);
            }
            setStatusMessage('Login successful. Redirecting...');
            navigate(redirectTo);
          }}
          onFailure={(msg) => setStatusMessage(msg || 'Login failed. Please try again.')}
          onSignupClick={() => setShowSignup(true)}
        />
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            width: 520,
            maxWidth: '95%',
            background: '#fff',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            aria-label="Back to login"
            onClick={() => setShowSignup(false)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
            }}
          >
            x
          </button>

          <SignupForm
            onSuccess={(data) => {
              const nextUserId = data?.userId || localStorage.getItem('userId');
              const nextUsername = data?.username || data?.email || localStorage.getItem('username');
              if (nextUserId) {
                localStorage.setItem('userId', String(nextUserId));
              }
              if (nextUsername) {
                localStorage.setItem('username', nextUsername);
              }
              setStatusMessage('Signup successful. Redirecting...');
              navigate(redirectTo);
            }}
            onFailure={(msg) => setStatusMessage(msg || 'Signup failed. Please try again.')}
          />
        </div>
      )}
    </div>
  );
}

export default Login;
