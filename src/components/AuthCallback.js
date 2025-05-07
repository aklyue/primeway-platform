import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load the token handling script
    const script = document.createElement('script');
    script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js';
    script.async = true;
    script.onload = () => {
      if (window.YaSendSuggestToken) {
        window.YaSendSuggestToken(
          'https://dev.platform.primeway.io/auth/callback',
          { status: 'success' }
        );
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Processing authentication...
    </div>
  );
};

export default AuthCallback;