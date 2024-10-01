import React, { createContext, useState, useEffect } from 'react';

// Create AuthContext
export const AuthContext = createContext();

// AuthProvider component to manage login state
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by checking the token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Function to log in the user (set token)
  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  // Function to log out the user (remove token)
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
