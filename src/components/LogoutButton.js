import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      logout();
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
