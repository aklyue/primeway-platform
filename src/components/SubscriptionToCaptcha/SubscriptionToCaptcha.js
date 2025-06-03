import React, { useState } from "react";
import { SmartCaptcha } from "@yandex/smart-captcha";
import { Modal, Box, Typography, CircularProgress } from "@mui/material";

export const SubscriptionToCaptcha = ({ onSuccess, open }) => {
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      BackdropProps={{
        style: { backgroundColor: "#FFFFFF" },
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
          backgroundColor: "#FFFFFF",
          p: 4,
        }}
      >
        <Typography
          id="modal-title"
          variant="h5"
          component="h2"
          sx={{ textAlign: "center" }}
        >
          Подтвердите, что вы не робот
        </Typography>
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {!captchaLoaded && (
            <CircularProgress
              sx={{
                position: "absolute",
                top: "30%",
                left: "46%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          <SmartCaptcha
            sitekey="ysc1_gqgKVnVKv2a4UJDjpKdVoIEJ7A13CfJRYEJsBwma03ab7254"
            onSuccess={onSuccess}
            onLoad={() => setCaptchaLoaded(true)}
            style={!captchaLoaded ? { visibility: "hidden" } : {}}
          />
        </Box>
      </Box>
    </Modal>
  );
};