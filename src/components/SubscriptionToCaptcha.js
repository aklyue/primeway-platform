// SubscriptionToCaptcha.jsx

import React from "react";
import { SmartCaptcha } from "@yandex/smart-captcha";
import { Modal, Box, Typography } from "@mui/material";

export const SubscriptionToCaptcha = ({ onSuccess, open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      BackdropProps={{
        style: { backgroundColor: "#202123" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          color: "#fff",
          outline: "none",
          borderRadius: "10px",
          backgroundColor: "#202123",
          p: 4,
        }}
      >
        <Typography
          id="modal-title"
          variant="h5"
          component="h2"
          sx={{ textAlign: "center", color: "white" }}
        >
          Подтвердите, что вы не робот
        </Typography>
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SmartCaptcha
            sitekey="ysc1_gqgKVnVKv2a4UJDjpKdVoIEJ7A13CfJRYEJsBwma03ab7254" // Замените на ваш реальный sitekey
            onSuccess={onSuccess}
          />
        </Box>
      </Box>
    </Modal>
  );
};