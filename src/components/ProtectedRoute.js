import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  // const { isLoggedIn } = useContext(AuthContext);
  // const isLoggedIn = true

  // if (!isLoggedIn) {
  //   // Redirect to login page if the user is not logged in
  //   return <Navigate to="/login" />;
  // }

  return children;
};

export default ProtectedRoute;
 