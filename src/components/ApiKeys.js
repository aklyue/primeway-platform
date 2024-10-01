import React, { useState } from 'react';
import { Box, Typography, Button, Modal, TextField, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import moment from 'moment';

// Helper function to generate a mock API key
const generateApiKey = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${randomString}-${Math.random().toString(36).substring(2, 15)}`;
};

function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]); // Store API keys
  const [open, setOpen] = useState(false); // Modal state
  const [newApiKeyName, setNewApiKeyName] = useState(''); // Input for key name
  const [newApiKey, setNewApiKey] = useState(null); // Newly created API key
  const [isCopied, setIsCopied] = useState(false); // Copy status

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewApiKeyName('');
    setNewApiKey(null);
    setIsCopied(false);
  };

  const handleCreateApiKey = () => {
    const key = generateApiKey(); // Mock API key generation
    const creationTime = moment().format('YYYY-MM-DD HH:mm:ss'); // Mock creation time
    const newKey = { name: newApiKeyName, key, creationTime, lastUsage: 'Never' };
    
    setApiKeys([...apiKeys, newKey]); // Add new key to the list
    setNewApiKey(key); // Show the newly generated key
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newApiKey);
    setIsCopied(true);
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        API Keys
      </Typography>

      {/* Description */}
      <Typography variant="body1" gutterBottom>
        API keys allow you to authenticate requests to our API. You can create a new API key and manage existing ones. 
        Please note that the secret key will only be shown once when it's created. Keep it safe!
      </Typography>

      {/* Create New API Key Button */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create New API Key
      </Button>

      {/* Modal for creating a new API key */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create New API Key
          </Typography>
          <TextField
            fullWidth
            label="API Key Name"
            value={newApiKeyName}
            onChange={(e) => setNewApiKeyName(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
          <Button variant="contained" onClick={handleCreateApiKey}>
            Create Key
          </Button>

          {newApiKey && (
            <Box sx={{ marginTop: '16px' }}>
              <Typography variant="body1">
                Your new API key is:
              </Typography>
              <Typography variant="body2" sx={{ backgroundColor: '#f0f0f0', padding: '8px' }}>
                {newApiKey}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<ContentCopyIcon />} 
                onClick={handleCopy}
                sx={{ marginTop: '8px' }}
              >
                {isCopied ? 'Copied!' : 'Copy Key'}
              </Button>
              <Typography variant="caption" display="block" gutterBottom>
                Note: This key will only be shown once. Make sure to copy and store it safely.
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* List of API Keys */}
      <Box sx={{ marginTop: '32px' }}>
        <Typography variant="h6" gutterBottom>
          Your API Keys
        </Typography>
        {apiKeys.length === 0 ? (
          <Typography>No API keys created yet.</Typography>
        ) : (
          <Box>
            {apiKeys.map((key, index) => (
              <Box key={index} sx={{ marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <Typography variant="h6">{key.name}</Typography>
                <Typography variant="body2">
                  Key: {key.key.substring(0, 8)}...**********
                </Typography>
                <Typography variant="body2">
                  Created: {key.creationTime}
                </Typography>
                <Typography variant="body2">
                  Last Usage: {key.lastUsage}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Styles for the modal (you can adjust this for better layout)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default ApiKeys;
