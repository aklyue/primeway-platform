import React from "react";
import { Button } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

export default function ModelActions({
  actionButtonHandler,
  actionButtonText,
  isActionButtonDisabled,
}) {
  return (
    <Button
      onClick={actionButtonHandler}
      disabled={isActionButtonDisabled}
      variant="outlined"
      sx={{
        color: "white",
        padding: "8px 16px",
        bgcolor: "#597ad3",
        "&:hover": {
          bgcolor: "#7c97de",
        },
      }}
    >
      {actionButtonText}
      <RocketLaunchOutlinedIcon
        sx={{ ml: 1, fontSize: 22, color: "#FFFFFF" }}
      />
    </Button>
  );
}
