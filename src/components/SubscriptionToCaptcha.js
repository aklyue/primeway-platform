import React from "react";
import { SmartCaptcha } from "@yandex/smart-captcha";
import { Modal, Box, Typography } from "@mui/material";

export const SubscriptionToCaptcha = ({ onSuccess, open }) => {
  return (
    <Modal
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      // sx={{zIndex:'99999'}}
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
          }}
        >
          <SmartCaptcha
            sitekey="ysc1_gqgKVnVKv2a4UJDjpKdVoIEJ7A13CfJRYEJsBwma03ab7254"
            onSuccess={onSuccess}
          />
        </Box>
      </Box>
    </Modal>
  );
};