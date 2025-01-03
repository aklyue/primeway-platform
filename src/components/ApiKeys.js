import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { OrganizationContext } from "./Organization/OrganizationContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";

import axiosInstance from "../api";

// Function to generate a new token for an organization
export const generateToken = async (organizationId, name) => {
  try {
    const response = await axiosInstance.post("/generate-token", {
      organization_id: organizationId,
      name,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

// Function to list tokens for an organization
export const listTokens = async (organizationId) => {
  try {
    const response = await axiosInstance.get("/list-tokens", {
      params: { organization_id: organizationId },
    });
    return response.data.tokens;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
};

// Function to delete a token
export const deleteToken = async (tokenId) => {
  try {
    await axiosInstance.delete(`/tokens/${tokenId}`);
  } catch (error) {
    console.error("Error deleting token:", error);
    throw error;
  }
};

function ApiKeys() {
  const { currentOrganization } = useContext(OrganizationContext);
  const [apiKeys, setApiKeys] = useState([]); // Store API keys
  const [open, setOpen] = useState(false); // Modal state
  const [newApiKey, setNewApiKey] = useState(null); // Newly created API key
  const [isCopied, setIsCopied] = useState(false); // Copy status
  const [loading, setLoading] = useState(false); // Loading state for listing tokens
  const [creating, setCreating] = useState(false); // Loading state for creating token
  const [error, setError] = useState(null); // Error state
  const [tokenName, setTokenName] = useState(""); // Name for the new token

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewApiKey(null);
    setIsCopied(false);
    setError(null);
    setTokenName("");
  };

  // Fetch tokens when the component mounts or when organizationId changes
  useEffect(() => {
    if (currentOrganization.id) {
      fetchTokens();
    }
  }, [currentOrganization.id]);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await listTokens(currentOrganization.id);
      setApiKeys(tokens);
    } catch (err) {
      setError("Failed to fetch API keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    setCreating(true);
    setError(null);
    try {
      const tokenData = await generateToken(
        currentOrganization.id,
        tokenName.trim()
      );
      setApiKeys((prevKeys) => [...prevKeys, tokenData]);
      setNewApiKey(tokenData.token);
      // Keep the modal open to show the new key
      // handleClose();
    } catch (err) {
      setError("Failed to create API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (tokenId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this API key?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await deleteToken(tokenId);
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== tokenId));
    } catch (err) {
      setError("Failed to delete API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setIsCopied(true);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API Keys
      </Typography>

      {/* Description */}
      <Typography variant="body1" gutterBottom>
        API keys allow you to authenticate requests to our API. You can create a
        new API key and manage existing ones. Please note that the secret key
        will only be shown once when it's created. Keep it safe!
      </Typography>

      {/* Create New API Key Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpen}
        sx={{ marginTop: "16px" }}
      >
        Create New API Key
      </Button>

      {/* Error Message */}
      {error && (
        <Typography variant="body2" color="error" sx={{ marginTop: "16px" }}>
          {error}
        </Typography>
      )}

      {/* Modal for creating a new API key */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="create-api-key-modal-title"
        aria-describedby="create-api-key-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography
            id="create-api-key-modal-title"
            variant="h6"
            component="h2"
          >
            Create New API Key
          </Typography>

          <Box sx={{ marginTop: "16px" }}>
            <Typography variant="body1">
              Enter a name for your API key (optional):
            </Typography>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "8px",
                marginBottom: "16px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
          </Box>
          <Box sx={{display:'flex', alignItems:'baseline', gap:'15px'}}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCreateApiKey}
              disabled={creating}
              sx={{ marginTop: "16px" }}
            >
              {creating ? <CircularProgress size={24} /> : "Create Key"}
            </Button>
            <Button onClick={handleClose} variant="outlined">Отмена</Button>
          </Box>
          {newApiKey && (
            <Box sx={{ marginTop: "16px" }}>
              <Typography variant="body1">Your new API key is:</Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: "background.default",
                  padding: "8px",
                  wordBreak: "break-all",
                }}
              >
                {newApiKey}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                sx={{ marginTop: "8px" }}
              >
                {isCopied ? "Copied!" : "Copy Key"}
              </Button>
              <Typography variant="caption" display="block" gutterBottom>
                Note: This key will only be shown once. Make sure to copy and
                store it safely.
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* List of API Keys */}
      <Box sx={{ marginTop: "32px" }}>
        <Typography variant="h6" gutterBottom>
          Your API Keys
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : apiKeys.length === 0 ? (
          <Typography>No API keys created yet.</Typography>
        ) : (
          <Box>
            {apiKeys.map((key) => (
              <Box
                key={key.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <Box>
                  <Typography variant="h6">{key.name}</Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    Token: {key.masked_token}
                  </Typography>
                  <Typography variant="body2">
                    Created:{" "}
                    {moment(key.created_at).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    aria-label="delete"
                    color="secondary"
                    onClick={() => handleDeleteApiKey(key.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Styles for the modal
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

export default ApiKeys;
