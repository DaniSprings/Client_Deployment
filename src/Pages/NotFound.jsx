import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Components/Footer.jsx';
import Forms from '../Components/Forms.jsx';
import Navbar from '../Components/Navbar.jsx';

function NotFound(){
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      navigate('/Home', { replace: true });
    }
  }, [navigate]);

  // If online we're redirecting, so don't render the 404 UI (prevents flicker)
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    return null;
  }

  return(
    <div>
      <Navbar />
      <h1>404 - Page Not Found</h1>
      <p>No Cars to Review Here.</p>
      <Footer />
    </div>
  );
}

export default NotFound;