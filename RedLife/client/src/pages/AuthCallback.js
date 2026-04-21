import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AuthCallback({ setUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Decode JWT to get user info (basic)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Fetch full user info
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setUser(data.user);
            navigate('/');
          });
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/login');
      }
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="auth-loading">
      <h2>🔐 Logging you in...</h2>
      <p>Please wait while we complete your authentication</p>
    </div>
  );
}

export default AuthCallback;
