import React from "react";
import { Button } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

export default function ModelActions({
  isMobile,
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
        padding: isMobile ? "4px 4px" : "6px 18px",
        bgcolor: "#597ad3",
        "&:hover": {
          bgcolor: "#7c97de",
        },
        fontSize: isMobile ? "9px !important" : "14px",
      }}
    >
      {actionButtonText}
      <RocketLaunchOutlinedIcon
        sx={{ ml: 1, fontSize: isMobile ? 16 : 22, color: "#FFFFFF" }}
      />
    </Button>
  );
}
