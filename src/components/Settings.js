import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';

function Settings() {
  // Mock user data
  const [userData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordChange = () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validate password match
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    // Mock API call to change password
    console.log('Password change request:', { currentPassword, newPassword });

    // Mock success message
    setSuccessMessage('Password successfully changed.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Display User Information */}
      <Box sx={{ marginBottom: '16px' }}>
        <Typography variant="h6" gutterBottom>Profile Information</Typography>
        <TextField
          fullWidth
          label="Name"
          value={userData.name}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: '16px' }}
        />
        <TextField
          fullWidth
          label="Email"
          value={userData.email}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: '16px' }}
        />
      </Box>

      {/* Password Change Section */}
      <Box>
        <Typography variant="h6">Change Password</Typography>
        <TextField
          fullWidth
          type="password"
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={{ marginBottom: '16px' }}
        />
        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ marginBottom: '16px' }}
        />
        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ marginBottom: '16px' }}
        />

        {/* Error and Success Messages */}
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: '16px' }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ marginBottom: '16px' }}>
            {successMessage}
          </Alert>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={handlePasswordChange}
        >
          Update Password
        </Button>
      </Box>
    </Box>
  );
}

export default Settings;
